import { NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = getSupabaseAdminClient()
    const { data, error } = await supabase.from("consultation_evaluations").select("id").limit(1)
    if (error) {
      console.error("Supabase query error object:", error)
      return NextResponse.json({ ok: false, error }, { status: 500 })
    }
    return NextResponse.json({ ok: true, sample: data }, { status: 200 })
  } catch (err: any) {
    console.error("Test route exception:", err)
    return NextResponse.json(
      { ok: false, error: { message: err?.message, stack: err?.stack, name: err?.name } },
      { status: 500 },
    )
  }
}