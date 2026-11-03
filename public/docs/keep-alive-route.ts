import { NextResponse } from "next/server"
import { getSupabaseClient } from "@/lib/supabase"

// Forzar render dinámico para evitar que Next.js o Vercel sirvan una respuesta cacheada
export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(request: Request) {
  const startTime = Date.now()
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get("secret")
  const authHeader = request.headers.get("authorization")

  // Seguridad opcional con CRON_SECRET si está configurada en variables de entorno
  const expectedSecret = process.env.CRON_SECRET
  if (expectedSecret) {
    const isAuthorized =
      secret === expectedSecret ||
      authHeader === `Bearer ${expectedSecret}`

    if (!isAuthorized) {
      return NextResponse.json(
        {
          ok: false,
          error: "Unauthorized",
          message: "El token de autorización o secret es inválido.",
        },
        { status: 401 }
      )
    }
  }

  try {
    const supabase = getSupabaseClient()

    // Consulta ultraligera para activar la base de datos de Supabase sin costo de cómputo
    // Seleccionamos un registro o ejecutamos un ping sobre una tabla base
    const { data, error } = await supabase
      .from("quotes")
      .select("id")
      .limit(1)

    // Si la tabla quotes no existe todavía, devolvemos ok si PostgreSQL respondió el error 42P01
    if (error && error.code === "42P01") {
      // Código PostgreSQL 42P01: relation does not exist
      // La base de datos está despierta y respondió
      const elapsed = Date.now() - startTime
      return NextResponse.json(
        {
          ok: true,
          status: "alive",
          message: "Supabase Postgres respondió con éxito (Database Activa)",
          notice: "La tabla 'quotes' aún no ha sido creada, pero la conexión PostgreSQL está despierta.",
          latency_ms: elapsed,
          timestamp: new Date().toISOString(),
        },
        {
          status: 200,
          headers: {
            "Cache-Control": "no-store, max-age=0",
          },
        }
      )
    }

    if (error) {
      console.error("[Keep-Alive] Error al consultar Supabase:", error)
      return NextResponse.json(
        {
          ok: false,
          status: "error",
          error: error.message,
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      )
    }

    const elapsed = Date.now() - startTime

    return NextResponse.json(
      {
        ok: true,
        status: "alive",
        message: "Supabase Free Tier Keep-Alive exitoso. Base de datos activa y lista.",
        latency_ms: elapsed,
        records_found: data ? data.length : 0,
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
        },
      }
    )
  } catch (err: any) {
    console.error("[Keep-Alive] Excepción:", err)
    return NextResponse.json(
      {
        ok: false,
        status: "exception",
        error: err?.message || "Error desconocido en el servidor",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
