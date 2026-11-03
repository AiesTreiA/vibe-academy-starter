import { createClient } from "@supabase/supabase-js"

/**
 * Call this inside a request handler or server action
 * AFTER environment variables are available.
 */
export function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Supabase environment variables are missing. " +
        "Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your environment variables.",
    )
  }

  return createClient(supabaseUrl, supabaseAnonKey)
}

let adminClient: ReturnType<typeof createClient> | null = null

/**
 * Use ONLY on the server. This client holds the `SUPABASE_SERVICE_ROLE_KEY`
 * and therefore bypasses Row-Level-Security.
 */
export function getSupabaseAdminClient() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    const errorMessage = [
      "❌ Supabase admin client configuration missing:",
      `• SUPABASE_URL / NEXT_PUBLIC_SUPABASE_URL → ${!!url ? "✅" : "❌"}`,
      `• SUPABASE_SERVICE_ROLE_KEY → ${!!serviceKey ? "✅" : "❌"}`,
      "",
      "Please add these variables in Vercel → Settings → Environment Variables:",
      "1. Go to your Vercel project dashboard",
      "2. Navigate to Settings → Environment Variables",
      "3. Add the missing variables from your Supabase project settings",
      "4. Redeploy your application",
    ].join("\n")

    throw new Error(errorMessage)
  }

  if (!adminClient) {
    console.log("🔧 Initializing Supabase admin client...")
    adminClient = createClient(url, serviceKey, {
      auth: {
        persistSession: false,
      },
    })
  }

  return adminClient
}

// Types for TypeScript
export interface ConsultationEvaluation {
  id?: string
  company: string
  industry: string
  company_size: string
  current_challenge: string
  process_type: string
  urgency?: string
  budget?: string
  expected_roi?: string
  estimated_min_price?: number
  estimated_max_price?: number
  estimated_duration?: string
  created_at?: string
}

export interface ContactSubmission {
  id?: string
  consultation_id?: string
  name: string
  email: string
  company?: string
  phone?: string
  service_type?: string
  message?: string
  status?: string
  meeting_time?: string
  created_at?: string
}

export interface NotificationSent {
  id?: string
  contact_id: string
  notification_type: string
  recipient: string
  subject?: string
  content?: string
  sent_at?: string
  status?: string
}
