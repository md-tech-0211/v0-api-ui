"use client"

import { useMemo, useState } from "react"
import { ChevronDown, ChevronUp, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  attachLambdaScores,
  parseEligibilityAnalysisText,
  type ParsedEligibility,
} from "@/lib/parse-eligibility-analysis"

type Row = ReturnType<typeof attachLambdaScores>[number]

function scoreBarColor(pct: number): string {
  if (pct >= 70) return "bg-success"
  if (pct >= 40) return "bg-warning"
  return "bg-destructive"
}

function scoreTextColor(pct: number): string {
  if (pct >= 70) return "text-success"
  if (pct >= 40) return "text-warning"
  return "text-destructive"
}

function eligibilityLabel(e: ParsedEligibility): string {
  switch (e) {
    case "eligible":
      return "Eligible"
    case "ineligible":
      return "Ineligible"
    case "needs_review":
      return "Needs review"
    default:
      return "Unknown"
  }
}

function gapSuggestions(ineligibleReasons: string[]): string[] {
  const out: string[] = []
  for (const r of ineligibleReasons) {
    const t = r.trim()
    if (t) out.push(`Work toward resolving: ${t}`)
  }
  if (out.length === 0) return []
  out.push("If gaps are due to missing documentation, gather the required records or assessments and re-run screening.")
  return out
}

function ProtocolRow({ row, index }: { row: Row; index: number }) {
  const [open, setOpen] = useState(false)
  const [gapOpen, setGapOpen] = useState(false)

  const pct = row.scorePercent
  const isEligible = row.eligibility === "eligible"
  const primaryReasons = isEligible ? row.eligibleReasons : row.ineligibleReasons
  const gaps = !isEligible ? gapSuggestions(row.ineligibleReasons) : []

  return (
    <div
      className={cn(
        "rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm",
        "shadow-sm transition-colors hover:border-border/80 hover:bg-card/75"
      )}
      style={{
        animationDelay: `${index * 40}ms`,
        animation: "fadeInUp 0.35s ease-out forwards",
        opacity: 0,
      }}
    >
      <div className="flex items-center justify-between gap-3 p-4">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground leading-snug line-clamp-2">
            {row.protocolName}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {eligibilityLabel(row.eligibility)}
            {row.scoreFromLambda ? "" : " · estimated score"}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex flex-col items-end gap-1">
            <span className={cn("text-xs font-semibold tabular-nums", scoreTextColor(pct))}>{pct}%</span>
            <div className="w-28 sm:w-36 h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all duration-500", scoreBarColor(pct))}
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="flex w-28 sm:w-36 justify-between text-[10px] text-muted-foreground tabular-nums">
              <span>0</span>
              <span>100</span>
            </div>
          </div>

          <button
            type="button"
            aria-expanded={open}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg border border-border/50",
              "text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            )}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border/50 px-4 pb-4 pt-2 space-y-3">
          <div>
            <p className="text-xs font-medium text-foreground mb-2">
              {isEligible ? "Eligibility criteria" : "Ineligibility criteria"}
            </p>
            {primaryReasons.length > 0 ? (
              <ul className="space-y-1.5">
                {primaryReasons.map((line, i) => (
                  <li
                    key={i}
                    className={cn(
                      "text-xs rounded-lg px-2.5 py-1.5 border leading-relaxed",
                      isEligible
                        ? "bg-success/5 border-success/20 text-muted-foreground"
                        : "bg-destructive/5 border-destructive/20 text-muted-foreground"
                    )}
                  >
                    {line}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-muted-foreground">No items listed.</p>
            )}
          </div>

          {!isEligible && gaps.length > 0 && (
            <div className="space-y-2">
              <button
                type="button"
                className={cn(
                  "inline-flex items-center gap-2 rounded-lg border border-border/50 bg-card/70 px-3 py-2",
                  "text-xs font-medium hover:bg-card transition-colors"
                )}
                onClick={() => setGapOpen((v) => !v)}
              >
                <Sparkles className="h-3.5 w-3.5" />
                {gapOpen ? "Hide gap analysis" : "Gap analysis"}
              </button>
              {gapOpen && (
                <div className="rounded-lg border border-border/50 bg-muted/15 p-3">
                  <p className="text-xs font-medium text-foreground mb-2">Paths to improve eligibility</p>
                  <ul className="space-y-1">
                    {gaps.map((g, i) => (
                      <li key={i} className="text-xs text-muted-foreground leading-relaxed">
                        — {g}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}

type Props = {
  analysisText: string
  lambdaOutput: unknown
  patientFallback?: string
}

export function EligibilityAnalysisCards({ analysisText, lambdaOutput, patientFallback }: Props) {
  const { patient, rows } = useMemo(() => {
    const parsed = parseEligibilityAnalysisText(analysisText)
    const rows = attachLambdaScores(parsed.protocols, lambdaOutput)
    return { patient: parsed.patient, rows }
  }, [analysisText, lambdaOutput])

  const displayPatient = patient ?? patientFallback

  if (rows.length === 0) {
    return null
  }

  return (
    <div className="space-y-4 p-1">
      {displayPatient && (
        <div className="rounded-xl border border-border/40 bg-muted/10 px-4 py-3">
          <p className="text-sm text-foreground">
            <span className="text-muted-foreground">Patient</span>{" "}
            <span className="font-semibold">{displayPatient}</span>
          </p>
          <p className="text-xs text-muted-foreground mt-1">{rows.length} protocols evaluated</p>
        </div>
      )}

      <div className="space-y-3 max-h-[640px] overflow-y-auto pr-1">
        {rows.map((row, i) => (
          <ProtocolRow key={`${row.protocolName}-${i}`} row={row} index={i} />
        ))}
      </div>
    </div>
  )
}
