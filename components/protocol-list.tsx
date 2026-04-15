"use client"

import { ProtocolCard } from "./protocol-card"
import { CheckCircle2, BarChart3, Percent } from "lucide-react"

interface Protocol {
  protocol_id: string
  eligible: boolean
  score: number
  matched_criteria: string[]
  failed_criteria: string[]
}

interface ProtocolListProps {
  protocols: Protocol[]
}

export function ProtocolList({ protocols }: ProtocolListProps) {
   const eligibleCount = protocols.filter((p) => p.eligible).length
  const ineligibleCount = protocols.length - eligibleCount
  const highestScore = protocols.length > 0 ? Math.max(...protocols.map((p) => p.score)) : 0

  // Sort by score descending
  const sortedProtocols = [...protocols].sort((a, b) => b.score - a.score)

  return (
    <div className="space-y-4">
      {/* Summary stats */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border/50 bg-card/50 p-3 backdrop-blur-sm">
          <div className="mb-1 flex items-center gap-2 text-muted-foreground">
            <BarChart3 className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wide">Protocols</span>
          </div>
          <p className="text-2xl font-semibold tabular-nums text-foreground">{protocols.length}</p>
          <p className="mt-1 text-xs text-muted-foreground">One result card per protocol below.</p>
        </div>

        <div className="rounded-xl border border-border/50 bg-card/50 p-3 backdrop-blur-sm">
          <div className="mb-1 flex items-center gap-2 text-success">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wide">Eligibility</span>
          </div>
          <p className="text-2xl font-semibold tabular-nums text-foreground">
            {eligibleCount}
            <span className="text-base font-normal text-muted-foreground">
              {" "}
              eligible · {ineligibleCount} ineligible
            </span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Out of {protocols.length} evaluated.</p>
        </div>

        <div className="rounded-xl border border-border/50 bg-card/50 p-3 backdrop-blur-sm">
          <div className="mb-1 flex items-center gap-2 text-info">
            <Percent className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wide">Top match score</span>
          </div>
          <p className="text-2xl font-semibold tabular-nums text-foreground">{Math.round(highestScore * 100)}%</p>
          <p className="mt-1 text-xs text-muted-foreground">Highest score across protocols (0–100%).</p>
        </div>
      </div>

      {/* Protocol cards */}
      <div className="space-y-2">
        {sortedProtocols.map((protocol, index) => (
          <ProtocolCard 
            key={protocol.protocol_id} 
            protocol={protocol} 
            index={index}
          />
        ))}
      </div>
    </div>
  )
}
