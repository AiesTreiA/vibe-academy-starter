import { NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase"

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const userId = url.searchParams.get("userId")
    const includeUnpublished = url.searchParams.get("admin") === "true"

    const supabase = getSupabaseAdminClient() as any

    let query = supabase.from("vibecode_classes").select("*").order("order_index", { ascending: true })

    if (!includeUnpublished) {
      query = query.eq("is_published", true)
    }

    const { data: classes, error: classesError } = await query

    if (classesError) {
      console.error("❌ Error fetching classes:", classesError)
      return NextResponse.json({ error: "Error al cargar las clases" }, { status: 500 })
    }

    // Fetch user progress if userId provided
    let userProgressMap: Record<string, boolean> = {}
    if (userId) {
      const { data: progressData } = await supabase
        .from("vibecode_user_progress")
        .select("class_id, completed")
        .eq("user_id", userId)

      if (progressData) {
        progressData.forEach((p: any) => {
          userProgressMap[p.class_id] = p.completed
        })
      }
    }

    const classesWithProgress = (classes || []).map((cls: any) => ({
      ...cls,
      completed: !!userProgressMap[cls.id]
    }))

    return NextResponse.json({
      success: true,
      classes: classesWithProgress
    })
  } catch (err: any) {
    console.error("❌ Exception in classes route:", err)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const {
      module_number,
      module_title,
      title,
      description,
      errata,
      video_url,
      duration_minutes,
      order_index,
      timestamps,
      resources
    } = body

    if (!title || !video_url) {
      return NextResponse.json({ error: "Título y URL de video son requeridos" }, { status: 400 })
    }

    const supabase = getSupabaseAdminClient() as any

    const newClass = {
      module_number: module_number || 1,
      module_title: module_title || "Módulo 1: Fundamentos",
      title,
      description: description || "",
      errata: errata || null,
      video_url,
      duration_minutes: duration_minutes || 60,
      order_index: order_index || 1,
      is_published: true,
      timestamps: timestamps || [],
      resources: resources || [],
      created_at: new Date().toISOString()
    }

    const { data, error } = await supabase.from("vibecode_classes").insert(newClass).select().single()

    if (error) {
      console.error("❌ Error inserting new class:", error)
      return NextResponse.json({ error: "Error al crear la clase" }, { status: 500 })
    }

    return NextResponse.json({ success: true, class: data })
  } catch (err: any) {
    console.error("❌ Exception creating class:", err)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: "ID de clase es requerido" }, { status: 400 })
    }

    const supabase = getSupabaseAdminClient() as any
    const { data, error } = await supabase.from("vibecode_classes").update(updates).eq("id", id).select().single()

    if (error) {
      console.error("❌ Error updating class:", error)
      return NextResponse.json({ error: "Error actualizando clase" }, { status: 500 })
    }

    return NextResponse.json({ success: true, class: data })
  } catch (err: any) {
    console.error("❌ Exception updating class:", err)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url)
    const id = url.searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID es requerido" }, { status: 400 })
    }

    const supabase = getSupabaseAdminClient() as any
    const { error } = await supabase.from("vibecode_classes").delete().eq("id", id)

    if (error) {
      console.error("❌ Error deleting class:", error)
      return NextResponse.json({ error: "Error eliminando clase" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error("❌ Exception deleting class:", err)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
