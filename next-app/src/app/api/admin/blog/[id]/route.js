import mongoose from "mongoose";
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

/**
 * GET /api/admin/blog/[id]
 * Fetch single article for editing
 */
export const GET = withAuth(async (request, { params }) => {
  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid article ID format" },
        { status: 400 }
      );
    }
    await connectDB();

    const article = await Article.findById(id).lean();
    if (!article) {
      return NextResponse.json(
        { success: false, message: "Article not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      article: {
        id: article._id.toString(),
        title: article.title,
        slug: article.slug,
        dek: article.dek,
        category: article.category,
        tags: article.tags || [],
        content: article.content,
        coverImage: article.coverImage || {},
        author: article.author || {},
        readingTime: article.readingTime,
        status: article.status,
        featured: Boolean(article.featured),
        isAnalysisOrOpinion: article.isAnalysisOrOpinion,
        seoTitle: article.seoTitle || "",
        seoDescription: article.seoDescription || "",
        canonicalUrl: article.canonicalUrl || "",
        sources: article.sources || [],
        publishedAt: article.publishedAt,
        updatedAt: article.updatedAt,
        createdAt: article.createdAt,
        views: article.views || 0,
      },
    });
  } catch (err) {
    console.error("GET /api/admin/blog/[id] error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to fetch article" },
      { status: 500 }
    );
  }
});

/**
 * PUT /api/admin/blog/[id]
 * Update an existing article
 */
export const PUT = withAuth(async (request, { params }) => {
  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid article ID format" },
        { status: 400 }
      );
    }
    await connectDB();
    const body = await request.json();

    const article = await Article.findById(id);
    if (!article) {
      return NextResponse.json(
        { success: false, message: "Article not found" },
        { status: 404 }
      );
    }

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

    if (title && (typeof title !== "string" || !title.trim())) {
      return NextResponse.json(
        { success: false, message: "Valid title is required" },
        { status: 400 }
      );
    }
    if (dek && (typeof dek !== "string" || !dek.trim())) {
      return NextResponse.json(
        { success: false, message: "Valid editorial dek is required" },
        { status: 400 }
      );
    }
    if (content && (typeof content !== "string" || !content.trim())) {
      return NextResponse.json(
        { success: false, message: "Valid content is required" },
        { status: 400 }
      );
    }

    const oldSlug = article.slug;
    let newSlug = article.slug;

    // Handle slug change if provided
    if (customSlug && customSlug !== article.slug) {
      let candidateSlug = slugify(customSlug);
      if (!candidateSlug) candidateSlug = `article-${Date.now()}`;
      let uniqueSlug = candidateSlug;
      let counter = 1;
      while (
        await Article.findOne({
          slug: uniqueSlug,
          _id: { $ne: article._id },
        })
      ) {
        uniqueSlug = `${candidateSlug}-${counter}`;
        counter++;
      }
      newSlug = uniqueSlug;
    }

    // Apply updates
    if (title) article.title = title.trim().slice(0, 300);
    article.slug = newSlug;
    if (dek) article.dek = dek.trim().slice(0, 600);
    if (category && VALID_CATEGORIES.includes(category)) {
      article.category = category;
    }
    if (Array.isArray(tags)) {
      article.tags = tags
        .map((t) => String(t).slice(0, 50).trim())
        .filter(Boolean);
    }
    if (content) {
      article.content = content.trim();
      article.readingTime = estimateReadingTime(content);
    }

    if (coverImage) {
      article.coverImage = {
        url: coverImage.url && isSafeUrl(coverImage.url) ? coverImage.url.slice(0, 2000000) : "",
        alt: String(coverImage.alt || "").slice(0, 300).trim(),
        caption: String(coverImage.caption || "").slice(0, 500).trim(),
        credit: String(coverImage.credit || "").slice(0, 200).trim(),
      };
    }

    if (author) {
      article.author = {
        name: String(author.name || "Lokesh Sain").slice(0, 100).trim(),
        role: String(author.role || "Software Engineer & Independent Commentator").slice(0, 150).trim(),
        bio: String(author.bio || "").slice(0, 500).trim(),
        avatar: author.avatar && isSafeUrl(author.avatar) ? author.avatar.slice(0, 2000000) : "",
      };
    }

    if (status && VALID_STATUSES.includes(status)) {
      // If transitioning to published for the first time, set publishedAt
      if (status === "published" && !article.publishedAt) {
        article.publishedAt = new Date();
      }
      article.status = status;
    }

    if (typeof featured === "boolean") {
      article.featured = featured;
    }

    if (isAnalysisOrOpinion && VALID_TYPES.includes(isAnalysisOrOpinion)) {
      article.isAnalysisOrOpinion = isAnalysisOrOpinion;
    }

    if (seoTitle !== undefined) {
      article.seoTitle = String(seoTitle).slice(0, 200).trim();
    }
    if (seoDescription !== undefined) {
      article.seoDescription = String(seoDescription).slice(0, 320).trim();
    }
    if (canonicalUrl !== undefined) {
      article.canonicalUrl =
        canonicalUrl && isSafeUrl(canonicalUrl)
          ? canonicalUrl.slice(0, 500).trim()
          : "";
    }

    if (Array.isArray(sources)) {
      article.sources = sources
        .filter((s) => s && s.title && s.url && isSafeUrl(s.url))
        .map((s) => ({
          title: String(s.title).slice(0, 300).trim(),
          organization: String(s.organization || "").slice(0, 150).trim(),
          url: String(s.url).slice(0, 1000).trim(),
          publishDate: String(s.publishDate || "").slice(0, 50).trim(),
          accessDate: String(s.accessDate || "").slice(0, 50).trim(),
        }));
    }

    article.updatedAt = new Date();
    await article.save();

    // Revalidate paths
    try {
      revalidatePath("/blog");
      revalidatePath(`/blog/${article.slug}`);
      if (oldSlug !== article.slug) {
        revalidatePath(`/blog/${oldSlug}`);
      }
      revalidatePath("/sitemap.xml");
    } catch (e) {
      console.warn("Revalidation warning:", e.message);
    }

    return NextResponse.json({
      success: true,
      article: article.toPublicJSON(),
      message: "Article updated successfully",
    });
  } catch (err) {
    console.error("PUT /api/admin/blog/[id] error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to update article: " + err.message },
      { status: 500 }
    );
  }
});

/**
 * DELETE /api/admin/blog/[id]
 * Delete or archive article
 */
export const DELETE = withAuth(async (request, { params }) => {
  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid article ID format" },
        { status: 400 }
      );
    }
    await connectDB();
    const { searchParams } = new URL(request.url);
    const permanent = searchParams.get("permanent") === "true";

    const article = await Article.findById(id);
    if (!article) {
      return NextResponse.json(
        { success: false, message: "Article not found" },
        { status: 404 }
      );
    }

    const slug = article.slug;

    if (permanent) {
      await Article.findByIdAndDelete(id);
    } else {
      article.status = "archived";
      article.updatedAt = new Date();
      await article.save();
    }

    try {
      revalidatePath("/blog");
      revalidatePath(`/blog/${slug}`);
      revalidatePath("/sitemap.xml");
    } catch (e) {
      console.warn("Revalidation warning:", e.message);
    }

    return NextResponse.json({
      success: true,
      message: permanent ? "Article permanently deleted" : "Article archived",
    });
  } catch (err) {
    console.error("DELETE /api/admin/blog/[id] error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to delete article" },
      { status: 500 }
    );
  }
});
