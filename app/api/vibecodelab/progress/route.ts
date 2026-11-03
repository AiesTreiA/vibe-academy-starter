import { NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase"
import { sendEmail, getVibecodeGraduationRewardUnlockedTemplate } from "@/lib/email-service"

export async function POST(req: Request) {
  try {
    const { userId, classId, completed, userEmail, userName } = await req.json().catch(() => ({}))

    if (!userId || !classId) {
      return NextResponse.json({ error: "userId y classId son requeridos" }, { status: 400 })
    }

    const supabase = getSupabaseAdminClient() as any

    const { data, error } = await supabase
      .from("vibecode_user_progress")
      .upsert(
        {
          user_id: userId,
          class_id: classId,
          completed: Boolean(completed),
          updated_at: new Date().toISOString()
        },
        { onConflict: "user_id, class_id" }
      )
      .select()
      .single()

    if (error) {
      console.error("❌ Error updating progress:", error)
      return NextResponse.json({ error: "Error al actualizar el progreso" }, { status: 500 })
    }

    // Check if the student just reached 100% completion
    let justGraduated = false
    if (Boolean(completed)) {
      const [{ count: totalClasses }, { count: completedClasses }] = await Promise.all([
        supabase.from("vibecode_classes").select("*", { count: "exact", head: true }),
        supabase
          .from("vibecode_user_progress")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId)
          .eq("completed", true)
      ])

      if (totalClasses && totalClasses > 0 && completedClasses && completedClasses >= totalClasses) {
        justGraduated = true

        // Send reward unlock notification email if email is provided or found in profile
        let recipientEmail = userEmail
        let recipientName = userName || "Alumno Vibecode"

        if (!recipientEmail) {
          const { data: profile } = await supabase
            .from("vibecode_profiles")
            .select("email, full_name")
            .eq("id", userId)
            .maybeSingle()
          if (profile?.email) {
            recipientEmail = profile.email
            recipientName = profile.full_name || recipientName
          }
        }

        if (recipientEmail) {
          await sendEmail({
            to: recipientEmail,
            subject: "🏆 ¡100% Completado! Desbloqueaste tu Premio: Bóveda Alumni Pro",
            html: getVibecodeGraduationRewardUnlockedTemplate(recipientName)
          }).catch((e) => console.warn("⚠️ Could not send graduation reward email:", e))
        }
      }
    }

    return NextResponse.json({ success: true, progress: data, justGraduated })
  } catch (err: any) {
    console.error("❌ Exception in progress route:", err)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

