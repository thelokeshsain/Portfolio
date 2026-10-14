const mongoose = require("mongoose");

const sourceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, maxlength: 300, trim: true },
    organization: { type: String, required: true, maxlength: 150, trim: true },
    url: { type: String, required: true, maxlength: 1000, trim: true },
    publishDate: { type: String, maxlength: 50, trim: true },
    accessDate: { type: String, maxlength: 50, trim: true },
  },
  { _id: false }
);

const articleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Article title is required"],
      maxlength: 300,
      trim: true,
    },
    slug: {
      type: String,
      required: [true, "Slug is required"],
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
      maxlength: 320,
    },
    dek: {
      type: String,
      required: [true, "Editorial dek/summary is required"],
      maxlength: 600,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Geopolitics",
        "Technology",
        "Business",
        "Sports",
        "Immigration & Careers",
        "Opinion",
      ],
      default: "Technology",
      index: true,
    },
    tags: [
      {
        type: String,
        maxlength: 50,
        trim: true,
      },
    ],
    content: {
      type: String,
      required: [true, "Article content is required"],
      maxlength: 100000,
    },
    coverImage: {
      url: { type: String, maxlength: 2000000, default: "" },
      alt: { type: String, maxlength: 300, default: "" },
      caption: { type: String, maxlength: 500, default: "" },
      credit: { type: String, maxlength: 200, default: "" },
    },
    author: {
      name: { type: String, default: "Lokesh Sain", maxlength: 100 },
      role: {
        type: String,
        default: "Software Engineer & Independent Commentator",
        maxlength: 150,
      },
      bio: {
        type: String,
        default:
          "Software Engineer based in Jaipur, India. Writing technical deep-dives on software architecture, Next.js performance, cloud security, and web engineering.",
        maxlength: 500,
      },
      avatar: { type: String, maxlength: 2000000, default: "" },
    },
    readingTime: {
      type: String,
      default: "5 min read",
      maxlength: 50,
    },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
      index: true,
    },
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
    isAnalysisOrOpinion: {
      type: String,
      enum: ["Analysis", "Opinion", "Reporting", "None"],
      default: "Analysis",
    },
    seoTitle: {
      type: String,
      maxlength: 200,
      trim: true,
    },
    seoDescription: {
      type: String,
      maxlength: 320,
      trim: true,
    },
    canonicalUrl: {
      type: String,
      maxlength: 500,
      trim: true,
    },
    sources: [sourceSchema],
    publishedAt: {
      type: Date,
      default: null,
      index: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    aiSummary: {
      summary: { type: String, maxlength: 2000, default: "" },
      keyPoints: [{ type: String, maxlength: 500 }],
      contentHash: { type: String, maxlength: 64, default: "" },
      model: { type: String, maxlength: 100, default: "" },
      generatedAt: { type: Date, default: null },
      inputTokens: { type: Number, default: 0 },
      outputTokens: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for optimal query execution and zero-latency lookups
articleSchema.index({ slug: 1, status: 1 });
articleSchema.index({ status: 1, publishedAt: -1 });
articleSchema.index({ status: 1, category: 1, publishedAt: -1 });

// Helper method to compute public representation
articleSchema.methods.toPublicJSON = function () {
  return {
    id: this._id.toString(),
    title: this.title,
    slug: this.slug,
    dek: this.dek,
    category: this.category,
    tags: this.tags || [],
    content: this.content,
    coverImage: this.coverImage || {},
    author: this.author || {},
    readingTime: this.readingTime,
    status: this.status,
    featured: this.featured,
    isAnalysisOrOpinion: this.isAnalysisOrOpinion,
    seoTitle: this.seoTitle || this.title,
    seoDescription: this.seoDescription || this.dek,
    canonicalUrl: this.canonicalUrl || "",
    sources: this.sources || [],
    aiSummary: this.aiSummary || null,
    publishedAt: this.publishedAt ? this.publishedAt.toISOString() : null,
    updatedAt: this.updatedAt ? this.updatedAt.toISOString() : null,
    createdAt: this.createdAt ? this.createdAt.toISOString() : null,
  };
};

module.exports = mongoose.models.Article || mongoose.model("Article", articleSchema);
