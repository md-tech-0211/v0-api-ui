"use client"

import { useMemo, useState } from "react"
import {
  AlertTriangle,
  ArrowRight,
  Ban,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  HelpCircle,
  LayoutDashboard,
  Sparkles,
  XCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  type BedrockStructuredEnvelope,
  type PolicyAssessment,
  type StructuredEligibility,
  type Validity,
  normalizeValidity,
} from "@/lib/structured-eligibility"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const VALIDITY_LABEL: Record<Validity, string> = {
  eligible: "Eligible",
  ineligible: "Ineligible",
  conditionally_eligible: "Conditional",
  insufficient_data: "Insufficient data",
}

function validityStyles(v: Validity): { bar: string; badge: string; ring: string; label: string } {
  switch (v) {
    case "eligible":
      return {
        bar: "bg-emerald-500",
        badge: "border-emerald-500/40 bg-emerald-500/15 text-emerald-200",
        ring: "ring-emerald-500/30",
        label: "text-emerald-200",
      }
    case "ineligible":
      return {
        bar: "bg-rose-500",
        badge: "border-rose-500/40 bg-rose-500/15 text-rose-200",
        ring: "ring-rose-500/30",
        label: "text-rose-200",
      }
    case "conditionally_eligible":
      return {
        bar: "bg-amber-400",
        badge: "border-amber-500/40 bg-amber-500/15 text-amber-100",
        ring: "ring-amber-500/30",
        label: "text-amber-100",
      }
    case "insufficient_data":
    default:
      return {
        bar: "bg-sky-500/80",
        badge: "border-sky-500/40 bg-sky-500/15 text-sky-100",
        ring: "ring-sky-500/30",
        label: "text-sky-100",
      }
  }
}

function ValidityBadge({ validity }: { validity: Validity }) {
  const s = validityStyles(validity)
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase",
        s.badge
      )}
    >
      {VALIDITY_LABEL[validity]}
    </span>
  )
}

function DomainPill({ domain }: { domain: string }) {
  return (
    <span className="inline-flex items-center rounded border border-border/60 bg-muted/40 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
      {domain}
    </span>
  )
}

function BulletList({ items, variant }: { items: string[]; variant: "support" | "block" }) {
  if (items.length === 0) return <p className="text-xs text-muted-foreground">None listed.</p>
  return (
    <ul className="space-y-1.5">
      {items.map((line, i) => (
        <li
          key={i}
          className={cn(
            "text-xs leading-relaxed rounded-lg border px-2.5 py-2",
            variant === "support"
              ? "border-emerald-500/25 bg-emerald-500/[0.06] text-muted-foreground"
              : "border-rose-500/25 bg-rose-500/[0.06] text-muted-foreground"
          )}
        >
          {line}
        </li>
      ))}
    </ul>
  )
}

function KpiTile({
  label,
  value,
  accentClass,
}: {
  label: string
  value: number
  accentClass: string
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-border/50 bg-card/40 p-4 backdrop-blur-sm",
        "before:absolute before:inset-y-2 before:left-0 before:w-0.5 before:rounded-full",
        accentClass
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-foreground">{value}</p>
    </div>
  )
}

function DistributionBar({ policies }: { policies: PolicyAssessment[] }) {
  const segments = useMemo(() => {
    const counts: Record<Validity, number> = {
      eligible: 0,
      ineligible: 0,
      conditionally_eligible: 0,
      insufficient_data: 0,
    }
    for (const p of policies) {
      counts[normalizeValidity(p.validity)]++
    }
    const total = policies.length || 1
    const order: Validity[] = ["eligible", "conditionally_eligible", "insufficient_data", "ineligible"]
    return order.map((key) => ({
      key,
      pct: (counts[key] / total) * 100,
      count: counts[key],
      color: validityStyles(key).bar,
    }))
  }, [policies])

  return (
    <div className="space-y-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        Validity mix
      </p>
      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted/80 ring-1 ring-border/40">
        {segments.map(
          (s) =>
            s.pct > 0 && (
              <div
                key={s.key}
                className={cn("h-full transition-all", s.color)}
                style={{ width: `${s.pct}%` }}
                title={`${VALIDITY_LABEL[s.key]}: ${s.count}`}
              />
            )
        )}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-muted-foreground">
        {segments.map((s) =>
          s.count > 0 ? (
            <span key={s.key} className="inline-flex items-center gap-1.5">
              <span className={cn("h-2 w-2 rounded-sm", s.color)} />
              {VALIDITY_LABEL[s.key]} ({s.count})
            </span>
          ) : null
        )}
      </div>
    </div>
  )
}

function PolicyAccordion({ policies }: { policies: PolicyAssessment[] }) {
  const byDomain = useMemo(() => {
    const map = new Map<string, PolicyAssessment[]>()
    for (const p of policies) {
      const d = p.domain?.trim() || "Other"
      if (!map.has(d)) map.set(d, [])
      map.get(d)!.push(p)
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]))
  }, [policies])

  return (
    <Accordion type="multiple" className="w-full rounded-xl border border-border/50 bg-card/30">
      {byDomain.map(([domain, rows]) => (
        <AccordionItem key={domain} value={domain} className="border-border/40 px-4">
          <AccordionTrigger className="py-3 text-sm hover:no-underline">
            <span className="flex w-full items-center justify-between gap-3 pr-2">
              <span className="font-medium text-foreground">{domain}</span>
              <span className="text-xs text-muted-foreground tabular-nums">{rows.length} protocols</span>
            </span>
          </AccordionTrigger>
          <AccordionContent className="pb-4 pt-0">
            <div className="space-y-3">
              {rows.map((policy, idx) => {
                const v = normalizeValidity(policy.validity)
                const vs = validityStyles(v)
                return (
                  <div
                    key={`${policy.policy_name}-${idx}`}
                    className={cn(
                      "rounded-xl border border-border/45 bg-background/40 p-4 ring-1 backdrop-blur-sm",
                      vs.ring
                    )}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 space-y-2">
                        <p className="text-sm font-semibold leading-snug text-foreground">{policy.policy_name}</p>
                        <div className="flex flex-wrap items-center gap-2">
                          <DomainPill domain={policy.domain} />
                          <ValidityBadge validity={v} />
                          {policy.hard_lifetime_exclusion ? (
                            <Badge
                              variant="outline"
                              className="border-rose-500/50 text-[10px] uppercase tracking-wide text-rose-200"
                            >
                              Lifetime exclusion
                            </Badge>
                          ) : null}
                          {policy.needs_crc_clarification ? (
                            <span className="inline-flex items-center gap-1 rounded border border-amber-500/35 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-amber-100">
                              <HelpCircle className="h-3 w-3" />
                              CRC follow-up
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-foreground/90">{policy.screening_decision}</p>
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <div>
                        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-emerald-600/90 dark:text-emerald-300/90">
                          Supporting factors
                        </p>
                        <BulletList items={policy.reasons_for_validity} variant="support" />
                      </div>
                      <div>
                        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-rose-600/90 dark:text-rose-300/90">
                          Blocking factors
                        </p>
                        <BulletList items={policy.reasons_against_validity} variant="block" />
                      </div>
                    </div>
                    {policy.minimum_gap_to_eligibility != null && String(policy.minimum_gap_to_eligibility).trim() !== "" ? (
                      <div className="mt-4 rounded-lg border border-border/40 bg-muted/20 px-3 py-2.5">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                          Path to eligibility
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-foreground/85">{policy.minimum_gap_to_eligibility}</p>
                      </div>
                    ) : null}
                    {policy.crc_notes && policy.crc_notes.length > 0 ? (
                      <div className="mt-3 flex gap-2 rounded-lg border border-border/35 bg-card/50 px-3 py-2">
                        <ClipboardList className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                        <ul className="space-y-1">
                          {policy.crc_notes.map((n, i) => (
                            <li key={i} className="text-xs text-muted-foreground leading-relaxed">
                              {n}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                )
              })}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

function FinalRecommendationPanel({ fr }: { fr: StructuredEligibility["final_recommendation"] }) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="border-emerald-500/25 bg-gradient-to-b from-emerald-500/[0.07] to-transparent shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            Refer now
          </CardTitle>
          <CardDescription className="text-xs">Immediate referral candidates</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {fr.refer_immediately.length === 0 ? (
            <p className="text-sm text-muted-foreground">None at this time.</p>
          ) : (
            <ul className="space-y-2">
              {fr.refer_immediately.map((name) => (
                <li
                  key={name}
                  className="flex items-start gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-sm text-foreground"
                >
                  <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                  <span>{name}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card className="border-sky-500/25 bg-gradient-to-b from-sky-500/[0.06] to-transparent shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <CalendarClock className="h-4 w-4 text-sky-300" />
            Revisit when
          </CardTitle>
          <CardDescription className="text-xs">Timed or conditional follow-ups</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {fr.revisit_when.length === 0 ? (
            <p className="text-sm text-muted-foreground">No deferred paths captured.</p>
          ) : (
            <ul className="space-y-3">
              {fr.revisit_when.map((item, i) => (
                <li key={`${item.policy_name}-${i}`} className="rounded-lg border border-border/50 bg-card/50 p-3">
                  <p className="text-sm font-medium text-foreground">{item.policy_name}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.when}</p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card className="border-rose-500/25 bg-gradient-to-b from-rose-500/[0.06] to-transparent shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Ban className="h-4 w-4 text-rose-300" />
            No eligibility path
          </CardTitle>
          <CardDescription className="text-xs">Wrong indication or hard stop</CardDescription>
        </CardHeader>
        <CardContent>
          {fr.no_eligibility_path.length === 0 ? (
            <p className="text-sm text-muted-foreground">None listed.</p>
          ) : (
            <ul className="space-y-2">
              {fr.no_eligibility_path.map((name) => (
                <li
                  key={name}
                  className="flex items-start gap-2 rounded-lg border border-rose-500/20 bg-rose-500/5 px-3 py-2 text-sm text-foreground"
                >
                  <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
                  <span>{name}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function ParseFailure({ env }: { env: BedrockStructuredEnvelope }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="space-y-4 rounded-2xl border border-amber-500/30 bg-amber-500/[0.06] p-6">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 shrink-0 text-amber-400" />
        <div>
          <h3 className="text-sm font-semibold text-foreground">Structured output could not be parsed</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            The model returned text that was not valid JSON. Review the raw output or retry with a lower temperature.
          </p>
          {env.parse_error ? (
            <p className="mt-3 rounded-lg border border-border/50 bg-background/50 px-3 py-2 font-mono text-xs text-rose-200">
              {env.parse_error}
            </p>
          ) : null}
        </div>
      </div>
      {env.unparsed_model_output ? (
        <div>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-2 text-xs font-medium text-foreground hover:underline"
          >
            <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
            Raw model output
          </button>
          {open ? (
            <pre className="mt-2 max-h-[280px] overflow-auto rounded-xl border border-border/50 bg-muted/30 p-4 font-mono text-[11px] leading-relaxed text-muted-foreground">
              {env.unparsed_model_output}
            </pre>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

type Props = {
  envelope: BedrockStructuredEnvelope
  patientLabel?: string
}

export function StructuredEligibilityDashboard({ envelope, patientLabel }: Props) {
  const data = envelope.structured

  const kpis = useMemo(() => {
    if (!data) return null
    const policies = data.policies
    const acc: Record<Validity, number> = {
      eligible: 0,
      ineligible: 0,
      conditionally_eligible: 0,
      insufficient_data: 0,
    }
    for (const p of policies) {
      acc[normalizeValidity(p.validity)]++
    }
    return acc
  }, [data])

  if (!data) {
    return <ParseFailure env={envelope} />
  }

  return (
    <div className="space-y-6">
      {/* Executive header */}
      <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-card/80 via-card/50 to-background/80 p-6 shadow-sm ring-1 ring-border/30">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-40 w-40 rounded-full bg-chart-3/20 blur-3xl" />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <LayoutDashboard className="h-4 w-4" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.22em]">Screening overview</span>
            </div>
            <h2 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">
              Multi-protocol eligibility
            </h2>
            {patientLabel ? (
              <p className="text-sm text-muted-foreground">
                Candidate <span className="font-medium text-foreground">{patientLabel}</span>
              </p>
            ) : null}
            {data.schema_version ? (
              <p className="text-[11px] text-muted-foreground">Schema {data.schema_version}</p>
            ) : null}
          </div>
          {kpis ? (
            <div className="grid w-full grid-cols-2 gap-2 sm:grid-cols-4 lg:w-auto lg:min-w-[420px]">
              <KpiTile label="Eligible" value={kpis.eligible} accentClass="before:bg-emerald-500" />
              <KpiTile label="Conditional" value={kpis.conditionally_eligible} accentClass="before:bg-amber-400" />
              <KpiTile label="Insufficient" value={kpis.insufficient_data} accentClass="before:bg-sky-500" />
              <KpiTile label="Ineligible" value={kpis.ineligible} accentClass="before:bg-rose-500" />
            </div>
          ) : null}
        </div>
      </div>

      {/* Snapshot + distribution */}
      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="border-border/50 bg-card/50 shadow-none lg:col-span-3">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">Clinical snapshot</CardTitle>
            </div>
            <CardDescription>Condensed phenotype used for criterion matching</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-foreground/90">{data.patient_profile_summary}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/50 shadow-none lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Portfolio view</CardTitle>
            <CardDescription>{data.policies.length} protocols evaluated</CardDescription>
          </CardHeader>
          <CardContent>
            <DistributionBar policies={data.policies} />
          </CardContent>
        </Card>
      </div>

      <Separator className="bg-border/60" />

      <div>
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Protocol-level assessment
          </h3>
        </div>
        <div className="max-h-[min(520px,55vh)] overflow-y-auto overflow-x-hidden pr-1">
          <PolicyAccordion policies={data.policies} />
        </div>
      </div>

      <Separator className="bg-border/60" />

      <div className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Strategic recommendation
        </h3>
        <FinalRecommendationPanel fr={data.final_recommendation} />
      </div>
    </div>
  )
}
