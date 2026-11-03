import { getSupabaseAdminClient } from "@/lib/supabase"
import { sendEmail, getVibecodeAccessCredentialsTemplate } from "@/lib/email-service"
import crypto from "crypto"

/**
 * Genera una contraseña temporal aleatoria segura de 12 caracteres.
 */
export function generateTempPassword(): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  const specialChars = "!@#$%&*"
  let pass = "Vibe!"
  const bytes = crypto.randomBytes(8)
  for (let i = 0; i < 6; i++) {
    pass += chars[bytes[i] % chars.length]
  }
  pass += specialChars[bytes[6] % specialChars.length]
  pass += bytes[7] % 10
  return pass
}

export interface ProvisionUserParams {
  email: string
  name: string
  phone?: string
}

/**
 * Registra/Actualiza un usuario en Supabase Auth y vibecode_profiles al confirmar un pago.
 * Genera una clave temporal aleatoria y envía el correo con los accesos mediante Resend.
 */
export async function provisionVibecodeUser({ email, name, phone }: ProvisionUserParams) {
  const supabase = getSupabaseAdminClient() as any
  const normalizedEmail = email.trim().toLowerCase()
  const tempPassword = generateTempPassword()
  const isAdmin = normalizedEmail === "hola@javiermujica.com"
  const role = isAdmin ? "admin" : "student"

  console.log(`👤 [VIBECODE AUTH] Provisioning user: ${normalizedEmail} (Role: ${role})`)

  try {
    let userId: string | null = null

    // 1. Check if user already exists in Supabase Auth
    const { data: userListData, error: listError } = await supabase.auth.admin.listUsers()

    if (!listError && userListData?.users) {
      const existingUser = userListData.users.find((u: any) => u.email?.toLowerCase() === normalizedEmail)
      if (existingUser) {
        userId = existingUser.id
        console.log(`ℹ️ [VIBECODE AUTH] User already exists in Auth (ID: ${userId}). Resetting temp password...`)
        await supabase.auth.admin.updateUserById(userId, {
          password: tempPassword,
          user_metadata: { full_name: name, role }
        })
      }
    }

    // 2. If user does not exist in Auth, create user
    if (!userId) {
      const { data: createData, error: createError } = await supabase.auth.admin.createUser({
        email: normalizedEmail,
        password: tempPassword,
        email_confirm: true,
        user_metadata: { full_name: name, role }
      })

      if (createError) {
        console.error("❌ [VIBECODE AUTH] Error creating user in Supabase Auth:", createError)
        // Fallback: If createUser fails, generate deterministic UUID for profile table
        userId = crypto.createHash("md5").update(normalizedEmail).digest("hex")
        userId = `${userId.slice(0,8)}-${userId.slice(8,12)}-4${userId.slice(13,16)}-a${userId.slice(17,20)}-${userId.slice(20,32)}`
      } else if (createData?.user) {
        userId = createData.user.id
        console.log(`✅ [VIBECODE AUTH] Created new Supabase Auth user: ${userId}`)
      }
    }

    // 3. Upsert into vibecode_profiles table
    if (userId) {
      const { error: profileError } = await supabase.from("vibecode_profiles").upsert(
        {
          id: userId,
          email: normalizedEmail,
          full_name: name,
          role,
          must_change_password: true,
          phone: phone || null,
          updated_at: new Date().toISOString()
        },
        { onConflict: "id" }
      )

      if (profileError) {
        console.error("❌ [VIBECODE AUTH] Profile upsert error:", profileError)
      } else {
        console.log(`✅ [VIBECODE AUTH] Profile upserted for ${normalizedEmail}`)
      }
    }

    // 4. Send access credentials email via Resend
    const loginUrl = process.env.NEXT_PUBLIC_APP_URL
      ? `${process.env.NEXT_PUBLIC_APP_URL}/vibecodelab`
      : "https://www.javiermujica.com/vibecodelab"

    const emailHtml = getVibecodeAccessCredentialsTemplate(name, normalizedEmail, tempPassword, loginUrl)

    const emailResult = await sendEmail({
      to: normalizedEmail,
      subject: "🔑 Tus accesos a la Plataforma Vibecode Lab",
      html: emailHtml
    })

    if (emailResult.success) {
      console.log(`📧 [VIBECODE AUTH] Credentials email sent successfully to ${normalizedEmail}`)
    } else {
      console.error("❌ [VIBECODE AUTH] Failed to send credentials email:", emailResult.error)
    }

    return {
      success: true,
      userId,
      email: normalizedEmail,
      tempPassword,
      role
    }
  } catch (err: any) {
    console.error("❌ [VIBECODE AUTH] Exception in provisionVibecodeUser:", err)
    return { success: false, error: err.message || "Failed to provision user" }
  }
}
