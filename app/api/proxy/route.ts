import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url, method, payload, headers: customHeaders } = body

    if (!url) {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      )
    }

    // Validate URL
    try {
      new URL(url)
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      )
    }

    const fetchOptions: RequestInit = {
      method: method || "GET",
      headers: {
        "Content-Type": "application/json",
        ...customHeaders,
      },
    }

    if ((method === "POST" || method === "PUT") && payload) {
      fetchOptions.body = typeof payload === "string" ? payload : JSON.stringify(payload)
    }

    const startTime = performance.now()
    const response = await fetch(url, fetchOptions)
    const endTime = performance.now()

    // Get response data
    const contentType = response.headers.get("content-type")
    let data: unknown

    if (contentType?.includes("application/json")) {
      data = await response.json()
    } else {
      data = await response.text()
    }

    // Extract headers
    const responseHeaders: Record<string, string> = {}
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value
    })

    return NextResponse.json({
      status: response.status,
      statusText: response.statusText,
      data,
      headers: responseHeaders,
      time: Math.round(endTime - startTime),
    })
  } catch (error) {
    console.error("[Proxy Error]:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch",
        type: "network",
      },
      { status: 500 }
    )
  }
}
