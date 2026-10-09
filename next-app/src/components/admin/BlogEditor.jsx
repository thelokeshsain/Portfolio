"use client";

import React, { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import {
  BookOpen,
  Plus,
  ArrowLeft,
  Save,
  Globe,
  Eye,
  Trash2,
  ExternalLink,
  Search,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  Sparkles,
  Link as LinkIcon,
  Share2,
} from "lucide-react";
import { useConfirm } from "../ui/ConfirmDialog";
import { Card, FL, DelBtn, CharCount } from "./AdminHelpers";
import { apiClient } from "../../context/AuthContext";
import { slugify, estimateReadingTime, parseMarkdownToHtml, formatDate } from "../../utils/blogUtils";

const CATEGORIES = [
  "Geopolitics",
  "Technology",
  "Business",
  "Sports",
  "Immigration & Careers",
  "Opinion",
];

const ANALYSIS_TYPES = ["Analysis", "Opinion", "Reporting", "None"];

const INITIAL_FORM = {
  id: null,
  title: "",
  slug: "",
  dek: "",
  category: "Technology",
  tags: "",
  content: "",
  coverImage: {
    url: "",
    alt: "",
    caption: "",
    credit: "",
  },
  author: {
    name: "Lokesh Sain",
    role: "Software Engineer & Independent Commentator",
    bio: "Software Engineer based in Jaipur. Writing independent analyses on technology, global affairs, industry policy, and modern engineering.",
    avatar: "",
  },
  status: "draft",
  featured: false,
  isAnalysisOrOpinion: "Analysis",
  seoTitle: "",
  seoDescription: "",
  canonicalUrl: "",
  sources: [],
};

export default function BlogEditor() {
  const { confirm, Dialog } = useConfirm();
  const [view, setView] = useState("list"); // 'list' | 'editor'
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [counts, setCounts] = useState({ all: 0, published: 0, draft: 0, archived: 0 });

  // Form State
  const [form, setForm] = useState(INITIAL_FORM);
  const [saving, setSaving] = useState(false);
  const [editorTab, setEditorTab] = useState("write"); // 'write' | 'preview'
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  // New source input state
  const [newSource, setNewSource] = useState({
    title: "",
    organization: "",
    url: "",
    publishDate: "",
    accessDate: "October 9, 2026",
  });

  const fetchArticles = useCallback(async () => {
    try {
      const q = new URLSearchParams({
        status: filterStatus,
        search: searchQuery,
      });
      const res = await apiClient.get(`/admin/blog?${q.toString()}`);
      if (res.data.success) {
        setArticles(res.data.articles || []);
        if (res.data.counts) setCounts(res.data.counts);
      }
    } catch (err) {
      toast.error("Failed to load articles");
    } finally {
      setLoading(false);
    }
  }, [filterStatus, searchQuery]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const q = new URLSearchParams({
          status: filterStatus,
          search: searchQuery,
        });
        const res = await apiClient.get(`/admin/blog?${q.toString()}`);
        if (!mounted) return;
        if (res.data.success) {
          setArticles(res.data.articles || []);
          if (res.data.counts) setCounts(res.data.counts);
        }
      } catch {
        if (mounted) toast.error("Failed to load articles");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [filterStatus, searchQuery]);

  const handleNewArticle = () => {
    setForm(INITIAL_FORM);
    setSlugManuallyEdited(false);
    setEditorTab("write");
    setView("editor");
  };

  const handleEditArticle = async (id) => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/admin/blog/${id}`);
      if (res.data.success) {
        const a = res.data.article;
        setForm({
          id: a.id,
          title: a.title,
          slug: a.slug,
          dek: a.dek,
          category: a.category || "Technology",
          tags: Array.isArray(a.tags) ? a.tags.join(", ") : "",
          content: a.content || "",
          coverImage: a.coverImage || { url: "", alt: "", caption: "", credit: "" },
          author: a.author || INITIAL_FORM.author,
          status: a.status || "draft",
          featured: Boolean(a.featured),
          isAnalysisOrOpinion: a.isAnalysisOrOpinion || "Analysis",
          seoTitle: a.seoTitle || "",
          seoDescription: a.seoDescription || "",
          canonicalUrl: a.canonicalUrl || "",
          sources: a.sources || [],
        });
        setSlugManuallyEdited(true);
        setView("editor");
      }
    } catch {
      toast.error("Failed to load article details");
    } finally {
      setLoading(false);
    }
  };

  const handleTitleChange = (val) => {
    setForm((prev) => ({
      ...prev,
      title: val,
      slug: slugManuallyEdited ? prev.slug : slugify(val),
    }));
  };

  const handleSave = async (forcedStatus = null) => {
    if (!form.title.trim()) {
      toast.error("Article title is required");
      return;
    }
    if (!form.dek.trim()) {
      toast.error("Editorial dek/summary is required");
      return;
    }
    if (!form.content.trim()) {
      toast.error("Article content is required");
      return;
    }

    setSaving(true);
    const targetStatus = forcedStatus || form.status;

    const payload = {
      ...form,
      status: targetStatus,
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };

    try {
      if (form.id) {
        // Update
        const res = await apiClient.put(`/admin/blog/${form.id}`, payload);
        if (res.data.success) {
          toast.success(`Article updated (${targetStatus})`);
          setForm((prev) => ({ ...prev, status: targetStatus }));
          fetchArticles();
        }
      } else {
        // Create
        const res = await apiClient.post("/admin/blog", payload);
        if (res.data.success) {
          toast.success(`Article created as ${targetStatus}`);
          setForm((prev) => ({ ...prev, id: res.data.article.id, status: targetStatus }));
          fetchArticles();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save article");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, title) => {
    const ok = await confirm({
      title: "Archive Article",
      message: `Are you sure you want to archive "${title}"? It will be unpublished immediately.`,
      confirmText: "Archive Article",
      danger: true,
    });
    if (!ok) return;

    try {
      const res = await apiClient.delete(`/admin/blog/${id}`);
      if (res.data.success) {
        toast.success("Article archived");
        fetchArticles();
        if (form.id === id) setView("list");
      }
    } catch {
      toast.error("Failed to delete article");
    }
  };

  const handleAddSource = () => {
    if (!newSource.title.trim() || !newSource.url.trim()) {
      toast.error("Source title and valid URL are required");
      return;
    }
    setForm((prev) => ({
      ...prev,
      sources: [...prev.sources, { ...newSource }],
    }));
    setNewSource({
      title: "",
      organization: "",
      url: "",
      publishDate: "",
      accessDate: "October 9, 2026",
    });
    toast.success("Source citation added");
  };

  const handleRemoveSource = (idx) => {
    setForm((prev) => ({
      ...prev,
      sources: prev.sources.filter((_, i) => i !== idx),
    }));
  };

  /* ──────────────────────────────────────────────────────────
     LIST VIEW
  ────────────────────────────────────────────────────────── */
  if (view === "list") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <Dialog />

        {/* Header & Quick Stats */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div>
            <h2
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: "#F8FAFC",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <BookOpen size={24} style={{ color: "#38BDF8" }} />
              Perspectives Editorial Blog
            </h2>
            <p style={{ fontSize: 13, color: "#8B93A7", marginTop: 4 }}>
              Daily editorial publishing system for technical commentary, global affairs, and industry insights.
            </p>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <a
              href="/blog"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-sm"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#CBD5E1",
              }}
            >
              <Globe size={14} /> View Live /blog
            </a>
            <button
              onClick={handleNewArticle}
              className="btn btn-primary btn-sm"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "#38BDF8",
                color: "#05070A",
                fontWeight: 600,
                padding: "8px 16px",
                borderRadius: 8,
              }}
            >
              <Plus size={16} /> New Perspective
            </button>
          </div>
        </div>

        {/* Filter Tabs & Search */}
        <Card style={{ padding: 16 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            {/* Status Pills */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {[
                { id: "all", label: `All (${counts.all})` },
                { id: "published", label: `Published (${counts.published})` },
                { id: "draft", label: `Drafts (${counts.draft})` },
                { id: "archived", label: `Archived (${counts.archived})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterStatus(tab.id)}
                  style={{
                    background:
                      filterStatus === tab.id
                        ? "rgba(56, 189, 248, 0.15)"
                        : "rgba(255, 255, 255, 0.04)",
                    border: `1px solid ${
                      filterStatus === tab.id
                        ? "rgba(56, 189, 248, 0.4)"
                        : "rgba(255, 255, 255, 0.08)"
                    }`,
                    color: filterStatus === tab.id ? "#38BDF8" : "#94A3B8",
                    padding: "6px 14px",
                    borderRadius: 9999,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Box */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: 8,
                padding: "6px 12px",
                width: 240,
              }}
            >
              <Search size={14} style={{ color: "#64748B" }} />
              <input
                type="text"
                placeholder="Search perspectives..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "#F8FAFC",
                  fontSize: 13,
                  width: "100%",
                }}
              />
            </div>
          </div>
        </Card>

        {/* Articles Table */}
        <Card style={{ padding: 0, overflow: "hidden" }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: "center", color: "#8B93A7" }}>
              Loading perspectives...
            </div>
          ) : articles.length === 0 ? (
            <div style={{ padding: 48, textAlign: "center" }}>
              <FileText size={36} style={{ color: "#475569", margin: "0 auto 12px" }} />
              <p style={{ fontSize: 15, color: "#E2E8F0", fontWeight: 600 }}>
                No articles found in this category
              </p>
              <p style={{ fontSize: 13, color: "#8B93A7", marginTop: 4 }}>
                Ready to publish your daily perspective? Click &quot;New Perspective&quot; above.
              </p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr
                    style={{
                      borderBottom: "1px solid rgba(255,255,255,0.08)",
                      background: "rgba(255,255,255,0.02)",
                      fontSize: 11,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      color: "#64748B",
                    }}
                  >
                    <th style={{ padding: "14px 20px" }}>Title & Dek</th>
                    <th style={{ padding: "14px 16px" }}>Category</th>
                    <th style={{ padding: "14px 16px" }}>Status</th>
                    <th style={{ padding: "14px 16px" }}>Reading Time</th>
                    <th style={{ padding: "14px 16px" }}>Last Modified</th>
                    <th style={{ padding: "14px 20px", textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {articles.map((art) => (
                    <tr
                      key={art.id}
                      style={{
                        borderBottom: "1px solid rgba(255,255,255,0.05)",
                        transition: "background 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "rgba(255,255,255,0.02)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      <td style={{ padding: "16px 20px", maxWidth: 360 }}>
                        <div style={{ fontWeight: 600, color: "#F8FAFC", fontSize: 14 }}>
                          {art.title}
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            color: "#8B93A7",
                            marginTop: 3,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {art.dek}
                        </div>
                        {art.featured && (
                          <span
                            style={{
                              display: "inline-block",
                              marginTop: 4,
                              fontSize: 10,
                              fontWeight: 700,
                              textTransform: "uppercase",
                              color: "#FBBF24",
                              background: "rgba(251, 191, 36, 0.12)",
                              padding: "2px 6px",
                              borderRadius: 4,
                            }}
                          >
                            Featured Story
                          </span>
                        )}
                      </td>

                      <td style={{ padding: "16px 16px", whiteSpace: "nowrap" }}>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            padding: "3px 8px",
                            borderRadius: 6,
                            background: "rgba(56, 189, 248, 0.1)",
                            color: "#38BDF8",
                          }}
                        >
                          {art.category}
                        </span>
                      </td>

                      <td style={{ padding: "16px 16px", whiteSpace: "nowrap" }}>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            padding: "3px 8px",
                            borderRadius: 6,
                            textTransform: "uppercase",
                            letterSpacing: "0.04em",
                            background:
                              art.status === "published"
                                ? "rgba(52, 211, 153, 0.12)"
                                : art.status === "draft"
                                ? "rgba(251, 191, 36, 0.12)"
                                : "rgba(239, 68, 68, 0.12)",
                            color:
                              art.status === "published"
                                ? "#34D399"
                                : art.status === "draft"
                                ? "#FBBF24"
                                : "#F87171",
                          }}
                        >
                          {art.status}
                        </span>
                      </td>

                      <td style={{ padding: "16px 16px", fontSize: 12, color: "#8B93A7" }}>
                        {art.readingTime}
                      </td>

                      <td style={{ padding: "16px 16px", fontSize: 12, color: "#8B93A7" }}>
                        {formatDate(art.updatedAt || art.createdAt, { month: "short" })}
                      </td>

                      <td style={{ padding: "16px 20px", textAlign: "right", whiteSpace: "nowrap" }}>
                        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                          <button
                            onClick={() => handleEditArticle(art.id)}
                            className="btn btn-secondary btn-sm"
                            style={{
                              padding: "5px 10px",
                              fontSize: 12,
                              borderRadius: 6,
                              background: "rgba(255,255,255,0.06)",
                              border: "1px solid rgba(255,255,255,0.1)",
                              color: "#F8FAFC",
                            }}
                          >
                            Edit
                          </button>

                          {art.status === "published" ? (
                            <a
                              href={`/blog/${art.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-secondary btn-sm"
                              style={{
                                padding: "5px 10px",
                                fontSize: 12,
                                borderRadius: 6,
                                background: "rgba(56, 189, 248, 0.08)",
                                border: "1px solid rgba(56, 189, 248, 0.2)",
                                color: "#38BDF8",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4,
                              }}
                            >
                              <ExternalLink size={12} /> Live
                            </a>
                          ) : (
                            <a
                              href={`/blog/preview/${art.id}${art.previewToken ? `?token=${art.previewToken}` : ""}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-secondary btn-sm"
                              style={{
                                padding: "5px 10px",
                                fontSize: 12,
                                borderRadius: 6,
                                background: "rgba(251, 191, 36, 0.08)",
                                border: "1px solid rgba(251, 191, 36, 0.2)",
                                color: "#FBBF24",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4,
                              }}
                            >
                              <Eye size={12} /> Preview
                            </a>
                          )}

                          <DelBtn
                            onClick={() => handleDelete(art.id, art.title)}
                            title="Archive Article"
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    );
  }

  /* ──────────────────────────────────────────────────────────
     EDITOR VIEW
  ────────────────────────────────────────────────────────── */
  const estReading = estimateReadingTime(form.content);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 1100 }}>
      <Dialog />

      {/* Editor Top Navigation Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          paddingBottom: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={() => setView("list")}
            className="btn btn-secondary btn-sm"
            style={{
              padding: "7px 12px",
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#CBD5E1",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <ArrowLeft size={16} /> All Perspectives
          </button>
          <div>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: form.status === "published" ? "#34D399" : "#FBBF24",
              }}
            >
              {form.id ? `Editing Article (${form.status})` : "New Draft"}
            </span>
            <div style={{ fontSize: 13, color: "#8B93A7" }}>
              Estimated Reading Time: <strong>{estReading}</strong>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: 10 }}>
          {form.id && (
            <a
              href={form.status === "published" ? `/blog/${form.slug}` : `/blog/preview/${form.id}${form.previewToken ? `?token=${form.previewToken}` : ""}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-sm"
              style={{
                padding: "8px 14px",
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#CBD5E1",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Eye size={14} /> Preview
            </a>
          )}

          <button
            type="button"
            disabled={saving}
            onClick={() => handleSave("draft")}
            className="btn btn-secondary btn-sm"
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: "1px solid rgba(251, 191, 36, 0.3)",
              color: "#FBBF24",
              background: "rgba(251, 191, 36, 0.08)",
              fontWeight: 600,
            }}
          >
            Save Draft
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={() => handleSave("published")}
            className="btn btn-primary btn-sm"
            style={{
              padding: "8px 20px",
              borderRadius: 8,
              background: "#38BDF8",
              color: "#05070A",
              fontWeight: 700,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Save size={16} /> {form.status === "published" ? "Update Published" : "Publish Now"}
          </button>
        </div>
      </div>

      {/* Main Form Fields */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24 }}>
        {/* Left Column: Core Editorial Content */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Title & Dek */}
          <Card>
            <FL htmlFor="art-title">
              Article Title <CharCount val={form.title} max={300} />
            </FL>
            <input
              id="art-title"
              type="text"
              placeholder="e.g. Infosys, TCS and Wipro: What the US PERM Suspension Means for Indian IT Workers"
              value={form.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              maxLength={300}
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8,
                padding: "10px 14px",
                color: "#F8FAFC",
                fontSize: 16,
                fontWeight: 600,
                outline: "none",
                marginBottom: 16,
              }}
            />

            <FL htmlFor="art-slug">URL Slug (/blog/[slug])</FL>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 8,
                padding: "8px 12px",
                marginBottom: 16,
              }}
            >
              <span style={{ color: "#64748B", fontSize: 13, fontFamily: "var(--font-mono)" }}>
                /blog/
              </span>
              <input
                id="art-slug"
                type="text"
                value={form.slug}
                onChange={(e) => {
                  setSlugManuallyEdited(true);
                  setForm((prev) => ({ ...prev, slug: slugify(e.target.value) }));
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "#38BDF8",
                  fontSize: 13,
                  fontFamily: "var(--font-mono)",
                  width: "100%",
                }}
              />
            </div>

            <FL htmlFor="art-dek">
              Editorial Dek / Summary (Sub-headline) <CharCount val={form.dek} max={600} />
            </FL>
            <textarea
              id="art-dek"
              rows={3}
              placeholder="A concise, high-signal summary of the story and key takeaways..."
              value={form.dek}
              onChange={(e) => setForm((prev) => ({ ...prev, dek: e.target.value }))}
              maxLength={600}
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8,
                padding: "10px 14px",
                color: "#F8FAFC",
                fontSize: 14,
                lineHeight: 1.5,
                outline: "none",
                resize: "vertical",
              }}
            />
          </Card>

          {/* Article Body Editor with Live Markdown Preview */}
          <Card>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <FL htmlFor="art-content">Article Body (Semantic Markdown)</FL>
              <div style={{ display: "flex", gap: 4 }}>
                <button
                  type="button"
                  onClick={() => setEditorTab("write")}
                  style={{
                    padding: "4px 12px",
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    background: editorTab === "write" ? "#38BDF8" : "rgba(255,255,255,0.05)",
                    color: editorTab === "write" ? "#05070A" : "#8B93A7",
                    border: "none",
                  }}
                >
                  Write Markdown
                </button>
                <button
                  type="button"
                  onClick={() => setEditorTab("preview")}
                  style={{
                    padding: "4px 12px",
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    background: editorTab === "preview" ? "#38BDF8" : "rgba(255,255,255,0.05)",
                    color: editorTab === "preview" ? "#05070A" : "#8B93A7",
                    border: "none",
                  }}
                >
                  Live Render Preview
                </button>
              </div>
            </div>

            {editorTab === "write" ? (
              <textarea
                id="art-content"
                rows={22}
                placeholder="Write your article in Markdown. Supports ## Headings, lists, tables, blockquotes, code, and links..."
                value={form.content}
                onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
                style={{
                  width: "100%",
                  background: "#080B10",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 8,
                  padding: "16px",
                  color: "#E2E8F0",
                  fontFamily: "var(--font-mono, monospace)",
                  fontSize: 13,
                  lineHeight: 1.6,
                  outline: "none",
                  resize: "vertical",
                }}
              />
            ) : (
              <div
                style={{
                  background: "#FFFFFF",
                  color: "#191919",
                  padding: 24,
                  borderRadius: 8,
                  minHeight: 400,
                  maxHeight: 600,
                  overflowY: "auto",
                  border: "1px solid #E7E4DE",
                  fontSize: 15,
                  lineHeight: 1.7,
                }}
                dangerouslySetInnerHTML={{ __html: parseMarkdownToHtml(form.content) }}
              />
            )}
          </Card>

          {/* Sources and Fact-checking Manager */}
          <Card>
            <h3
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "#F8FAFC",
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 12,
              }}
            >
              <LinkIcon size={18} style={{ color: "#38BDF8" }} />
              Sources & Further Reading ({form.sources.length})
            </h3>
            <p style={{ fontSize: 13, color: "#8B93A7", marginBottom: 16 }}>
              Evidence-based journalism requirement: link all official announcements, government gazettes, and reputable reporting.
            </p>

            {/* Existing Sources List */}
            {form.sources.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                {form.sources.map((s, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      borderRadius: 8,
                      padding: "10px 14px",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: "#F8FAFC", fontSize: 13 }}>
                        {s.title}
                      </div>
                      <div style={{ fontSize: 11, color: "#8B93A7", marginTop: 2 }}>
                        {s.organization} · {s.url}
                      </div>
                    </div>
                    <DelBtn onClick={() => handleRemoveSource(idx)} title="Remove Source" />
                  </div>
                ))}
              </div>
            )}

            {/* Add Source Input Row */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
                background: "rgba(255,255,255,0.02)",
                padding: 14,
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div>
                <FL>Source Title</FL>
                <input
                  type="text"
                  placeholder="e.g. US DOL Permanent Labor Certification"
                  value={newSource.title}
                  onChange={(e) => setNewSource((prev) => ({ ...prev, title: e.target.value }))}
                  style={{
                    width: "100%",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 6,
                    padding: "6px 10px",
                    color: "#F8FAFC",
                    fontSize: 13,
                  }}
                />
              </div>

              <div>
                <FL>Organization / Publisher</FL>
                <input
                  type="text"
                  placeholder="e.g. US Department of Labor / Reuters"
                  value={newSource.organization}
                  onChange={(e) =>
                    setNewSource((prev) => ({ ...prev, organization: e.target.value }))
                  }
                  style={{
                    width: "100%",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 6,
                    padding: "6px 10px",
                    color: "#F8FAFC",
                    fontSize: 13,
                  }}
                />
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <FL>Source URL</FL>
                <input
                  type="url"
                  placeholder="https://flag.dol.gov/index.php/programs/perm"
                  value={newSource.url}
                  onChange={(e) => setNewSource((prev) => ({ ...prev, url: e.target.value }))}
                  style={{
                    width: "100%",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 6,
                    padding: "6px 10px",
                    color: "#F8FAFC",
                    fontSize: 13,
                  }}
                />
              </div>

              <div style={{ gridColumn: "1 / -1", textAlign: "right" }}>
                <button
                  type="button"
                  onClick={handleAddSource}
                  className="btn btn-primary btn-sm"
                  style={{
                    padding: "6px 14px",
                    borderRadius: 6,
                    background: "rgba(56, 189, 248, 0.15)",
                    color: "#38BDF8",
                    border: "1px solid rgba(56, 189, 248, 0.3)",
                    fontWeight: 600,
                  }}
                >
                  <Plus size={14} /> Add Source Citation
                </button>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Taxonomy, Metadata & Publishing Controls */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Publishing Metadata Card */}
          <Card>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#F8FAFC", marginBottom: 14 }}>
              Editorial Taxonomy
            </h3>

            {/* Category */}
            <div style={{ marginBottom: 14 }}>
              <FL htmlFor="art-cat">Category</FL>
              <select
                id="art-cat"
                value={form.category}
                onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                style={{
                  width: "100%",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 6,
                  padding: "8px 10px",
                  color: "#F8FAFC",
                  fontSize: 13,
                  outline: "none",
                }}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} style={{ background: "#0B0F17" }}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Analysis vs Opinion */}
            <div style={{ marginBottom: 14 }}>
              <FL htmlFor="art-type">Editorial Label</FL>
              <select
                id="art-type"
                value={form.isAnalysisOrOpinion}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, isAnalysisOrOpinion: e.target.value }))
                }
                style={{
                  width: "100%",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 6,
                  padding: "8px 10px",
                  color: "#F8FAFC",
                  fontSize: 13,
                  outline: "none",
                }}
              >
                {ANALYSIS_TYPES.map((t) => (
                  <option key={t} value={t} style={{ background: "#0B0F17" }}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Featured Story */}
            <div style={{ marginBottom: 14 }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  cursor: "pointer",
                  fontSize: 13,
                  color: "#E2E8F0",
                }}
              >
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => setForm((prev) => ({ ...prev, featured: e.target.checked }))}
                />
                Promote as Featured Lead Story
              </label>
            </div>

            {/* Tags */}
            <div>
              <FL htmlFor="art-tags">Tags (Comma-separated)</FL>
              <input
                id="art-tags"
                type="text"
                placeholder="PERM, H-1B, US Immigration, Indian IT"
                value={form.tags}
                onChange={(e) => setForm((prev) => ({ ...prev, tags: e.target.value }))}
                style={{
                  width: "100%",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 6,
                  padding: "8px 10px",
                  color: "#F8FAFC",
                  fontSize: 13,
                }}
              />
            </div>
          </Card>

          {/* Cover Image Settings */}
          <Card>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#F8FAFC", marginBottom: 14 }}>
              Cover Image
            </h3>

            <div style={{ marginBottom: 12 }}>
              <FL htmlFor="art-img-url">Image URL</FL>
              <input
                id="art-img-url"
                type="text"
                placeholder="/images/blog/perm-suspension-editorial.webp"
                value={form.coverImage.url}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    coverImage: { ...prev.coverImage, url: e.target.value },
                  }))
                }
                style={{
                  width: "100%",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 6,
                  padding: "6px 10px",
                  color: "#F8FAFC",
                  fontSize: 13,
                }}
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <FL htmlFor="art-img-alt">Alt Text (Accessibility & SEO)</FL>
              <input
                id="art-img-alt"
                type="text"
                placeholder="Descriptive explanation of the visual asset"
                value={form.coverImage.alt}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    coverImage: { ...prev.coverImage, alt: e.target.value },
                  }))
                }
                style={{
                  width: "100%",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 6,
                  padding: "6px 10px",
                  color: "#F8FAFC",
                  fontSize: 13,
                }}
              />
            </div>

            <div>
              <FL htmlFor="art-img-credit">Photo Credit / Attribution</FL>
              <input
                id="art-img-credit"
                type="text"
                placeholder="e.g. Perspectives Editorial / Reuters"
                value={form.coverImage.credit}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    coverImage: { ...prev.coverImage, credit: e.target.value },
                  }))
                }
                style={{
                  width: "100%",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 6,
                  padding: "6px 10px",
                  color: "#F8FAFC",
                  fontSize: 13,
                }}
              />
            </div>
          </Card>

          {/* Technical SEO & Social Preview Card */}
          <Card>
            <h3
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "#F8FAFC",
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 14,
              }}
            >
              <Share2 size={16} style={{ color: "#38BDF8" }} />
              SEO & Social Sharing Preview
            </h3>

            <div style={{ marginBottom: 12 }}>
              <FL htmlFor="art-seotitle">
                SEO Title Override <CharCount val={form.seoTitle || form.title} max={70} />
              </FL>
              <input
                id="art-seotitle"
                type="text"
                placeholder="Optional override for <title> tag"
                value={form.seoTitle}
                onChange={(e) => setForm((prev) => ({ ...prev, seoTitle: e.target.value }))}
                style={{
                  width: "100%",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 6,
                  padding: "6px 10px",
                  color: "#F8FAFC",
                  fontSize: 13,
                }}
              />
            </div>

            <div style={{ marginBottom: 14 }}>
              <FL htmlFor="art-seodesc">
                SEO Meta Description <CharCount val={form.seoDescription || form.dek} max={160} />
              </FL>
              <textarea
                id="art-seodesc"
                rows={3}
                placeholder="Optimal: 120-160 characters describing the core value proposition"
                value={form.seoDescription}
                onChange={(e) => setForm((prev) => ({ ...prev, seoDescription: e.target.value }))}
                style={{
                  width: "100%",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 6,
                  padding: "6px 10px",
                  color: "#F8FAFC",
                  fontSize: 13,
                  outline: "none",
                }}
              />
            </div>

            {/* Live Search Result Snippet Simulation */}
            <div
              style={{
                background: "#080B10",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 8,
                padding: 12,
              }}
            >
              <div style={{ fontSize: 11, color: "#94A3B8" }}>
                https://lokeshsain.vercel.app &rsaquo; blog &rsaquo; {form.slug || "slug"}
              </div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#60A5FA",
                  marginTop: 2,
                  lineHeight: 1.3,
                }}
              >
                {form.seoTitle || form.title || "Article Headline — Lokesh Sain Perspectives"}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "#CBD5E1",
                  marginTop: 4,
                  lineHeight: 1.4,
                  maxHeight: 48,
                  overflow: "hidden",
                }}
              >
                {form.seoDescription || form.dek || "Article editorial description snippet..."}
              </div>
            </div>
          </Card>

          {/* Editorial Quality Checklist */}
          <Card>
            <h3
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "#F8FAFC",
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 12,
              }}
            >
              <CheckCircle2 size={16} style={{ color: "#34D399" }} />
              Editorial Pre-Flight Checklist
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {form.title.length > 20 ? (
                  <CheckCircle2 size={14} style={{ color: "#34D399" }} />
                ) : (
                  <AlertCircle size={14} style={{ color: "#FBBF24" }} />
                )}
                <span style={{ color: form.title.length > 20 ? "#E2E8F0" : "#8B93A7" }}>
                  Clear, informative headline
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {form.dek.length > 40 ? (
                  <CheckCircle2 size={14} style={{ color: "#34D399" }} />
                ) : (
                  <AlertCircle size={14} style={{ color: "#FBBF24" }} />
                )}
                <span style={{ color: form.dek.length > 40 ? "#E2E8F0" : "#8B93A7" }}>
                  High-signal editorial dek / summary
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {form.sources.length >= 2 ? (
                  <CheckCircle2 size={14} style={{ color: "#34D399" }} />
                ) : (
                  <AlertCircle size={14} style={{ color: "#FBBF24" }} />
                )}
                <span style={{ color: form.sources.length >= 2 ? "#E2E8F0" : "#8B93A7" }}>
                  Verifiable sources & citations attached ({form.sources.length}/2)
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {form.coverImage.alt ? (
                  <CheckCircle2 size={14} style={{ color: "#34D399" }} />
                ) : (
                  <AlertCircle size={14} style={{ color: "#FBBF24" }} />
                )}
                <span style={{ color: form.coverImage.alt ? "#E2E8F0" : "#8B93A7" }}>
                  Cover image alt text specified
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {form.isAnalysisOrOpinion !== "None" ? (
                  <CheckCircle2 size={14} style={{ color: "#34D399" }} />
                ) : (
                  <AlertCircle size={14} style={{ color: "#FBBF24" }} />
                )}
                <span style={{ color: "#E2E8F0" }}>
                  Editorial label set ({form.isAnalysisOrOpinion})
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
