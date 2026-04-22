import { redirect } from "next/navigation"

export default function Page() {
  // Canonical entry point is /test.
  // Keeping / as a redirect avoids duplicating the page.
  redirect("/test")
}
