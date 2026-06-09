import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { Save, Plus, ChevronUp, ChevronDown } from 'lucide-react'
import { useConfirm } from '../ui/ConfirmDialog'
import { Card, FL, DelBtn, CharCount } from './AdminHelpers'

const BLANK_PROJECT = {
  id: Date.now(),
  title: "",
  file: "",
  category: "Web App",
  accentBg: "var(--yellow)",
  accentColor: "#000",
  tagClass: "tag-y",
  period: "",
  desc: "",
  tags: [],
  link: "",
  github: "",
  visible: true,
  image: null,
}

export default function ProjectsEditor({ data, onSave }) {
  const { confirm, Dialog } = useConfirm()
  const [projects, setProjects] = useState(
    data.projects.map((p) => ({
      ...p,
      tags: Array.isArray(p.tags)
        ? p.tags
            .map((t) => (typeof t === "string" ? t : t?.label || ""))
            .join(", ")
        : typeof p.tags === "string"
          ? p.tags
          : "",
    })),
  )
  const [saving, setSaving] = useState(false)

  const upd = (id, field, val) =>
    setProjects((p) =>
      p.map((x) => (x.id === id ? { ...x, [field]: val } : x)),
    )
  const toggle = (id) =>
    upd(id, "visible", !projects.find((p) => p.id === id)?.visible)
  const add = () =>
    setProjects((p) => [...p, { ...BLANK_PROJECT, id: Date.now() }])
  const moveUp = (i) => {
    if (i === 0) return
    const a = [...projects];
    [a[i - 1], a[i]] = [a[i], a[i - 1]]
    setProjects(a)
  }
  const moveDown = (i) => {
    if (i === projects.length - 1) return
    const a = [...projects];
    [a[i], a[i + 1]] = [a[i + 1], a[i]]
    setProjects(a)
  }

  const del = async (id) => {
    const ok = await confirm("Delete this project? This cannot be undone.")
    if (!ok) return
    setProjects((p) => p.filter((x) => x.id !== id))
  }

  const handleProjectImage = (id, e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.match(/^image\/(jpeg|png|webp|gif)$/)) {
      toast.error("Please select a JPEG, PNG, WebP, or GIF image (not SVG)")
      return
    }
    if (file.size > 1 * 1024 * 1024) {
      toast.error("Project image must be under 1MB")
      return
    }
    const reader = new FileReader()
    reader.onload = (ev) => upd(id, "image", ev.target.result)
    reader.readAsDataURL(file)
  }

  const removeProjectImage = (id) => upd(id, "image", null)

  const save = async () => {
    setSaving(true)
    const normalized = projects.map((p) => ({
      ...p,
      tags:
        typeof p.tags === "string"
          ? p.tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : Array.isArray(p.tags)
            ? p.tags
            : [],
    }))
    try {
      await onSave("projects", normalized)
      toast.success("Projects saved!")
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed")
    } finally {
      setSaving(false)
    }
  }

  const CATS = [
    { val: "Web App", cls: "tag-y", bg: "var(--yellow)", color: "#000" },
    { val: "Android", cls: "tag-g", bg: "var(--green)", color: "#000" },
    { val: "Full Stack", cls: "tag-pk", bg: "var(--pink)", color: "#000" },
    { val: "Mobile", cls: "tag-bl", bg: "var(--blue)", color: "#fff" },
    { val: "Other", cls: "tag-pu", bg: "var(--purple)", color: "#fff" },
  ]

  return (
    <div>
      {Dialog}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 28,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <h2
          style={{
            fontWeight: 900,
            fontSize: "clamp(20px,3vw,26px)",
            letterSpacing: "-0.03em",
          }}
        >
          Projects
        </h2>
        <button onClick={add} className="btn btn-yellow btn-sm">
          <Plus size={14} /> Add Project
        </button>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 18,
          marginBottom: 22,
        }}
      >
        {projects.map((p, i) => (
          <Card key={p.id}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
                flexWrap: "wrap",
                gap: 10,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontWeight: 800, fontSize: 15 }}>
                  {p.title || "New Project"}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    padding: "2px 9px",
                    borderRadius: 99,
                    fontFamily: "var(--mono)",
                    fontWeight: 700,
                    background:
                      p.visible !== false ? "var(--green)" : "var(--pink)",
                    color: "#000",
                    border: "2px solid var(--ink)",
                  }}
                >
                  {p.visible !== false ? "Visible" : "Hidden"}
                </span>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  onClick={() => moveUp(i)}
                  className="icon-btn"
                  style={{ width: 32, height: 32 }}
                >
                  <ChevronUp size={14} />
                </button>
                <button
                  onClick={() => moveDown(i)}
                  className="icon-btn"
                  style={{ width: 32, height: 32 }}
                >
                  <ChevronDown size={14} />
                </button>
                <button
                  onClick={() => toggle(p.id)}
                  className="btn btn-outline btn-sm"
                >
                  {p.visible !== false ? "Hide" : "Show"}
                </button>
                <DelBtn onClick={() => del(p.id)} />
              </div>
            </div>
            {/* Project Image */}
            <div style={{ marginBottom: 18 }}>
              <FL>
                Project Logo / Image{" "}
                <span
                  style={{
                    fontWeight: 400,
                    textTransform: "none",
                    letterSpacing: 0,
                  }}
                >
                  — JPEG/PNG/WebP/GIF/SVG · max 1MB
                </span>
              </FL>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 12,
                    border: "2px solid var(--ink)",
                    background: p.accentBg || "var(--yellow)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 900,
                    fontSize: 22,
                    color: "#000",
                    overflow: "hidden",
                    flexShrink: 0,
                    boxShadow: "var(--sh)",
                  }}
                >
                  {p.image ? (
                    <img
                      src={p.image}
                      alt={`${p.title} logo`}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        padding: 6,
                      }}
                      onError={() => upd(p.id, "image", null)}
                    />
                  ) : p.title ? (
                    p.title.charAt(0).toUpperCase()
                  ) : (
                    "📁"
                  )}
                </div>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  <label
                    className="btn btn-yellow btn-sm"
                    style={{ cursor: "pointer" }}
                  >
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                      <polyline points="17,8 12,3 7,8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    Upload Image
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={(e) => handleProjectImage(p.id, e)}
                      style={{ display: "none" }}
                    />
                  </label>
                  {p.image && (
                    <button
                      onClick={() => removeProjectImage(p.id)}
                      className="btn btn-outline btn-sm"
                      style={{ color: "#cc0000", borderColor: "#cc0000" }}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
                gap: 14,
                marginBottom: 14,
              }}
            >
              <div>
                <FL>
                  Title <CharCount val={(p.title || "").length} max={100} />
                </FL>
                <input
                  value={p.title}
                  onChange={(e) => upd(p.id, "title", e.target.value)}
                  className="field"
                  placeholder="Project Name"
                  maxLength={100}
                />
              </div>
              <div>
                <FL>
                  File / Path{" "}
                  <CharCount val={(p.file || "").length} max={200} />
                </FL>
                <input
                  value={p.file || ""}
                  onChange={(e) => upd(p.id, "file", e.target.value)}
                  className="field"
                  placeholder="src/App.jsx"
                  maxLength={200}
                />
              </div>
              <div>
                <FL>
                  Period <CharCount val={(p.period || "").length} max={50} />
                </FL>
                <input
                  value={p.period || ""}
                  onChange={(e) => upd(p.id, "period", e.target.value)}
                  className="field"
                  placeholder="Jan 2025–Now"
                  maxLength={50}
                />
              </div>
              <div>
                <FL>Category</FL>
                <select
                  value={p.category}
                  onChange={(e) => {
                    const cat =
                      CATS.find((c) => c.val === e.target.value) || CATS[0]
                    setProjects((prev) =>
                      prev.map((x) =>
                        x.id === p.id
                          ? {
                              ...x,
                              category: cat.val,
                              tagClass: cat.cls,
                              accentBg: cat.bg,
                              accentColor: cat.color,
                            }
                          : x,
                      ),
                    )
                  }}
                  className="field"
                >
                  {CATS.map((c) => (
                    <option key={c.val} value={c.val}>
                      {c.val}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <FL>
                Description{" "}
                <CharCount
                  val={(p.desc || p.description || "").length}
                  max={1000}
                />
              </FL>
              <textarea
                rows={3}
                value={p.desc || p.description || ""}
                onChange={(e) => upd(p.id, "desc", e.target.value)}
                className="field"
                style={{ resize: "vertical" }}
                placeholder="Short project description..."
                maxLength={1000}
              />
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
                gap: 14,
                marginBottom: 14,
              }}
            >
              <div>
                <FL>
                  Live URL <CharCount val={(p.link || "").length} max={300} />
                </FL>
                <input
                  value={p.link || ""}
                  onChange={(e) => upd(p.id, "link", e.target.value)}
                  className="field"
                  placeholder="https://..."
                  maxLength={300}
                />
              </div>
              <div>
                <FL>
                  GitHub URL{" "}
                  <CharCount val={(p.github || "").length} max={300} />
                </FL>
                <input
                  value={p.github || ""}
                  onChange={(e) => upd(p.id, "github", e.target.value)}
                  className="field"
                  placeholder="https://github.com/..."
                  maxLength={300}
                />
              </div>
            </div>
            <div>
              <FL>
                Tags (comma-separated){" "}
                <CharCount
                  val={
                    (typeof p.tags === "string"
                      ? p.tags
                      : Array.isArray(p.tags)
                        ? p.tags.join(", ")
                        : ""
                    ).length
                  }
                  max={300}
                />
              </FL>
              <input
                value={
                  typeof p.tags === "string"
                    ? p.tags
                    : Array.isArray(p.tags)
                      ? p.tags.join(", ")
                      : ""
                }
                onChange={(e) => upd(p.id, "tags", e.target.value)}
                className="field"
                placeholder="React.js, REST APIs, Responsive"
                maxLength={300}
              />
            </div>
          </Card>
        ))}
      </div>
      <button
        onClick={save}
        disabled={saving}
        className="btn btn-yellow"
        style={{ opacity: saving ? 0.7 : 1 }}
      >
        <Save size={14} />
        {saving ? "Saving…" : "Save All Projects"}
      </button>
    </div>
  )
}
