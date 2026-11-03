import { NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase"
import { generateInstagramReply } from "@/lib/instagram-bot"

export async function GET() {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN || process.env.FACEBOOK_PAGE_ACCESS_TOKEN
  const pageId = process.env.FACEBOOK_PAGE_ID || "61591534187376"

  let igAccountInfo: any = null
  let status = "ready"
  let errorMsg = null

  if (accessToken) {
    try {
      const primaryHost = accessToken.startsWith("IG") ? "graph.instagram.com" : "graph.facebook.com"
      const res = await fetch(`https://${primaryHost}/v18.0/me?fields=id,name,username&access_token=${accessToken}`)
      if (res.ok) {
        igAccountInfo = await res.json()
      } else {
        errorMsg = await res.text()
      }
    } catch (e: any) {
      errorMsg = e.message
    }
  } else {
    status = "missing_token"
    errorMsg = "INSTAGRAM_ACCESS_TOKEN or FACEBOOK_PAGE_ACCESS_TOKEN not set"
  }

  return NextResponse.json({
    status,
    asset: {
      account_name: igAccountInfo?.username || igAccountInfo?.name || "mujica_ai_lab",
      account_id: igAccountInfo?.id || "17841400000000000",
      platform: "Instagram Professional Account",
      connected_page_id: pageId,
      connected_app_id: "1342161154696429",
      business_name: "JAVIER IGNACIO MUJICA CARVAJAL",
      business_id: "1777092366829362"
    },
    error: errorMsg
  })
}

export async function POST(req: Request) {
  try {
    const { recipientId, messageText, testAi } = await req.json()

    if (!recipientId || !recipientId.trim()) {
      return NextResponse.json({ error: "recipientId is required (Instagram User Scoped ID)" }, { status: 400 })
    }

    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN || process.env.FACEBOOK_PAGE_ACCESS_TOKEN
    if (!accessToken) {
      return NextResponse.json({ error: "Access token is not configured in Vercel" }, { status: 500 })
    }

    let finalMessage = messageText?.trim() || "Hola! Este es un mensaje de prueba enviado desde el panel de control VibeCourseBot."

    let aiGenerated = false
    if (testAi) {
      try {
        finalMessage = await (generateInstagramReply as any)(
          messageText || "Hola, quiero saber más sobre sus programas de IA",
          recipientId,
          "test_user"
        )
        aiGenerated = true
      } catch (err: any) {
        console.error("AI Generation failed:", err)
      }
    }

    const primaryHost = accessToken.startsWith("IG") ? "graph.instagram.com" : "graph.facebook.com"
    const fallbackHost = primaryHost === "graph.instagram.com" ? "graph.facebook.com" : "graph.instagram.com"

    let sendRes = await fetch(
      `https://${primaryHost}/v18.0/me/messages?access_token=${accessToken}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient: { id: recipientId.trim() },
          message: { text: finalMessage }
        })
      }
    )

    let usedHost = primaryHost
    if (!sendRes.ok) {
      sendRes = await fetch(
        `https://${fallbackHost}/v18.0/me/messages?access_token=${accessToken}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recipient: { id: recipientId.trim() },
            message: { text: finalMessage }
          })
        }
      )
      usedHost = fallbackHost
    }

    const responseBody = await sendRes.json()

    if (!sendRes.ok) {
      return NextResponse.json({
        success: false,
        error: responseBody?.error?.message || "Failed to deliver message via Meta Graph API",
        details: responseBody
      }, { status: 400 })
    }

    // Save message to Supabase history
    try {
      const supabase = getSupabaseAdminClient() as any
      await supabase.from("instagram_messages").insert({
        ig_sid: recipientId.trim(),
        sender: "bot",
        message: finalMessage
      })
    } catch (dbErr) {
      console.warn("Could not save test message in DB:", dbErr)
    }

    return NextResponse.json({
      success: true,
      delivered_message: finalMessage,
      ai_generated: aiGenerated,
      recipient_id: recipientId.trim(),
      message_id: responseBody.message_id || responseBody.id,
      graph_host: usedHost,
      timestamp: new Date().toISOString()
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Internal server error" }, { status: 500 })
  }
}
