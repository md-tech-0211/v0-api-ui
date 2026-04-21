/**
 * Repair truncated JSON from Lumos-style structured outputs where the model
 * stops mid-object (often the last entry in `policies`). Uses string-aware
 * brace scanning so braces inside JSON strings do not break parsing.
 */

function stripCodeFences(text: string): string {
  const t = text.trim()
  const fenced = t.match(/^```(?:json)?\s*([\s\S]*?)```$/m)
  if (fenced) return fenced[1].trim()
  return t
}

/** Returns end index (exclusive) after the matching `}` for `{` at `start`, or -1 if incomplete. */
function scanJsonObjectEnd(s: string, start: number): number {
  if (start >= s.length || s[start] !== "{") return -1
  let depth = 0
  let inString = false
  let escape = false

  for (let p = start; p < s.length; p++) {
    const c = s[p]
    if (escape) {
      escape = false
      continue
    }
    if (inString) {
      if (c === "\\") {
        escape = true
        continue
      }
      if (c === '"') inString = false
      continue
    }
    if (c === '"') {
      inString = true
      continue
    }
    if (c === "{") depth++
    else if (c === "}") {
      depth--
      if (depth === 0) return p + 1
    }
  }
  return -1
}

/**
 * After `"policies":`, finds `[` and collects complete top-level objects inside the array.
 * Drops a trailing incomplete object (truncated stream).
 */
function extractCompletePolicyObjects(s: string, arrayBracketIndex: number): string[] {
  if (arrayBracketIndex >= s.length || s[arrayBracketIndex] !== "[") return []

  let i = arrayBracketIndex + 1
  const elements: string[] = []

  while (i < s.length) {
    while (i < s.length && /\s/.test(s[i])) i++
    if (i >= s.length) break
    if (s[i] === "]") break
    if (s[i] !== "{") break

    const end = scanJsonObjectEnd(s, i)
    if (end === -1) break

    elements.push(s.slice(i, end))
    i = end

    while (i < s.length && /\s/.test(s[i])) i++
    if (i >= s.length) break
    if (s[i] === ",") {
      i++
      continue
    }
    if (s[i] === "]") break
    break
  }

  return elements
}

function findPoliciesArrayBracketIndex(s: string): number {
  const key = '"policies"'
  let from = 0
  while (from < s.length) {
    const idx = s.indexOf(key, from)
    if (idx === -1) return -1
    const afterKey = idx + key.length
    let i = afterKey
    while (i < s.length && /\s/.test(s[i])) i++
    if (s[i] !== ":") {
      from = idx + 1
      continue
    }
    i++
    while (i < s.length && /\s/.test(s[i])) i++
    if (s[i] === "[") return i
    from = idx + 1
  }
  return -1
}

/**
 * If `s` looks like `{ ... "policies": [ {...}, ... incomplete`, rebuild JSON with only complete policy objects.
 */
export function repairTruncatedLumosPoliciesJson(s: string): string | null {
  const bracketIdx = findPoliciesArrayBracketIndex(s)
  if (bracketIdx === -1) return null

  const objs = extractCompletePolicyObjects(s, bracketIdx)
  if (objs.length === 0) return null

  const prefix = s.slice(0, bracketIdx)
  const inner = objs.join(",")
  return `${prefix}[${inner}]}`
}

export function parseJsonTolerant(text: string): { ok: true; value: unknown } | { ok: false; error: string } {
  const cleaned = stripCodeFences(text)
  if (!cleaned) return { ok: false, error: "empty" }

  try {
    return { ok: true, value: JSON.parse(cleaned) }
  } catch (e1) {
    const repaired = repairTruncatedLumosPoliciesJson(cleaned)
    if (repaired) {
      try {
        return { ok: true, value: JSON.parse(repaired) }
      } catch (e2) {
        return {
          ok: false,
          error: `repair failed: ${e2 instanceof Error ? e2.message : String(e2)}`,
        }
      }
    }
    return {
      ok: false,
      error: e1 instanceof Error ? e1.message : String(e1),
    }
  }
}
