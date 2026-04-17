import { NextRequest, NextResponse } from "next/server"
import { BedrockRuntimeClient, ConverseCommand } from "@aws-sdk/client-bedrock-runtime"
import { shouldSkipSecondaryBedrock } from "@/lib/structured-eligibility"

export const runtime = "nodejs"

/**
 * Newer Claude models on Bedrock often require invoking via an inference profile
 * (e.g. `us.*`) rather than the raw foundation model ID, otherwise Bedrock returns:
 * "Invocation ... with on-demand throughput isn’t supported".
 */
const DEFAULT_BEDROCK_MODEL_ID = "us.anthropic.claude-opus-4-5-20251101-v1:0"

function coerceRegion() {
  return process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || "us-east-1"
}

function sanitizeAwsErrorMessage(raw: string): string {
  const t = raw.trim()
  if (!t) return "Bedrock request failed."
  if (t.length > 600) return `${t.slice(0, 600)}…`
  return t
}

function sanitizeLambdaErrorMessage(raw: string): string {
  const t = raw.trim()
  if (!t) return "Lambda request failed."
  if (t.length > 600) return `${t.slice(0, 600)}…`
  return t
}

function parseJsonOrUndefined(raw: string): unknown | undefined {
  try {
    return JSON.parse(raw)
  } catch {
    return undefined
  }
}

function isProtocolLambdaOutput(
  x: unknown
): x is {
  protocols_evaluated: Array<{
    protocol_id: string
    eligible?: boolean
    score?: number
    matched_criteria?: string[]
    failed_criteria?: string[]
  }>
} {
  if (!x || typeof x !== "object") return false
  const obj = x as Record<string, unknown>
  if (!Array.isArray(obj.protocols_evaluated)) return false
  return obj.protocols_evaluated.every((p) => {
    if (!p || typeof p !== "object") return false
    const r = p as Record<string, unknown>
    return typeof r.protocol_id === "string"
  })
}

export async function POST(req: NextRequest) {
  try {
    const { patientName, payload } = (await req.json()) as { patientName?: string; payload?: string }

    if (!patientName) {
      return NextResponse.json({ error: "patientName is required" }, { status: 400 })
    }

    const keyId = process.env.AWS_ACCESS_KEY_ID?.trim()
    const secret = process.env.AWS_SECRET_ACCESS_KEY?.trim()
    const region = coerceRegion()
    if (!keyId || !secret) {
      return NextResponse.json(
        { error: "AWS credentials are missing. Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY." },
        { status: 500 }
      )
    }

    const lambdaUrl = process.env.DEFAULT_API_ENDPOINT?.trim()
    if (!lambdaUrl) {
      return NextResponse.json(
        { error: "Lambda URL is missing. Set DEFAULT_API_ENDPOINT to your Lambda Function URL." },
        { status: 500 }
      )
    }

    // 1) Send the patient payload to Lambda (your eligibility engine).
    const lambdaBody = typeof payload === "string" ? payload : ""
    const lambdaJson = parseJsonOrUndefined(lambdaBody)
    const lambdaReqBody =
      lambdaJson !== undefined
        ? lambdaJson
        : {
            input: lambdaBody,
          }

    const lambdaRes = await fetch(lambdaUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(lambdaReqBody),
      // don't cache Lambda results in Next.js
      cache: "no-store",
    })

    let lambdaOutput: unknown
    try {
      lambdaOutput = await lambdaRes.json()
    } catch {
      const t = await lambdaRes.text().catch(() => "")
      return NextResponse.json(
        { error: sanitizeLambdaErrorMessage(`Lambda returned non-JSON response (${lambdaRes.status}): ${t}`) },
        { status: 502 }
      )
    }

    if (!lambdaRes.ok) {
      return NextResponse.json(
        {
          error: sanitizeLambdaErrorMessage(
            `Lambda error (${lambdaRes.status}): ${typeof lambdaOutput === "string" ? lambdaOutput : JSON.stringify(lambdaOutput)}`
          ),
        },
        { status: 502 }
      )
    }

    // Bedrock eligibility Lambda may return fully structured JSON; skip the secondary explanation pass.
    if (shouldSkipSecondaryBedrock(lambdaOutput)) {
      return NextResponse.json({ text: "", lambdaOutput })
    }

    // 2) Send Lambda JSON output to Bedrock to get a human-friendly explanation.
    const client = new BedrockRuntimeClient({
      region,
      // credentials resolved from env/instance profile/etc
    })

    const modelId = process.env.BEDROCK_MODEL_ID?.trim() || DEFAULT_BEDROCK_MODEL_ID

    const perProtocol = isProtocolLambdaOutput(lambdaOutput)
    const system = [
      {
        text: perProtocol
          ? [
              "You are a clinical trial eligibility analyst.",
              "You will be given a JSON output produced by an eligibility Lambda that contains a list of evaluated protocols.",
              "Respond in plain English (NOT JSON).",
              "",
              "For EACH protocol, output this exact structure:",
              "Protocol: <protocol_id>",
              "Eligibility: Eligible | Ineligible | Needs Review",
              "Reasons eligible:",
              "- <bullet>",
              "Reasons ineligible:",
              "- <bullet>",
              "",
              "Rules:",
              "- Base your answer ONLY on the Lambda output JSON. Do not use any external knowledge.",
              "- Use Lambda `matched_criteria` as 'Reasons eligible' and `failed_criteria` as 'Reasons ineligible'.",
              "- If both lists are empty or the Lambda indicates missing/insufficient data, set Eligibility to 'Needs Review' and say what is missing based on the Lambda output.",
              "- Do not invent criteria. Keep bullets short and concrete.",
            ].join("\n")
          : [
              "You are a clinical trial eligibility analyst. You will be given a JSON output from an eligibility Lambda.",
              "Respond in plain English (NOT JSON) using this exact format:",
              "",
              "Eligibility: Eligible|Ineligible|Unknown",
              "Why:",
              "- <bullet>",
              "- <bullet>",
              "",
              "Rules:",
              "- Base your answer ONLY on the Lambda output JSON.",
              "- If the Lambda output indicates missing data, use Eligibility: Unknown.",
              "- Keep it short and concrete.",
            ].join("\n"),
      },
    ]

    const userText = perProtocol
      ? `Patient: ${patientName}\n\nLambda output JSON:\n${JSON.stringify(lambdaOutput, null, 2)}\n\nTask: For each protocol, explain why the patient is eligible/ineligible based strictly on matched_criteria/failed_criteria.`
      : `Patient: ${patientName}\n\nLambda output JSON:\n${JSON.stringify(lambdaOutput, null, 2)}\n\nTask: Summarize eligibility and explain why.`

    const cmd = new ConverseCommand({
      modelId,
      system,
      messages: [
        {
          role: "user",
          content: [{ text: userText }],
        },
      ],
      inferenceConfig: {
        maxTokens: perProtocol ? 1400 : 800,
        temperature: 0.2,
      },
    })

    const res = await client.send(cmd)
    const text =
      res.output?.message?.content
        ?.map((c) => ("text" in c ? c.text : ""))
        .filter(Boolean)
        .join("\n") ?? ""
    return NextResponse.json({ text, lambdaOutput })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to analyze"
    return NextResponse.json({ error: sanitizeAwsErrorMessage(message) }, { status: 500 })
  }
}

