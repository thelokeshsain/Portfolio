import crypto from "crypto";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { withAuth } from "@/lib/auth";
import connectDB from "@/lib/db";
import Article from "@/models/Article";
import { slugify, estimateReadingTime } from "@/utils/blogUtils";
import { isSafeUrl } from "@/utils/validate";

const VALID_CATEGORIES = [
  "Geopolitics",
  "Technology",
  "Business",
  "Sports",
  "Immigration & Careers",
  "Opinion",
];

const VALID_STATUSES = ["draft", "published", "archived"];
const VALID_TYPES = ["Analysis", "Opinion", "Reporting", "None"];

function generatePreviewToken(articleId) {
  const secret = process.env.JWT_SECRET || "fallback_secret";
  return crypto.createHmac("sha256", secret).update(String(articleId)).digest("hex");
}

/**
 * GET /api/admin/blog
 * Lists all articles with optional filtering and metrics
 */
export const GET = withAuth(async (request) => {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "all";
    const search = (searchParams.get("search") || "").trim();
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));

    const filter = {};
    if (status !== "all" && VALID_STATUSES.includes(status)) {
      filter.status = status;
    }
    if (search) {
      const sanitized = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { title: { $regex: sanitized, $options: "i" } },
        { dek: { $regex: sanitized, $options: "i" } },
        { category: { $regex: sanitized, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const [articles, totalCount, totalPublished, totalDrafts, totalArchived] =
      await Promise.all([
        Article.find(filter)
          .sort({ updatedAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Article.countDocuments(filter),
        Article.countDocuments({ status: "published" }),
        Article.countDocuments({ status: "draft" }),
        Article.countDocuments({ status: "archived" }),
      ]);

    return NextResponse.json({
      success: true,
      articles: articles.map((a) => ({
        id: a._id.toString(),
        title: a.title,
        slug: a.slug,
        dek: a.dek,
        category: a.category,
        status: a.status,
        featured: Boolean(a.featured),
        isAnalysisOrOpinion: a.isAnalysisOrOpinion,
        readingTime: a.readingTime,
        publishedAt: a.publishedAt,
        updatedAt: a.updatedAt,
        createdAt: a.createdAt,
        views: a.views || 0,
        previewToken: generatePreviewToken(a._id.toString()),
      })),
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit) || 1,
      },
      counts: {
        all: totalPublished + totalDrafts + totalArchived,
        published: totalPublished,
        draft: totalDrafts,
        archived: totalArchived,
      },
    });
  } catch (err) {
    console.error("GET /api/admin/blog error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to fetch articles" },
      { status: 500 }
    );
  }
});

/**
 * POST /api/admin/blog
 * Creates a new article (draft or published)
 */
export const POST = withAuth(async (request) => {
  try {
    await connectDB();
    const body = await request.json();

    const {
      title,
      slug: customSlug,
      dek,
      category,
      tags,
      content,
      coverImage,
      author,
      status,
      featured,
      isAnalysisOrOpinion,
      seoTitle,
      seoDescription,
      canonicalUrl,
      sources,
    } = body;

    // Validation
    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json(
        { success: false, message: "Article title is required" },
        { status: 400 }
      );
    }
    if (title.length > 300) {
      return NextResponse.json(
        { success: false, message: "Title cannot exceed 300 characters" },
        { status: 400 }
      );
    }

    if (!dek || typeof dek !== "string" || !dek.trim()) {
      return NextResponse.json(
        { success: false, message: "Editorial dek/summary is required" },
        { status: 400 }
      );
    }
    if (dek.length > 600) {
      return NextResponse.json(
        { success: false, message: "Dek cannot exceed 600 characters" },
        { status: 400 }
      );
    }

    if (!content || typeof content !== "string" || !content.trim()) {
      return NextResponse.json(
        { success: false, message: "Article content is required" },
        { status: 400 }
      );
    }

    const validatedCategory = VALID_CATEGORIES.includes(category)
      ? category
      : "Technology";
    const validatedStatus = VALID_STATUSES.includes(status) ? status : "draft";
    const validatedType = VALID_TYPES.includes(isAnalysisOrOpinion)
      ? isAnalysisOrOpinion
      : "Analysis";

    // Slug generation & collision handling
    let baseSlug = slugify(customSlug || title);
    if (!baseSlug) baseSlug = `article-${Date.now()}`;

    let uniqueSlug = baseSlug;
    let counter = 1;
    while (await Article.findOne({ slug: uniqueSlug })) {
      uniqueSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Reading time
    const readingTime = estimateReadingTime(content);

    // Validate URLs in sources
    const validatedSources = Array.isArray(sources)
      ? sources
          .filter((s) => s && s.title && s.url && isSafeUrl(s.url))
          .map((s) => ({
            title: String(s.title).slice(0, 300).trim(),
            organization: String(s.organization || "").slice(0, 150).trim(),
            url: String(s.url).slice(0, 1000).trim(),
            publishDate: String(s.publishDate || "").slice(0, 50).trim(),
            accessDate: String(s.accessDate || "").slice(0, 50).trim(),
          }))
      : [];

    const articleData = {
      title: title.trim(),
      slug: uniqueSlug,
      dek: dek.trim(),
      category: validatedCategory,
      tags: Array.isArray(tags)
        ? tags.map((t) => String(t).slice(0, 50).trim()).filter(Boolean)
        : [],
      content: content.trim(),
      coverImage: {
        url: coverImage?.url && isSafeUrl(coverImage.url) ? coverImage.url.slice(0, 2000000) : "",
        alt: String(coverImage?.alt || "").slice(0, 300).trim(),
        caption: String(coverImage?.caption || "").slice(0, 500).trim(),
        credit: String(coverImage?.credit || "").slice(0, 200).trim(),
      },
      author: {
        name: String(author?.name || "Lokesh Sain").slice(0, 100).trim(),
        role: String(author?.role || "Software Engineer & Independent Commentator").slice(0, 150).trim(),
        bio: String(author?.bio || "").slice(0, 500).trim(),
        avatar: author?.avatar && isSafeUrl(author.avatar) ? author.avatar.slice(0, 2000000) : "",
      },
      readingTime,
      status: validatedStatus,
      featured: Boolean(featured),
      isAnalysisOrOpinion: validatedType,
      seoTitle: String(seoTitle || title).slice(0, 200).trim(),
      seoDescription: String(seoDescription || dek).slice(0, 320).trim(),
      canonicalUrl: canonicalUrl && isSafeUrl(canonicalUrl) ? canonicalUrl.slice(0, 500).trim() : "",
      sources: validatedSources,
      publishedAt: validatedStatus === "published" ? new Date() : null,
    };

    const newArticle = await Article.create(articleData);

    // Revalidate public routes
    try {
      revalidatePath("/blog");
      revalidatePath(`/blog/${uniqueSlug}`);
      revalidatePath("/sitemap.xml");
      revalidatePath("/");
    } catch (e) {
      console.warn("Revalidation notice:", e.message);
    }

    return NextResponse.json({
      success: true,
      article: newArticle.toPublicJSON(),
      message: `Article successfully created as ${validatedStatus}.`,
    });
  } catch (err) {
    console.error("POST /api/admin/blog error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to create article: " + err.message },
      { status: 500 }
    );
  }
});
