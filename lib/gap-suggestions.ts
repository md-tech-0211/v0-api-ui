/**
 * Actionable prompts to improve documentation / data for a failed eligibility criterion.
 */
export function gapSuggestions(reason: string): string[] {
  const r = reason.toLowerCase()

  if (r.includes("not documented") || r.includes("not confirmed") || r.includes("no confirmed")) {
    const cleaned = reason.replace(/\s+not documented\s*$/i, "").trim()
    return [
      `Capture/attach documentation for: ${cleaned || reason}`,
      "Confirm this item via chart review or clinician note, then re-run eligibility.",
    ]
  }

  if (r.includes("score") && (r.includes("not documented") || r.includes("not provided"))) {
    return [
      "Administer the named scale and record the total score.",
      "Add the scored result to the intake record, then re-run eligibility.",
    ]
  }

  if (r.includes("status not documented") || r.includes("status unknown")) {
    return [
      "Ask screening questions to determine status and record the outcome.",
      "If positive, document timing/severity; if negative, document explicit denial.",
    ]
  }

  return [
    "Collect the missing information implied by this gap and document it.",
    "Re-run eligibility after updating the record.",
  ]
}
