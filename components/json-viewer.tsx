"use client"

import { useMemo } from "react"

interface JsonViewerProps {
  data: unknown
  className?: string
}

// Syntax highlighting for JSON with custom colors matching our theme
export function JsonViewer({ data, className = "" }: JsonViewerProps) {
  const formattedJson = useMemo(() => {
    try {
      const jsonString = JSON.stringify(data, null, 2)
      return highlightJson(jsonString)
    } catch {
      return String(data)
    }
  }, [data])

  return (
    <pre
      className={`font-mono text-sm leading-relaxed overflow-auto ${className}`}
      dangerouslySetInnerHTML={{ __html: formattedJson }}
    />
  )
}

function highlightJson(json: string): string {
  // Escape HTML entities first
  const escaped = json
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")

  // Apply syntax highlighting
  return escaped
    // Highlight keys (property names)
    .replace(
      /"([^"]+)"(?=\s*:)/g,
      '<span style="color: oklch(0.7 0.18 160);">"$1"</span>'
    )
    // Highlight string values
    .replace(
      /:\s*"([^"]*)"/g,
      ': <span style="color: oklch(0.75 0.15 80);">"$1"</span>'
    )
    // Highlight numbers
    .replace(
      /:\s*(\d+\.?\d*)/g,
      ': <span style="color: oklch(0.65 0.15 200);">$1</span>'
    )
    // Highlight booleans and null
    .replace(
      /:\s*(true|false|null)/g,
      ': <span style="color: oklch(0.6 0.2 25);">$1</span>'
    )
}
