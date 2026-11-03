import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(req: NextRequest) {
  console.log("[v0] Starting consultation submission...")

  try {
    // Parse the request body
    let payload
    try {
      payload = await req.json()
      console.log("[v0] Payload received:", {
        company: payload?.company,
        industry: payload?.industry,
        process_type: payload?.process_type,
        hasAllFields: !!(
          payload?.company &&
          payload?.industry &&
          payload?.company_size &&
          payload?.current_challenge &&
          payload?.process_type
        ),
      })
    } catch (parseError) {
      console.error("[v0] Failed to parse request body:", parseError)
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request body",
          error: "PARSE_ERROR",
        },
        { status: 400 },
      )
    }

    // Get environment variables with detailed logging
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    console.log("[v0] Environment check:", {
      hasUrl: !!supabaseUrl,
      urlPreview: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : "missing",
      hasServiceKey: !!supabaseServiceKey,
      serviceKeyPreview: supabaseServiceKey ? `${supabaseServiceKey.substring(0, 10)}...` : "missing",
    })

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("[v0] Missing Supabase environment variables")
      return NextResponse.json(
        {
          success: false,
          message: "Server configuration error - missing database credentials",
          error: "MISSING_ENV_VARS",
          details: {
            hasUrl: !!supabaseUrl,
            hasServiceKey: !!supabaseServiceKey,
            envVarsChecked: ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"],
          },
        },
        { status: 500 },
      )
    }

    // Validate required fields
    const requiredFields = ["company", "industry", "company_size", "current_challenge", "process_type"]
    const missingFields = requiredFields.filter((field) => !payload[field])

    if (missingFields.length > 0) {
      console.error("[v0] Missing required fields:", missingFields)
      return NextResponse.json(
        {
          success: false,
          message: `Missing required fields: ${missingFields.join(", ")}`,
          error: "VALIDATION_ERROR",
          missingFields,
        },
        { status: 400 },
      )
    }

    // Create Supabase client with detailed configuration
    console.log("[v0] Creating Supabase client...")
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })

    // Test connection first
    console.log("[v0] Testing Supabase connection...")
    try {
      const { error: healthError } = await supabase
        .from("consultation_evaluations")
        .select("count", { count: "exact", head: true })

      if (healthError) {
        console.error("[v0] Health check failed:", {
          code: healthError.code,
          message: healthError.message,
        })

        // If table doesn't exist, provide specific guidance
        if (healthError.code === "PGRST116" || healthError.message?.includes("does not exist")) {
          return NextResponse.json(
            {
              success: false,
              message: "Database tables not found",
              error: "TABLES_NOT_FOUND",
              details: "Please run the database setup script or create tables manually in Supabase SQL Editor",
            },
            { status: 500 },
          )
        }

        // Other connection errors
        return NextResponse.json(
          {
            success: false,
            message: "Database connection failed",
            error: "CONNECTION_ERROR",
            details: {
              code: healthError.code,
              message: healthError.message,
            },
          },
          { status: 500 },
        )
      }

      console.log("[v0] Health check passed")
    } catch (connectionError: any) {
      console.error("[v0] Connection test exception:", connectionError.message)
      return NextResponse.json(
        {
          success: false,
          message: "Failed to connect to database",
          error: "CONNECTION_FAILED",
          details: connectionError.message,
        },
        { status: 500 },
      )
    }

    console.log("[v0] Inserting consultation data...")
    let data, error
    try {
      const insertResult = await supabase.from("consultation_evaluations").insert([payload]).select().single()
      data = insertResult.data
      error = insertResult.error
    } catch (insertException: any) {
      console.error("[v0] Insert exception caught:", insertException.message)
      return NextResponse.json(
        {
          success: false,
          message: "Failed to save consultation",
          error: "INSERT_EXCEPTION",
          details: {
            message: insertException.message,
            name: insertException.name,
          },
        },
        { status: 500 },
      )
    }

    // Handle insert result
    if (error) {
      console.error("[v0] Insert failed with error object:", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      })

      return NextResponse.json(
        {
          success: false,
          message: "Failed to save consultation",
          error: error.code || "INSERT_ERROR",
          details: {
            message: error.message,
            code: error.code,
            hint: error.hint,
            details: error.details,
          },
        },
        { status: 500 },
      )
    }

    if (!data) {
      console.error("[v0] No data returned from insert")
      return NextResponse.json(
        {
          success: false,
          message: "Insert succeeded but no data returned",
          error: "NO_DATA_RETURNED",
        },
        { status: 500 },
      )
    }

    console.log("[v0] Consultation saved successfully:", data.id)

    return NextResponse.json(
      {
        success: true,
        consultationId: data.id,
        message: "Evaluación guardada exitosamente",
      },
      { status: 200 },
    )
  } catch (err: any) {
    console.error("[v0] Unexpected error:", {
      message: err.message,
      name: err.name,
    })

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: "UNEXPECTED_ERROR",
        details: {
          message: err.message,
          type: err.name,
        },
      },
      { status: 500 },
    )
  }
}
