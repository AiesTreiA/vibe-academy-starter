import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase"
import { generateOrFetchArticleImage } from "@/lib/article-image-service"

function checkAuth(request: NextRequest) {
  const session = request.cookies.get("admin_session")?.value
  return session === "authenticated"
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  }

  const supabase = getSupabaseAdminClient() as any

  try {
    const body = await request.json()
    const { id, slug } = body

    if (!id && !slug) {
      return NextResponse.json({ success: false, error: "Missing article id or slug" }, { status: 400 })
    }

    // Fetch existing article
    let query = supabase.from("articles").select("*")
    if (id) {
      query = query.eq("id", id)
    } else {
      query = query.eq("slug", slug)
    }

    const { data: articles, error: fetchError } = await query
    if (fetchError || !articles || articles.length === 0) {
      return NextResponse.json({ success: false, error: "Article not found" }, { status: 404 })
    }

    const article = articles[0]
    const primaryKeyword = article.keywords?.[0] || article.title

    console.log(`🎨 Regenerating image for article: "${article.title}" (${article.slug})`)

    const imageResult = await generateOrFetchArticleImage({
      title: article.title,
      keyword: primaryKeyword,
      category: article.category,
      subtitle: article.subtitle,
      slug: article.slug
    })

    const newImageUrl = imageResult.url

    // Update json_ld if present
    const updatedJsonLd = article.json_ld ? { ...article.json_ld } : {}
    if (updatedJsonLd.article) {
      updatedJsonLd.article.image = newImageUrl
    }

    const { data: updatedData, error: updateError } = await supabase
      .from("articles")
      .update({
        image_url: newImageUrl,
        json_ld: updatedJsonLd,
        updated_at: new Date().toISOString()
      })
      .eq("id", article.id)
      .select()

    if (updateError) {
      console.error("Error updating article image:", updateError)
      return NextResponse.json({ success: false, error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: {
        id: article.id,
        slug: article.slug,
        image_url: newImageUrl,
        source: imageResult.source,
        photographer: imageResult.photographer
      }
    }, { status: 200 })
  } catch (err: any) {
    console.error("Regenerate image error:", err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
