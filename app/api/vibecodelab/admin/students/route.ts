import { NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase"
import { provisionVibecodeUser } from "@/lib/vibecode-auth-service"
import { sendEmail, getVibecodeOpenSourceAnnouncementTemplate } from "@/lib/email-service"

export async function GET(req: Request) {
  try {
    const supabase = getSupabaseAdminClient() as any

    // 1. Fetch Registrations
    const { data: regs } = await supabase
      .from("vibecode_registrations")
      .select("*")
      .order("created_at", { ascending: false })

    // 2. Fetch Profiles
    const { data: profiles } = await supabase
      .from("vibecode_profiles")
      .select("*")
      .order("created_at", { ascending: false })

    // 3. Fetch Classes & Progress
    const [{ count: totalClassesCount }, { data: progressRows }] = await Promise.all([
      supabase.from("vibecode_classes").select("*", { count: "exact", head: true }),
      supabase.from("vibecode_user_progress").select("user_id, class_id, completed")
    ])

    const totalClasses = totalClassesCount || 0
    const completedLessons = (progressRows || []).filter((p: any) => p.completed).length

    // Map user_id -> completed count
    const userCompletedMap = new Map<string, number>()
    ;(progressRows || []).forEach((p: any) => {
      if (p.completed && p.user_id) {
        userCompletedMap.set(p.user_id, (userCompletedMap.get(p.user_id) || 0) + 1)
      }
    })

    // 4. Fetch Metrics
    const paidRegs = (regs || []).filter((r: any) => r.status === "paid")
    const totalRevenueUSD = paidRegs.reduce((sum: number, r: any) => sum + (r.amount_paid || 0), 0)

    const { data: bookedMentorships } = await supabase.from("vibecode_mentorship_slots").select("id").eq("is_booked", true)
    const { data: pitchPosts } = await supabase.from("vibecode_pitch_match").select("id").eq("is_hidden", false)

    // Merge student list
    const profileMap = new Map<string, any>()
    ;(profiles || []).forEach((p: any) => profileMap.set(p.email.toLowerCase(), p))

    const studentList = (regs || []).map((r: any) => {
      const p = profileMap.get(r.email.toLowerCase())
      const completedCount = p?.id ? userCompletedMap.get(p.id) || 0 : 0
      const progressPercent = totalClasses > 0 ? Math.min(100, Math.round((completedCount / totalClasses) * 100)) : 0

      return {
        id: r.id,
        profile_id: p?.id || null,
        name: r.name || p?.full_name || "Sin nombre",
        email: r.email,
        phone: r.phone || p?.phone || "N/A",
        status: r.status,
        amount_paid: r.amount_paid || 0,
        coupon_code: r.coupon_code || "Ninguno",
        created_at: r.created_at,
        paid_at: r.paid_at,
        role: p?.role || (r.email.toLowerCase() === "hola@javiermujica.com" ? "admin" : "student"),
        must_change_password: p?.must_change_password ?? true,
        completed_classes: completedCount,
        total_classes: totalClasses,
        progress_percent: progressPercent
      }
    })

    return NextResponse.json({
      success: true,
      metrics: {
        total_students: regs?.length || 0,
        paid_students: paidRegs.length,
        total_revenue_usd: totalRevenueUSD,
        completed_lessons_count: completedLessons,
        booked_mentorships_count: bookedMentorships?.length || 0,
        pitch_posts_count: pitchPosts?.length || 0
      },
      students: studentList
    })
  } catch (err: any) {
    console.error("❌ Exception in admin students GET route:", err)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const { action, email, name, phone, amount_paid, progress_percent } = body

    const supabase = getSupabaseAdminClient() as any

    // Broadcast Open Source + Alumni Pro Reward Announcement to all paid students
    if (action === "broadcast_opensource_announcement") {
      const { data: regs } = await supabase
        .from("vibecode_registrations")
        .select("*")
        .eq("status", "paid")

      const { data: profiles } = await supabase.from("vibecode_profiles").select("*")
      const [{ count: totalClassesCount }, { data: progressRows }] = await Promise.all([
        supabase.from("vibecode_classes").select("*", { count: "exact", head: true }),
        supabase.from("vibecode_user_progress").select("user_id, completed")
      ])

      const totalClasses = totalClassesCount || 0
      const userCompletedMap = new Map<string, number>()
      ;(progressRows || []).forEach((p: any) => {
        if (p.completed && p.user_id) {
          userCompletedMap.set(p.user_id, (userCompletedMap.get(p.user_id) || 0) + 1)
        }
      })

      const profileMap = new Map<string, any>()
      ;(profiles || []).forEach((p: any) => profileMap.set(p.email.toLowerCase(), p))

      const recipients = regs || []
      let sentCount = 0

      for (const r of recipients) {
        const targetEmail = r.email?.trim().toLowerCase()
        if (!targetEmail) continue
        const p = profileMap.get(targetEmail)
        const completedCount = p?.id ? userCompletedMap.get(p.id) || 0 : 0
        const pct = totalClasses > 0 ? Math.min(100, Math.round((completedCount / totalClasses) * 100)) : 0
        const studentName = r.name || p?.full_name || "Constructor/a"

        const res = await sendEmail({
          to: targetEmail,
          subject: "🏆 Liberé mi Repo al Mundo... pero guardé la Bóveda Pro como tu Premio de Graduación",
          html: getVibecodeOpenSourceAnnouncementTemplate(studentName, pct)
        })

        if (res.success) sentCount++
      }

      return NextResponse.json({
        success: true,
        sentCount,
        message: `Anuncio enviado con éxito a ${sentCount} alumnos.`
      })
    }

    if (!email) {
      return NextResponse.json({ error: "Email es requerido" }, { status: 400 })
    }

    const normalizedEmail = email.trim().toLowerCase()

    // Send Open Source + Alumni Pro Reward Announcement to a single student / test recipient
    if (action === "send_opensource_announcement") {
      const emailRes = await sendEmail({
        to: normalizedEmail,
        subject: "🏆 Liberé mi Repo al Mundo... pero guardé la Bóveda Pro como tu Premio de Graduación",
        html: getVibecodeOpenSourceAnnouncementTemplate(name || "Constructor/a", Number(progress_percent) || 0)
      })

      if (!emailRes.success) {
        return NextResponse.json({ error: "Error al enviar el correo de anuncio" }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: `Correo de anuncio del Premio Alumni Pro enviado a ${normalizedEmail}`
      })
    }

    if (action === "reset_password" || action === "resend_access") {
      const result = await provisionVibecodeUser({
        email: normalizedEmail,
        name: name || "Estudiante",
        phone
      })

      if (!result.success) {
        return NextResponse.json({ error: result.error || "Error al resetear la clave" }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: `Credenciales de acceso reenviadas a ${normalizedEmail}`,
        tempPassword: result.tempPassword
      })
    }

    if (action === "create_student") {
      // 1. Insert in vibecode_registrations
      const { data: newReg, error: regErr } = await supabase
        .from("vibecode_registrations")
        .insert({
          name: name || "Nuevo Alumno",
          email: normalizedEmail,
          phone: phone || null,
          status: "paid",
          amount_paid: amount_paid || 265,
          paid_at: new Date().toISOString()
        })
        .select()
        .single()

      if (regErr) {
        console.error("❌ Error creating student registration:", regErr)
      }

      // 2. Provision Auth & Profile
      const result = await provisionVibecodeUser({
        email: normalizedEmail,
        name: name || "Nuevo Alumno",
        phone
      })

      return NextResponse.json({
        success: true,
        message: `Alumno ${normalizedEmail} registrado y accesos enviados por correo.`,
        tempPassword: result.tempPassword,
        registration: newReg
      })
    }

    return NextResponse.json({ error: "Acción no válida" }, { status: 400 })
  } catch (err: any) {
    console.error("❌ Exception in admin students POST route:", err)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

