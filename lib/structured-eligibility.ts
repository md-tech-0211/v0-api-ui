export type Validity = "eligible" | "ineligible" | "conditionally_eligible"

export type PolicyAssessment = {
  policy_name: string
  domain: string
  validity: string
  screening_decision: string
  reasons_for_validity: string[]
  reasons_against_validity: string[]
  minimum_gap_to_eligibility: string | null
  hard_lifetime_exclusion: boolean
  needs_crc_clarification: boolean
  crc_notes: string[]
}

export type StructuredEligibility = {
  schema_version?: string
  patient_profile_summary: string
  policies: PolicyAssessment[]
  final_recommendation: {
    refer_immediately: string[]
    revisit_when: { policy_name: string; when: string }[]
    no_eligibility_path: string[]
  }
}

export type BedrockStructuredEnvelope = {
  structured: StructuredEligibility | null
  parse_error?: string
  unparsed_model_output?: string
}

function isStructuredEligibility(x: unknown): x is StructuredEligibility {
  if (!x || typeof x !== "object") return false
  const o = x as Record<string, unknown>
  return Array.isArray(o.policies) && typeof o.patient_profile_summary === "string"
}

/** Normalize API response: `structured` may live on the root (proxy) or under `lambdaOutput` (analyze route). */
export function extractBedrockStructuredEnvelope(data: unknown): BedrockStructuredEnvelope | null {
  if (!data || typeof data !== "object") return null
  const d = data as Record<string, unknown>

  const pick = (src: Record<string, unknown>): BedrockStructuredEnvelope | null => {
    const has =
      "structured" in src ||
      typeof src.parse_error === "string" ||
      src.skipSecondaryBedrock === true
    if (!has) return null
    const structured = isStructuredEligibility(src.structured) ? src.structured : null
    return {
      structured,
      parse_error: typeof src.parse_error === "string" ? src.parse_error : undefined,
      unparsed_model_output:
        typeof src.unparsed_model_output === "string" ? src.unparsed_model_output : undefined,
    }
  }

  const direct = pick(d)
  if (direct) return direct

  const lo = d.lambdaOutput
  if (lo && typeof lo === "object") return pick(lo as Record<string, unknown>)

  return null
}

export function shouldSkipSecondaryBedrock(lambdaOutput: unknown): boolean {
  if (!lambdaOutput || typeof lambdaOutput !== "object") return false
  const o = lambdaOutput as Record<string, unknown>
  if (o.skipSecondaryBedrock === true) return true
  const s = o.structured
  if (s && typeof s === "object" && Array.isArray((s as Record<string, unknown>).policies)) {
    return true
  }
  return false
}

/** Maps API values to three UI buckets; insufficient data is folded into conditional. */
export function normalizeValidity(raw: string): Validity {
  const v = raw.trim().toLowerCase().replace(/\s+/g, "_")
  if (v === "eligible") return "eligible"
  if (v === "ineligible") return "ineligible"
  if (v === "conditionally_eligible") return "conditionally_eligible"
  if (v === "insufficient_data") return "conditionally_eligible"
  return "ineligible"
}
