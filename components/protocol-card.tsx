"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { ChevronDown, CheckCircle2, XCircle, AlertCircle } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface Protocol {
  protocol_id: string
  eligible: boolean
  score: number
  matched_criteria: string[]
  failed_criteria: string[]
}

interface ProtocolCardProps {
  protocol: Protocol
  index: number
}

export function ScoreDisplay({ score }: { score: number }) {
  const pct = Math.min(100, Math.max(0, Math.round(score * 100)))
  const r = 20
  const c = 2 * Math.PI * r
  const dashOffset = c * (1 - pct / 100)

  const barClass =
    score >= 0.7
      ? "bg-success"
      : score >= 0.4
        ? "bg-amber-500 dark:bg-amber-400"
        : "bg-destructive"

  const ringClass =
    score >= 0.7 ? "text-success" : score >= 0.4 ? "text-amber-500 dark:text-amber-400" : "text-destructive"

  return (
    <div className="flex items-center gap-3 shrink-0">
      <div className="relative h-14 w-14 shrink-0">
        <svg className="h-14 w-14 -rotate-90" viewBox="0 0 48 48" aria-hidden>
          <circle cx="24" cy="24" r={r} className="fill-none stroke-muted/40" strokeWidth="4" />
          <circle
            cx="24"
            cy="24"
            r={r}
            className={cn("fill-none stroke-current transition-[stroke-dashoffset] duration-500", ringClass)}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={dashOffset}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold tabular-nums text-foreground">
          {pct}%
        </span>
      </div>
      <div className="hidden min-w-[7rem] flex-col items-end gap-1.5 sm:flex">
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Match score</span>
        <div className="h-2 w-full max-w-[120px] overflow-hidden rounded-full bg-muted">
          <div className={cn("h-full rounded-full transition-all duration-500", barClass)} style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  )
}

export function ProtocolCard({ protocol, index }: ProtocolCardProps) {
  const [open, setOpen] = useState(false)

  const hasMatched = protocol.matched_criteria.length > 0
  const hasFailed = protocol.failed_criteria.length > 0

  const summaryText = protocol.eligible
    ? "This protocol’s criteria are satisfied for this subject. Open for matched criteria and scoring context."
    : "This protocol’s criteria are not satisfied for this subject. Open to see which requirements failed."

  const showMatched = protocol.eligible
  const showFailed = !protocol.eligible

  return (
    <div
      className={cn(
        "rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm shadow-sm",
        "transition-colors duration-200 hover:border-border hover:bg-card/80",
        open && "border-border bg-card/80 ring-1 ring-ring/10"
      )}
      style={{
        animationDelay: `${index * 45}ms`,
        animation: "protocolCardIn 0.35s ease-out forwards",
        opacity: 0,
      }}
    >
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Protocol</p>
          <h3 className="font-mono text-sm font-semibold leading-snug text-foreground break-all sm:break-words" title={protocol.protocol_id}>
            {protocol.protocol_id}
          </h3>
        </div>

        <ScoreDisplay score={protocol.score} />
      </div>

      <Collapsible open={open} onOpenChange={setOpen}>
        <div className="border-t border-border/50 px-2 pb-2 pt-0">
          <CollapsibleTrigger
            className={cn(
              "flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left",
              "bg-muted/30 hover:bg-muted/50 transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
            )}
          >
            <div className="flex min-w-0 flex-1 items-center gap-2">
              {protocol.eligible ? (
                <span className="inline-flex items-center gap-1.5 rounded-md bg-success/15 px-2 py-0.5 text-xs font-semibold text-success">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                  Eligible
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-md bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive">
                  <XCircle className="h-3.5 w-3.5 shrink-0" />
                  Ineligible
                </span>
              )}
              <span className="truncate text-xs text-muted-foreground">Details</span>
            </div>
            <ChevronDown className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200", open && "rotate-180")} />
          </CollapsibleTrigger>

          <CollapsibleContent className="overflow-hidden">
            <div className="space-y-4 px-3 pb-3 pt-2">
              <p className="text-sm leading-relaxed text-muted-foreground">{summaryText}</p>

              {showMatched ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-success">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span className="text-xs font-semibold uppercase tracking-wide">Matched criteria</span>
                    <span className="text-xs text-muted-foreground">({protocol.matched_criteria.length})</span>
                  </div>
                  {hasMatched ? (
                    <ul className="space-y-1.5">
                      {protocol.matched_criteria.map((criteria, i) => (
                        <li
                          key={i}
                          className="rounded-md border border-success/20 bg-success/5 px-2.5 py-1.5 font-mono text-xs text-muted-foreground"
                        >
                          {criteria}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs italic text-muted-foreground">None listed.</p>
                  )}
                </div>
              ) : null}

              {showFailed ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span className="text-xs font-semibold uppercase tracking-wide">Failed criteria</span>
                    <span className="text-xs text-muted-foreground">({protocol.failed_criteria.length})</span>
                  </div>
                  {hasFailed ? (
                    <ul className="space-y-1.5">
                      {protocol.failed_criteria.map((criteria, i) => (
                        <li
                          key={i}
                          className="rounded-md border border-destructive/20 bg-destructive/5 px-2.5 py-1.5 font-mono text-xs text-muted-foreground"
                        >
                          {criteria}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs italic text-muted-foreground">None listed.</p>
                  )}
                </div>
              ) : null}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      <style jsx>{`
        @keyframes protocolCardIn {
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
