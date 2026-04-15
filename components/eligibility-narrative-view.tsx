"use client"

import { useState } from "react"
import { AlertCircle, CheckCircle2, ChevronDown, HelpCircle, XCircle } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ScoreDisplay } from "@/components/protocol-card"
import type { ParsedEligibility, ParsedProtocolFromAnalysis } from "@/lib/parse-eligibility-analysis"

export type EligibilityNarrativeRow = ParsedProtocolFromAnalysis & {
  scorePercent: number
  scoreFromLambda: boolean
}

function eligibilitySummary(eligibility: ParsedEligibility): string {
  switch (eligibility) {
    case "eligible":
      return "This protocol’s criteria appear satisfied based on the analysis below."
    case "needs_review":
      return "Eligibility could not be fully determined from the available data. Review the items below."
    case "ineligible":
      return "This protocol’s criteria are not satisfied for this subject based on the analysis below."
    default:
      return "Review the eligibility details below."
  }
}

function EligibilityBadge({ eligibility }: { eligibility: ParsedEligibility }) {
  if (eligibility === "eligible") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md bg-success/15 px-2 py-0.5 text-xs font-semibold text-success">
        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
        Eligible
      </span>
    )
  }
  if (eligibility === "needs_review") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-500/15 px-2 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
        <HelpCircle className="h-3.5 w-3.5 shrink-0" />
        Needs review
      </span>
    )
  }
  if (eligibility === "ineligible") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive">
        <XCircle className="h-3.5 w-3.5 shrink-0" />
        Ineligible
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
      Unknown
    </span>
  )
}

function gapSuggestions(reason: string): string[] {
  const r = reason.toLowerCase()

  // Heuristics: convert "not documented/confirmed" into actionable data collection prompts.
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

function NarrativeProtocolCard({ row, index }: { row: EligibilityNarrativeRow; index: number }) {
  const [open, setOpen] = useState(false)
  const [gapOpen, setGapOpen] = useState(false)
  const score01 = row.scorePercent / 100
  const hasMatched = row.eligibleReasons.length > 0
  const hasFailed = row.ineligibleReasons.length > 0

  const showEligibleReasons = row.eligibility === "eligible"
  const showIneligibleReasons = row.eligibility === "ineligible"
  const showBoth = !(showEligibleReasons || showIneligibleReasons)

  return (
    <div
      className={cn(
        "rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm shadow-sm",
        "transition-colors duration-200 hover:border-border hover:bg-card/80",
        open && "border-border bg-card/80 ring-1 ring-ring/10"
      )}
      style={{
        animationDelay: `${index * 45}ms`,
        animation: "narrativeCardIn 0.35s ease-out forwards",
        opacity: 0,
      }}
    >
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Protocol</p>
          <h3
            className="text-sm font-semibold leading-snug text-foreground break-words sm:break-words"
            title={row.protocolName}
          >
            {row.protocolName}
          </h3>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1 sm:flex-row sm:items-center sm:gap-3">
          <ScoreDisplay score={score01} />
        </div>
      </div>

      <Collapsible
        open={open}
        onOpenChange={(next) => {
          setOpen(next)
          if (!next) setGapOpen(false)
        }}
      >
        <div className="border-t border-border/50 px-2 pb-2 pt-0">
          <CollapsibleTrigger
            className={cn(
              "flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left",
              "bg-muted/30 hover:bg-muted/50 transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
            )}
          >
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <EligibilityBadge eligibility={row.eligibility} />
              <span className="truncate text-xs text-muted-foreground">Eligibility details</span>
            </div>
            <ChevronDown
              className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200", open && "rotate-180")}
            />
          </CollapsibleTrigger>

          <CollapsibleContent className="overflow-hidden">
            <div className="space-y-4 px-3 pb-3 pt-2">
              <p className="text-sm leading-relaxed text-muted-foreground">{eligibilitySummary(row.eligibility)}</p>

              {(showEligibleReasons || showBoth) ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-success">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span className="text-xs font-semibold uppercase tracking-wide">Reasons eligible</span>
                    <span className="text-xs text-muted-foreground">({row.eligibleReasons.length})</span>
                  </div>
                  {hasMatched ? (
                    <ul className="space-y-1.5">
                      {row.eligibleReasons.map((line, i) => (
                        <li
                          key={i}
                          className="rounded-md border border-success/20 bg-success/5 px-2.5 py-1.5 text-xs text-muted-foreground"
                        >
                          {line}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs italic text-muted-foreground">None identified.</p>
                  )}
                </div>
              ) : null}

              {(showIneligibleReasons || showBoth) ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span className="text-xs font-semibold uppercase tracking-wide">Reasons ineligible</span>
                    <span className="text-xs text-muted-foreground">({row.ineligibleReasons.length})</span>
                  </div>
                  {hasFailed ? (
                    <ul className="space-y-1.5">
                      {row.ineligibleReasons.map((line, i) => (
                        <li
                          key={i}
                          className="rounded-md border border-destructive/20 bg-destructive/5 px-2.5 py-1.5 text-xs text-muted-foreground"
                        >
                          {line}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs italic text-muted-foreground">None listed.</p>
                  )}
                </div>
              ) : null}

              {row.eligibility === "ineligible" && hasFailed ? (
                <Collapsible open={gapOpen} onOpenChange={setGapOpen}>
                  <CollapsibleTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-between gap-2 rounded-lg border-border/60"
                    >
                      <span className="text-sm font-medium">Gap analysis</span>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
                          gapOpen && "rotate-180"
                        )}
                      />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="overflow-hidden">
                    <div className="mt-3 space-y-2 rounded-lg border border-border/50 bg-muted/15 p-3">
                      <p className="text-xs text-muted-foreground">
                        Practical next steps to close documentation gaps and improve the record for re-screening.
                      </p>
                      <ul className="space-y-2">
                        {row.ineligibleReasons.map((reason, idx) => (
                          <li key={idx} className="rounded-md border border-border/50 bg-card/40 p-2.5">
                            <p className="text-xs font-medium text-foreground">{reason}</p>
                            <ul className="mt-2 list-disc space-y-1 pl-5">
                              {gapSuggestions(reason).map((s, j) => (
                                <li key={j} className="text-xs text-muted-foreground">
                                  {s}
                                </li>
                              ))}
                            </ul>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ) : null}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      <style jsx>{`
        @keyframes narrativeCardIn {
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

export function EligibilityNarrativeView({ patient, rows }: { patient?: string; rows: EligibilityNarrativeRow[] }) {
  const eligible = rows.filter((r) => r.eligibility === "eligible").length
  const ineligible = rows.filter((r) => r.eligibility === "ineligible").length
  const review = rows.filter((r) => r.eligibility === "needs_review").length

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border/50 bg-card/40 p-4">
        <h2 className="text-base font-semibold text-foreground">Eligibility analysis</h2>
        {patient ? (
          <p className="mt-1 text-sm text-muted-foreground">
            Patient: <span className="font-medium text-foreground">{patient}</span>
          </p>
        ) : null}
        <p className="mt-2 text-xs text-muted-foreground">
          {rows.length} protocol{rows.length === 1 ? "" : "s"} · {eligible} eligible · {ineligible} ineligible
          {review > 0 ? ` · ${review} need review` : ""}
        </p>
      </div>

      <div className="space-y-3">
        {rows.map((row, index) => (
          <NarrativeProtocolCard key={`${row.protocolName}-${index}`} row={row} index={index} />
        ))}
      </div>
    </div>
  )
}
