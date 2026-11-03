import { NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase"
import { sendEmail, getVibecodeBalanceRequestTemplate } from "@/lib/email-service"

export const dynamic = "force-dynamic"

async function handleRequestBalance(req: Request) {
  try {
    const url = new URL(req.url)
    const secret = url.searchParams.get("secret") || req.headers.get("x-vercel-cron-secret")
    const expectedSecret = process.env.VERCEL_CRON_SECRET || "jm_seo_cron_secret_737441ad761c"

    if (!secret || secret !== expectedSecret) {
      console.warn("⚠️ [CRON BALANCE] Unauthorized balance request attempt.")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = getSupabaseAdminClient() as any
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

    // Find partially paid registrations where abono was made >= 7 days ago and balance requested is null or old
    const { data: pendingBalanceRegs, error: fetchError } = await supabase
      .from("vibecode_registrations")
      .select("*")
      .eq("status", "partially_paid")
      .gt("remaining_amount_clp", 5000)
      .lte("abono_at", sevenDaysAgo)
      .is("balance_requested_at", null)

    if (fetchError) {
      console.error("❌ [CRON BALANCE] DB query error:", fetchError)
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    const list = pendingBalanceRegs || []
    console.log(`🔍 [CRON BALANCE] Found ${list.length} partial registrations due for 7-day balance request.`)

    const results = []

    for (const reg of list) {
      const abonoCLP = reg.abono_amount_clp || 0
      const remainingCLP = reg.remaining_amount_clp || 0

      console.log(`📧 [CRON BALANCE] Sending 7-day balance request to ${reg.email} (${reg.name})...`)

      const balanceHtml = getVibecodeBalanceRequestTemplate(reg.name, abonoCLP, remainingCLP, reg.id)
      const emailRes = await sendEmail({
        to: reg.email,
        subject: "🔔 Recordatorio de Saldo Pendiente — Vibecode Lab",
        html: balanceHtml,
      })

      if (emailRes.success) {
        // Update balance_requested_at in DB
        await supabase
          .from("vibecode_registrations")
          .update({ balance_requested_at: new Date().toISOString() })
          .eq("id", reg.id)

        // Notify admin
        try {
          await sendEmail({
            to: "hola@javiermujica.com",
            subject: `🔔 [COBRO ENVIADO 7 DÍAS] ${reg.name} ($${remainingCLP.toLocaleString("es-CL")} CLP pendiente)`,
            html: `
              <div style="font-family: sans-serif; background: #030712; color: #f3f4f6; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; background: #090d16; border: 1px solid #1e293b; border-radius: 12px; padding: 25px;">
                  <h2 style="color: #6366f1;">🔔 Cobro Automático de Saldo Enviado (7 Días)</h2>
                  <p>Se envió el recordatorio de cobro de saldo al alumno <strong>${reg.name}</strong> (${reg.email}).</p>
                  <ul>
                    <li><strong>Monto Abonado:</strong> $${abonoCLP.toLocaleString("es-CL")} CLP</li>
                    <li><strong>Monto Solicitado:</strong> $${remainingCLP.toLocaleString("es-CL")} CLP</li>
                    <li><strong>Teléfono:</strong> ${reg.phone || "No especificado"}</li>
                  </ul>
                </div>
              </div>
            `,
          })
        } catch (adminErr) {
          console.error("Failed notifying admin about balance request:", adminErr)
        }

        results.push({ email: reg.email, status: "sent", remaining_clp: remainingCLP })
      } else {
        console.error(`❌ [CRON BALANCE] Failed sending email to ${reg.email}:`, emailRes.error)
        results.push({ email: reg.email, status: "failed", error: emailRes.error })
      }
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      details: results,
    })
  } catch (err: any) {
    console.error("❌ [CRON BALANCE] Exception:", err)
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 })
  }
}

export async function GET(req: Request) {
  return handleRequestBalance(req)
}

export async function POST(req: Request) {
  return handleRequestBalance(req)
}
