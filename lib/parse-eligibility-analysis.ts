export type ParsedEligibility = "eligible" | "ineligible" | "needs_review" | "unknown"

export type ParsedProtocolFromAnalysis = {
  protocolName: string
  eligibility: ParsedEligibility
  eligibleReasons: string[]
  ineligibleReasons: string[]
}

export type ParsedEligibilityAnalysis = {
  patient?: string
  protocols: ParsedProtocolFromAnalysis[]
}

function normalizeEligibility(raw: string): ParsedEligibility {
  const t = raw.toLowerCase()
  if (t.includes("ineligible")) return "ineligible"
  if (t.includes("needs review")) return "needs_review"
  if (t.includes("eligible")) return "eligible"
  return "unknown"
}

function extractBulletLines(blob: string): string[] {
  return blob
    .split(/\r?\n/)
    .map((line) =>
      line
        .replace(/^\s*[-•*]\s*/, "")
        .replace(/^\s*\d+[.)]\s*/, "")
        .trim()
    )
    .filter((line) => {
      if (!line) return false
      if (/^none\b/i.test(line)) return false
      if (/^n\/a\b/i.test(line)) return false
      if (/^not applicable\b/i.test(line)) return false
      return true
    })
}

function parseProtocolChunk(chunk: string): ParsedProtocolFromAnalysis | null {
  const idx = chunk.search(/Reasons eligible:/i)
  if (idx < 0) return null

  const head = chunk.slice(0, idx).trim()
  const afterReasonsEligible = chunk.slice(idx)

  const headerMatch = head.match(/^Protocol:\s*([\s\S]+?)\s+Eligibility:\s*([\s\S]+)$/)
  if (!headerMatch) return null

  const protocolName = headerMatch[1].trim()
  const eligibility = normalizeEligibility(headerMatch[2].trim())

  const eligibleSplit = afterReasonsEligible.split(/Reasons eligible:/i)
  const afterEligibleLabel = eligibleSplit[1] ?? ""
  const ineligibleSplit = afterEligibleLabel.split(/Reasons ineligible:/i)
  const eligibleBlob = ineligibleSplit[0] ?? ""
  const ineligibleBlob = ineligibleSplit[1] ?? ""

  return {
    protocolName,
    eligibility,
    eligibleReasons: extractBulletLines(eligibleBlob),
    ineligibleReasons: extractBulletLines(ineligibleBlob),
  }
}

/**
 * Parses the plain-English Bedrock output used by /api/analyze (per-protocol blocks).
 */
export function parseEligibilityAnalysisText(rawText: string): ParsedEligibilityAnalysis {
  /** Bedrock sometimes wraps headings in Markdown bold (`**Protocol:**`). Strip for reliable parsing. */
  const text = rawText.replace(/\*\*([^*]+)\*\*/g, "$1")

  const patient =
    text.match(/Eligibility Analysis for Patient:\s*([^\n\r]+)/i)?.[1]?.trim() ??
    text.match(/Patient:\s*([^\n\r]+)/i)?.[1]?.trim()

  const protocolStarts: number[] = []
  const re = /^\s*Protocol:\s/gm
  let m: RegExpExecArray | null
  while ((m = re.exec(text)) !== null) {
    protocolStarts.push(m.index)
  }

  if (protocolStarts.length === 0) {
    return { patient, protocols: [] }
  }

  const chunks = protocolStarts.map((start, i) =>
    text.slice(start, protocolStarts[i + 1] ?? text.length).trim()
  )

  const protocols = chunks
    .map(parseProtocolChunk)
    .filter((p): p is ParsedProtocolFromAnalysis => p !== null)

  return { patient, protocols }
}

export type LambdaProtocolEval = {
  protocol_id: string
  eligible?: boolean
  score?: number
  matched_criteria?: string[]
  failed_criteria?: string[]
}

export function isLambdaProtocolsEvaluated(
  x: unknown
): x is { protocols_evaluated: LambdaProtocolEval[] } {
  if (!x || typeof x !== "object") return false
  const obj = x as Record<string, unknown>
  if (!Array.isArray(obj.protocols_evaluated)) return false
  return obj.protocols_evaluated.every((p) => {
    if (!p || typeof p !== "object") return false
    return typeof (p as Record<string, unknown>).protocol_id === "string"
  })
}

function scoreToPercent(score: number | undefined): number | undefined {
  if (score == null || !Number.isFinite(score)) return undefined
  const s = score > 1 ? score / 100 : score
  const pct = Math.round(s * 100)
  return Math.max(0, Math.min(100, pct))
}

function findBestLambdaMatch(
  protocolName: string,
  evals: LambdaProtocolEval[]
): LambdaProtocolEval | undefined {
  const n = protocolName.toLowerCase().trim()
  if (!n) return undefined

  for (const e of evals) {
    const id = e.protocol_id.toLowerCase().trim()
    if (id && n.includes(id)) return e
  }

  let best: LambdaProtocolEval | undefined
  let bestScore = 0
  for (const e of evals) {
    const id = e.protocol_id.toLowerCase()
    const parts = id.split(/[^a-z0-9]+/i).filter((t) => t.length >= 4)
    let overlap = 0
    for (const t of parts) {
      if (n.includes(t)) overlap++
    }
    if (overlap > bestScore) {
      bestScore = overlap
      best = e
    }
  }
  if (bestScore > 0) return best

  const words = n.split(/\s+/).filter((w) => w.length >= 5)
  for (const e of evals) {
    const id = e.protocol_id.toLowerCase()
    for (const w of words) {
      if (id.includes(w)) return e
    }
  }
  return undefined
}

export function fallbackScorePercent(p: ParsedProtocolFromAnalysis): number {
  if (p.eligibility === "eligible") return 100
  if (p.eligibility === "needs_review") return 55
  if (p.eligibility === "ineligible") {
    const n = p.ineligibleReasons.length
    return Math.max(8, 35 - Math.min(27, n * 9))
  }
  return 40
}

export function attachLambdaScores(
  protocols: ParsedProtocolFromAnalysis[],
  lambdaOutput: unknown
): Array<ParsedProtocolFromAnalysis & { scorePercent: number; scoreFromLambda: boolean }> {
  if (!isLambdaProtocolsEvaluated(lambdaOutput)) {
    return protocols.map((p) => ({
      ...p,
      scorePercent: fallbackScorePercent(p),
      scoreFromLambda: false,
    }))
  }

  const evals = lambdaOutput.protocols_evaluated

  return protocols.map((p) => {
    const match = findBestLambdaMatch(p.protocolName, evals)
    const pct = scoreToPercent(match?.score)
    if (pct != null) {
      return { ...p, scorePercent: pct, scoreFromLambda: true }
    }
    return {
      ...p,
      scorePercent: fallbackScorePercent(p),
      scoreFromLambda: false,
    }
  })
}
