import { NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase"

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const category = url.searchParams.get("category")

    const supabase = getSupabaseAdminClient() as any

    let query = supabase
      .from("vibecode_pitch_match")
      .select("*")
      .eq("is_hidden", false)
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false })

    if (category && category !== "all") {
      query = query.eq("category", category)
    }

    const { data: posts, error } = await query

    if (error) {
      console.error("❌ Error fetching pitch & match posts:", error)
      return NextResponse.json({ error: "Error al cargar las publicaciones de Pitch & Match" }, { status: 500 })
    }

    return NextResponse.json({ success: true, posts: posts || [] })
  } catch (err: any) {
    console.error("❌ Exception in pitch-match GET route:", err)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const {
      userId,
      author_name,
      author_role,
      author_avatar,
      title,
      category,
      description,
      tech_stack,
      contact_info,
      looking_for
    } = body

    if (!userId || !title || !description || !contact_info) {
      return NextResponse.json({ error: "Título, descripción y datos de contacto son requeridos" }, { status: 400 })
    }

    const supabase = getSupabaseAdminClient() as any

    const newPost = {
      user_id: userId,
      author_name: author_name || "Alumno Vibecode",
      author_role: author_role || "Alumno",
      author_avatar: author_avatar || null,
      title,
      category: category || "idea",
      description,
      tech_stack: Array.isArray(tech_stack) ? tech_stack : (tech_stack ? tech_stack.split(",").map((s: string) => s.trim()) : []),
      contact_info,
      looking_for: looking_for || null,
      likes_count: 0,
      is_pinned: false,
      is_hidden: false,
      created_at: new Date().toISOString()
    }

    const { data, error } = await supabase.from("vibecode_pitch_match").insert(newPost).select().single()

    if (error) {
      console.error("❌ Error creating pitch match post:", error)
      return NextResponse.json({ error: "Error al crear la publicación" }, { status: 500 })
    }

    return NextResponse.json({ success: true, post: data })
  } catch (err: any) {
    console.error("❌ Exception creating pitch match post:", err)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const { postId, action, ...updates } = body

    if (!postId) {
      return NextResponse.json({ error: "postId es requerido" }, { status: 400 })
    }

    const supabase = getSupabaseAdminClient() as any

    if (action === "like") {
      const { data: current } = await supabase
        .from("vibecode_pitch_match")
        .select("likes_count")
        .eq("id", postId)
        .single()

      const newLikes = (current?.likes_count || 0) + 1
      const { data, error } = await supabase
        .from("vibecode_pitch_match")
        .update({ likes_count: newLikes })
        .eq("id", postId)
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: "Error dando me gusta" }, { status: 500 })
      }
      return NextResponse.json({ success: true, post: data })
    }

    // Admin updates (pin / edit / hide)
    const { data, error } = await supabase
      .from("vibecode_pitch_match")
      .update(updates)
      .eq("id", postId)
      .select()
      .single()

    if (error) {
      console.error("❌ Error updating pitch match post:", error)
      return NextResponse.json({ error: "Error actualizando publicación" }, { status: 500 })
    }

    return NextResponse.json({ success: true, post: data })
  } catch (err: any) {
    console.error("❌ Exception updating pitch match post:", err)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url)
    const postId = url.searchParams.get("postId")

    if (!postId) {
      return NextResponse.json({ error: "postId es requerido" }, { status: 400 })
    }

    const supabase = getSupabaseAdminClient() as any
    const { error } = await supabase
      .from("vibecode_pitch_match")
      .update({ is_hidden: true })
      .eq("id", postId)

    if (error) {
      console.error("❌ Error deleting/hiding post:", error)
      return NextResponse.json({ error: "Error eliminando publicación" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error("❌ Exception deleting post:", err)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
