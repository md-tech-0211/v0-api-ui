import { ApiPlayground } from "@/components/api-playground"

export default function TestPage() {
  const defaultEndpoint = process.env.DEFAULT_API_ENDPOINT || ""

  return (
    <main className="min-h-svh w-full bg-background py-6 px-4">
      {/* Background gradient decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <ApiPlayground defaultEndpoint={defaultEndpoint} />
    </main>
  )
}

