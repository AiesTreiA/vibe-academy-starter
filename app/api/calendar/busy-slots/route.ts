import { type NextRequest, NextResponse } from "next/server"
import { getGoogleCalendarBusySlots } from "@/lib/google-calendar"
import { getSupabaseAdminClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const dateStr = searchParams.get("date")

  if (!dateStr) {
    return NextResponse.json({ success: false, error: "Missing date parameter" }, { status: 400 })
  }

  try {
    // 1. Obtener franjas ocupadas desde Google Calendar (si las credenciales están activas)
    const googleBusy = await getGoogleCalendarBusySlots(dateStr)

    // 2. Obtener reuniones agendadas en la base de datos Supabase
    const supabase = getSupabaseAdminClient()
    const startOfDay = new Date(`${dateStr}T00:00:00-04:00`).toISOString()
    const endOfDay = new Date(`${dateStr}T23:59:59-04:00`).toISOString()

    const { data: dbSubmissions, error } = await (supabase.from("contact_submissions") as any)
      .select("meeting_time")
      .gte("meeting_time", startOfDay)
      .lte("meeting_time", endOfDay)

    const dbBusy: Array<{ start: string; end: string }> = []
    if (!error && dbSubmissions) {
      for (const sub of dbSubmissions) {
        if (sub.meeting_time) {
          const start = new Date(sub.meeting_time)
          const end = new Date(start.getTime() + 45 * 60 * 1000) // 45 min por reunión
          dbBusy.push({
            start: start.toISOString(),
            end: end.toISOString(),
          })
        }
      }
    }

    // Combinar ambas fuentes de ocupación
    const busySlots = [...googleBusy, ...dbBusy]

    return NextResponse.json({ success: true, busySlots }, { status: 200 })
  } catch (err: any) {
    console.error("Error fetching busy slots:", err)
    return NextResponse.json({ success: false, error: err.message, busySlots: [] }, { status: 500 })
  }
}
