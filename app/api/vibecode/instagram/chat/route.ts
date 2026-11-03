import { NextResponse } from "next/server"
import { generateInstagramReply } from "@/lib/instagram-bot"

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const message = (body.message || "").trim()
    const history = body.history || []
    const userName = (body.name || "amigo").trim()
    const username = (body.username || "").trim()
    const isAmbassadorFlow = Boolean(body.isAmbassadorFlow)

    if (!message) {
      return NextResponse.json({ error: "Mensaje vacío" }, { status: 400 })
    }

    const reply = await generateInstagramReply({
      name: userName,
      username,
      message,
      history,
      isAmbassadorFlow,
    })

    return NextResponse.json({ reply })
  } catch (err: any) {
    console.error("Error in instagram chatbot API:", err)
    return NextResponse.json(
      { error: "Error interno en el procesamiento del chatbot" },
      { status: 500 }
    )
  }
}

