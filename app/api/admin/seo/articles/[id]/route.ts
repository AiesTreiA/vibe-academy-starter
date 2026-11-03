import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase"
import { triggerDistributionWebhook } from "@/lib/webhook"

// Utility to check session cookie authentication
function checkAuth(request: NextRequest) {
  const session = request.cookies.get("admin_session")?.value
  return session === "authenticated"
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAuth(request)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const supabase = getSupabaseAdminClient() as any

  try {
    const body = await request.json()

    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString()
    }

    // Dynamic mapping of attributes
    const allowedKeys = [
      "title", "subtitle", "slug", "meta_title", "meta_description", 
      "category", "read_time", "image_url", "content", "toc", "faq", "myths", 
      "cta_type", "cta_custom_text", "cta_custom_url", "json_ld", 
      "status", "keywords", "impressions", "clicks", "ctr", "avg_position",
      "tokens_huawei_in", "tokens_huawei_out", "tokens_gemini_in", "tokens_gemini_out",
      "tokens_claude_in", "tokens_claude_out", "cost_usd"
    ]

    for (const key of allowedKeys) {
      if (body[key] !== undefined) {
        updateData[key] = body[key]
      }
    }

    if (updateData.slug) {
      updateData.slug = updateData.slug.toLowerCase().replace(/[^a-z0-9-_]/g, "")
    }

    const { data, error } = await supabase
      .from("articles")
      .update(updateData)
      .eq("id", id)
      .select()

    if (error) {
      console.error("Error updating article:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    const updatedArticle = data[0]
    if (updatedArticle.status === "published") {
      triggerDistributionWebhook(updatedArticle).catch(err => 
        console.error("Failed to trigger webhook after article update:", err)
      )
    }

    return NextResponse.json({ success: true, data: updatedArticle }, { status: 200 })
  } catch (err: any) {
    console.error("Admin SEO Article dynamic PUT error:", err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAuth(request)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const supabase = getSupabaseAdminClient() as any

  try {
    const { error } = await supabase
      .from("articles")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("Error deleting article:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Article deleted successfully" }, { status: 200 })
  } catch (err: any) {
    console.error("Admin SEO Article dynamic DELETE error:", err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
