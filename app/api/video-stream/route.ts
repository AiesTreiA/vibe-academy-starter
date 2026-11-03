import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const fileId = searchParams.get("id")

  if (!fileId) {
    return NextResponse.json({ error: "Missing video file ID" }, { status: 400 })
  }

  // Construct Google Drive direct download URL with confirm=t for virus scan override
  const gdriveUrl = `https://drive.usercontent.google.com/download?id=${fileId}&export=download&confirm=t`

  const rangeHeader = request.headers.get("range")

  const headers: Record<string, string> = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  }

  if (rangeHeader) {
    headers["Range"] = rangeHeader
  }

  try {
    const upstreamResponse = await fetch(gdriveUrl, {
      headers,
    })

    if (!upstreamResponse.ok && upstreamResponse.status !== 206) {
      console.error(`[video-stream] Upstream error status: ${upstreamResponse.status}`)
      return NextResponse.json(
        { error: "Error streaming video from source" },
        { status: upstreamResponse.status || 500 }
      )
    }

    const responseHeaders = new Headers()
    responseHeaders.set("Content-Type", "video/mp4")
    responseHeaders.set("Accept-Ranges", "bytes")
    responseHeaders.set("Cache-Control", "public, max-age=3600")

    const contentLength = upstreamResponse.headers.get("content-length")
    if (contentLength) {
      responseHeaders.set("Content-Length", contentLength)
    }

    const contentRange = upstreamResponse.headers.get("content-range")
    if (contentRange) {
      responseHeaders.set("Content-Range", contentRange)
    }

    const status = upstreamResponse.status === 206 ? 206 : 200

    return new Response(upstreamResponse.body, {
      status,
      headers: responseHeaders,
    })
  } catch (error: any) {
    console.error("[video-stream] Internal streaming error:", error)
    return NextResponse.json(
      { error: "Failed to connect to video server" },
      { status: 500 }
    )
  }
}
