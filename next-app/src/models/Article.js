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
          "Software Engineer based in Jaipur. Writing independent analyses on technology, global affairs, industry policy, and modern engineering.",
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
  },
  {
    timestamps: true,
  }
);

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
    publishedAt: this.publishedAt ? this.publishedAt.toISOString() : null,
    updatedAt: this.updatedAt ? this.updatedAt.toISOString() : null,
    createdAt: this.createdAt ? this.createdAt.toISOString() : null,
  };
};

module.exports = mongoose.models.Article || mongoose.model("Article", articleSchema);
