import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase"
import { triggerDistributionWebhook } from "@/lib/webhook"

// Utility to check session cookie authentication
function checkAuth(request: NextRequest) {
  const session = request.cookies.get("admin_session")?.value
  return session === "authenticated"
}

export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  }

  const supabase = getSupabaseAdminClient() as any

  try {
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching articles:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data }, { status: 200 })
  } catch (err: any) {
    console.error("Admin SEO Articles GET error:", err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  }

  const supabase = getSupabaseAdminClient() as any

  try {
    const body = await request.json()
    
    // Validaciones básicas
    if (!body.title || !body.slug || !body.content) {
      return NextResponse.json({ success: false, error: "Missing required fields (title, slug, content)" }, { status: 400 })
    }

    // Asegurar que el slug sea limpio
    const cleanSlug = body.slug.toLowerCase().replace(/[^a-z0-9-_]/g, "")

    const articleData = {
      title: body.title,
      subtitle: body.subtitle || "",
      slug: cleanSlug,
      meta_title: body.meta_title || body.title.slice(0, 60),
      meta_description: body.meta_description || body.subtitle?.slice(0, 155) || "",
      category: body.category || "automatizacion",
      read_time: parseInt(body.read_time) || 5,
      image_url: body.image_url || body.json_ld?.article?.image || null,
      content: body.content,
      toc: body.toc || null,
      faq: body.faq || null,
      myths: body.myths || null,
      cta_type: body.cta_type || "both",
      cta_custom_text: body.cta_custom_text || "",
      cta_custom_url: body.cta_custom_url || "",
      json_ld: body.json_ld || null,
      status: body.status || "published",
      keywords: body.keywords || [],
      impressions: parseInt(body.impressions) || 0,
      clicks: parseInt(body.clicks) || 0,
      ctr: parseFloat(body.ctr) || 0.00,
      avg_position: parseFloat(body.avg_position) || 0.00,
      tokens_huawei_in: parseInt(body.tokens_huawei_in) || 0,
      tokens_huawei_out: parseInt(body.tokens_huawei_out) || 0,
      tokens_gemini_in: parseInt(body.tokens_gemini_in) || 0,
      tokens_gemini_out: parseInt(body.tokens_gemini_out) || 0,
      tokens_claude_in: parseInt(body.tokens_claude_in) || 0,
      tokens_claude_out: parseInt(body.tokens_claude_out) || 0,
      cost_usd: parseFloat(body.cost_usd) || 0.00000,
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from("articles")
      .insert([articleData])
      .select()

    if (error) {
      console.error("Error creating article:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    const createdArticle = data[0]
    if (createdArticle.status === "published") {
      triggerDistributionWebhook(createdArticle).catch(err => 
        console.error("Failed to trigger webhook after article creation:", err)
      )
    }

    return NextResponse.json({ success: true, data: createdArticle }, { status: 200 })
  } catch (err: any) {
    console.error("Admin SEO Articles POST error:", err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
