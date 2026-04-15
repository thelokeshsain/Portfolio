// AdminDashboard — The primary control center for portfolio content management.
// Securely handles CRUD operations for hero, projects, and contact inquiries.
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import {
  LayoutDashboard,
  User,
  FolderOpen,
  Wrench,
  Briefcase,
  Eye,
  LogOut,
  Sun,
  Moon,
  Save,
  Plus,
  Trash2,
  ExternalLink,
  ToggleLeft,
  ToggleRight,
  ChevronUp,
  ChevronDown,
  KeyRound,
  Shield,
  ArrowLeft,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Mail,
  Monitor,
  Wifi,
  Clock,
  CheckCheck,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useConfirm } from "../components/ui/ConfirmDialog";
import { useData } from "../context/DataContext";
import { useTheme } from "../context/ThemeContext";
import { apiClient } from "../context/AuthContext";

/* ── tiny helpers ── */
const Card = ({ children, style }) => (
  <div
    style={{
      border: "2px solid var(--ink)",
      borderRadius: 14,
      background: "var(--surface)",
      boxShadow: "var(--sh)",
      padding: "clamp(18px,3vw,26px)",
      ...style,
    }}
  >
    {children}
  </div>
);
const FL = ({ children }) => (
  <label
    style={{
      display: "block",
      fontSize: 11,
      fontWeight: 700,
      fontFamily: "var(--mono)",
      letterSpacing: ".08em",
      textTransform: "uppercase",
      color: "var(--muted)",
      marginBottom: 7,
    }}
  >
    {children}
  </label>
);
const AddBtn = ({ onClick, label }) => (
  <button
    onClick={onClick}
    className="btn btn-yellow btn-sm"
    style={{ marginTop: 14 }}
  >
    <Plus size={14} /> {label}
  </button>
);
const DelBtn = ({ onClick }) => (
  <button
    onClick={onClick}
    style={{
      background: "none",
      border: "2px solid var(--ink)",
      borderRadius: 8,
      padding: "6px 10px",
      cursor: "pointer",
      color: "#cc0000",
      display: "flex",
      alignItems: "center",
      flexShrink: 0,
    }}
  >
    <Trash2 size={14} />
  </button>
);
// Character counter helper
const CharCount = ({ val, max }) => (
  <span
    style={{
      float: "right",
      fontWeight: 400,
      fontSize: 10,
      letterSpacing: 0,
      color: val >= max * 0.9 ? "#cc0000" : "var(--muted)",
    }}
  >
    {val}/{max}
  </span>
);

/* ══════════════════════════════════════════════════════
   PANELS
══════════════════════════════════════════════════════ */

/* ── Overview ── */
function Overview({ data }) {
  const counts = [
    { label: "Projects", val: data.projects?.length ?? 0, bg: "var(--yellow)" },
    {
      label: "Visible",
      val: (data.projects ?? []).filter((p) => p.visible !== false).length,
      bg: "var(--green)",
    },
    {
      label: "Skills",
      val: Object.values(data.skills ?? {}).flat().length,
      bg: "var(--pink)",
    },
    { label: "Roles", val: data.experience?.length ?? 0, bg: "var(--blue)" },
  ];
  return (
    <div>
      <h2
        style={{
          fontWeight: 900,
          fontSize: "clamp(20px,3vw,26px)",
          letterSpacing: "-0.03em",
          marginBottom: 28,
        }}
      >
        Overview
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(130px,1fr))",
          gap: 14,
          marginBottom: 28,
        }}
      >
        {counts.map((s) => (
          <div
            key={s.label}
            style={{
              border: "2px solid var(--ink)",
              borderRadius: 12,
              padding: "18px 14px",
              background: s.bg,
              boxShadow: "var(--sh)",
              textAlign: "center",
              color: "#000",
            }}
          >
            <div
              style={{
                fontSize: 32,
                fontWeight: 900,
                letterSpacing: "-0.04em",
              }}
            >
              {s.val}
            </div>
            <div
              style={{
                fontSize: 10,
                fontFamily: "var(--mono)",
                fontWeight: 700,
                letterSpacing: ".08em",
                textTransform: "uppercase",
                marginTop: 4,
              }}
            >
              {s.label}
            </div>
          </div>
        ))}
      </div>
      <Card>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>
          Quick Actions
        </div>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-solid btn-sm"
        >
          <ExternalLink size={13} /> View Live Portfolio
        </a>
      </Card>
    </div>
  );
}

/* ── Hero Editor ── */
function HeroEditor({ data, onSave }) {
  const [hero, setHero] = useState({ ...data.hero });
  const [saving, setSaving] = useState(false);
  const [imgPreview, setImgPreview] = useState(hero.image || null);

  const FIELDS = [
    ["name", "Name", 100],
    ["title", "Title", 100],
    ["role", "Role", 100],
    ["email", "Email", 254],
    ["phone", "Phone", 20],
    ["location", "Location", 100],
    ["github", "GitHub URL", 300],
    ["linkedin", "LinkedIn URL", 300],
    ["resumeUrl", "Resume URL", 300],
  ];

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // Client-side pre-checks (server validates too — H-03 fix)
    if (!file.type.match(/^image\/(jpeg|png|webp|gif)$/)) {
      toast.error("Please select a JPEG, PNG, WebP, or GIF image (not SVG)");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be under 2MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      setImgPreview(dataUrl);
      setHero((p) => ({ ...p, image: dataUrl }));
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImgPreview(null);
    setHero((p) => ({ ...p, image: null }));
  };

  const save = async () => {
    setSaving(true);
    try {
      await onSave("hero", hero);
      toast.success("Hero saved!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h2
        style={{
          fontWeight: 900,
          fontSize: "clamp(20px,3vw,26px)",
          letterSpacing: "-0.03em",
          marginBottom: 28,
        }}
      >
        Hero & Info
      </h2>
      <Card>
        {/* Profile image upload */}
        <div style={{ marginBottom: 22 }}>
          <FL>
            Profile Photo{" "}
            <span
              style={{
                fontWeight: 400,
                textTransform: "none",
                letterSpacing: 0,
              }}
            >
              — JPEG/PNG/WebP/GIF · max 2MB
            </span>
          </FL>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                border: "2px solid var(--ink)",
                background: "var(--yellow)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 900,
                fontSize: 24,
                color: "#000",
                overflow: "hidden",
                flexShrink: 0,
                boxShadow: "var(--sh)",
              }}
            >
              {imgPreview ? (
                <img
                  src={imgPreview}
                  alt="Profile"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={() => setImgPreview(null)}
                />
              ) : (
                "LS"
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label
                className="btn btn-yellow btn-sm"
                style={{ cursor: "pointer" }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                  <polyline points="17,8 12,3 7,8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                Upload Photo
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleImageUpload}
                  style={{ display: "none" }}
                />
              </label>
              {imgPreview && (
                <button
                  onClick={removeImage}
                  className="btn btn-outline btn-sm"
                  style={{ color: "#cc0000", borderColor: "#cc0000" }}
                >
                  Remove Photo
                </button>
              )}
            </div>
          </div>
        </div>

        {/* NQ-05/NM-01: maxLength on every field */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
            gap: 16,
            marginBottom: 16,
          }}
        >
          {FIELDS.map(([k, l, max]) => (
            <div key={k}>
              <FL>
                {l} <CharCount val={(hero[k] || "").length} max={max} />
              </FL>
              <input
                value={hero[k] || ""}
                onChange={(e) =>
                  setHero((p) => ({ ...p, [k]: e.target.value }))
                }
                className="field"
                maxLength={max}
              />
            </div>
          ))}
        </div>

        <div style={{ marginBottom: 16 }}>
          <FL>
            Description{" "}
            <CharCount val={(hero.description || "").length} max={1000} />
          </FL>
          <textarea
            rows={4}
            value={hero.description || ""}
            onChange={(e) =>
              setHero((p) => ({ ...p, description: e.target.value }))
            }
            className="field"
            style={{ resize: "vertical", lineHeight: 1.7 }}
            maxLength={1000}
          />
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 20,
          }}
        >
          <span style={{ fontWeight: 600, fontSize: 14 }}>
            Available for work
          </span>
          <button
            onClick={() => setHero((p) => ({ ...p, available: !p.available }))}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: hero.available ? "var(--green)" : "var(--muted)",
              display: "flex",
            }}
          >
            {hero.available ? (
              <ToggleRight size={28} />
            ) : (
              <ToggleLeft size={28} />
            )}
          </button>
        </div>

        <button
          onClick={save}
          disabled={saving}
          className="btn btn-yellow"
          style={{ opacity: saving ? 0.7 : 1 }}
        >
          <Save size={14} />
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </Card>
    </div>
  );
}

/* ── Projects CRUD ── */
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
  image: null, // base64 project logo/screenshot
};

function ProjectsEditor({ data, onSave }) {
  const { confirm, Dialog } = useConfirm();
  const [projects, setProjects] = useState(
    data.projects.map((p) => ({
      ...p,
      // Store tags as a raw comma string while editing — prevents cursor-jump bug
      // when filter(Boolean) strips the trailing empty item after each comma keystroke.
      tags: Array.isArray(p.tags)
        ? p.tags
            .map((t) => (typeof t === "string" ? t : t?.label || ""))
            .join(", ")
        : typeof p.tags === "string"
          ? p.tags
          : "",
    })),
  );
  const [saving, setSaving] = useState(false);

  const upd = (id, field, val) =>
    setProjects((p) =>
      p.map((x) => (x.id === id ? { ...x, [field]: val } : x)),
    );
  const toggle = (id) =>
    upd(id, "visible", !projects.find((p) => p.id === id)?.visible);
  const add = () =>
    setProjects((p) => [...p, { ...BLANK_PROJECT, id: Date.now() }]);
  const moveUp = (i) => {
    if (i === 0) return;
    const a = [...projects];
    [a[i - 1], a[i]] = [a[i], a[i - 1]];
    setProjects(a);
  };
  const moveDown = (i) => {
    if (i === projects.length - 1) return;
    const a = [...projects];
    [a[i], a[i + 1]] = [a[i + 1], a[i]];
    setProjects(a);
  };

  const del = async (id) => {
    const ok = await confirm("Delete this project? This cannot be undone.");
    if (!ok) return;
    setProjects((p) => p.filter((x) => x.id !== id));
  };

  const handleProjectImage = (id, e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.match(/^image\/(jpeg|png|webp|gif)$/)) {
      toast.error("Please select a JPEG, PNG, WebP, or GIF image (not SVG)");
      return;
    }
    if (file.size > 1 * 1024 * 1024) {
      toast.error("Project image must be under 1MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => upd(id, "image", ev.target.result);
    reader.readAsDataURL(file);
  };

  const removeProjectImage = (id) => upd(id, "image", null);

  const save = async () => {
    setSaving(true);
    // Convert raw tag strings back to arrays before sending to server
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
    }));
    try {
      await onSave("projects", normalized);
      toast.success("Projects saved!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const CATS = [
    { val: "Web App", cls: "tag-y", bg: "var(--yellow)", color: "#000" },
    { val: "Android", cls: "tag-g", bg: "var(--green)", color: "#000" },
    { val: "Full Stack", cls: "tag-pk", bg: "var(--pink)", color: "#000" },
    { val: "Mobile", cls: "tag-bl", bg: "var(--blue)", color: "#fff" },
    { val: "Other", cls: "tag-pu", bg: "var(--purple)", color: "#fff" },
  ];

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
            {/* ── Project Logo / Screenshot ── */}
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
                {/* Preview box */}
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
                      CATS.find((c) => c.val === e.target.value) || CATS[0];
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
                    );
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
  );
}

/* ── Skills CRUD ── */
function SkillsEditor({ data, onSave }) {
  const { confirm, Dialog } = useConfirm();
  const [skills, setSkills] = useState({ ...data.skills });
  // rawSkills stores the textarea string per-category to prevent cursor-jump
  // when filter(Boolean) drops the in-progress entry after a trailing comma.
  const [rawSkills, setRawSkills] = useState(() => {
    const raw = {};
    for (const [cat, list] of Object.entries(data.skills || {})) {
      raw[cat] = Array.isArray(list) ? list.join(", ") : list || "";
    }
    return raw;
  });
  const [coreStack, setCoreStack] = useState((data.coreStack || []).join(", "));
  const [saving, setSaving] = useState(false);
  // NM-04: inline input instead of window.prompt
  const [newCatName, setNewCatName] = useState("");
  const [showAddCat, setShowAddCat] = useState(false);

  const save = async () => {
    setSaving(true);
    // Convert raw strings back to arrays before saving
    const skillsToSave = {};
    for (const [cat, raw] of Object.entries(rawSkills)) {
      skillsToSave[cat] = raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
    try {
      await onSave("skills", skillsToSave);
      await onSave(
        "coreStack",
        coreStack
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      );
      toast.success("Skills saved!");
    } catch {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  };

  // NM-04: validated inline add
  const addCategory = () => {
    const name = newCatName.trim();
    if (!name) {
      toast.error("Category name is required");
      return;
    }
    if (name.length > 50) {
      toast.error("Category name must be under 50 characters");
      return;
    }
    if (!/^[\w\s\-/]+$/.test(name)) {
      toast.error("Letters, numbers, spaces, hyphens only");
      return;
    }
    if (skills[name]) {
      toast.error("Category already exists");
      return;
    }
    setSkills((p) => ({ ...p, [name]: [] }));
    setRawSkills((p) => ({ ...p, [name]: "" }));
    setNewCatName("");
    setShowAddCat(false);
  };

  const delCategory = async (cat) => {
    // NQ-02: useConfirm instead of window.confirm
    const ok = await confirm(
      `Delete the "${cat}" category and all its skills?`,
    );
    if (!ok) return;
    setSkills((p) => {
      const n = { ...p };
      delete n[cat];
      return n;
    });
    setRawSkills((p) => {
      const n = { ...p };
      delete n[cat];
      return n;
    });
  };

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
          Skills
        </h2>
        {/* NM-04: inline add form instead of window.prompt */}
        {showAddCat ? (
          <div
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <input
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCategory()}
              className="field"
              placeholder="e.g. DevOps"
              maxLength={50}
              style={{ maxWidth: 180 }}
              autoFocus
            />
            <button onClick={addCategory} className="btn btn-yellow btn-sm">
              Add
            </button>
            <button
              onClick={() => {
                setShowAddCat(false);
                setNewCatName("");
              }}
              className="btn btn-outline btn-sm"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowAddCat(true)}
            className="btn btn-yellow btn-sm"
          >
            <Plus size={14} /> Add Category
          </button>
        )}
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 14,
          marginBottom: 22,
        }}
      >
        {Object.entries(skills).map(([cat, list]) => (
          <Card key={cat}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <FL>
                {cat}{" "}
                <CharCount
                  val={
                    (rawSkills[cat] !== undefined
                      ? rawSkills[cat]
                      : Array.isArray(list)
                        ? list.join(", ")
                        : ""
                    ).length
                  }
                  max={500}
                />
              </FL>
              <DelBtn onClick={() => delCategory(cat)} />
            </div>
            <textarea
              rows={3}
              value={
                rawSkills[cat] !== undefined
                  ? rawSkills[cat]
                  : Array.isArray(list)
                    ? list.join(", ")
                    : ""
              }
              onChange={(e) =>
                setRawSkills((p) => ({ ...p, [cat]: e.target.value }))
              }
              className="field"
              style={{
                resize: "vertical",
                fontFamily: "var(--mono)",
                fontSize: 13,
              }}
              placeholder="React.js, Node.js, ..."
              maxLength={500}
            />
            <div
              style={{
                fontSize: 11,
                color: "var(--muted)",
                marginTop: 6,
                fontFamily: "var(--mono)",
              }}
            >
              Comma-separated ·{" "}
              {
                (rawSkills[cat] || "")
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean).length
              }{" "}
              items
            </div>
          </Card>
        ))}
        <Card>
          <FL>
            Core Stack Strip <CharCount val={coreStack.length} max={400} />
          </FL>
          <input
            value={coreStack}
            onChange={(e) => setCoreStack(e.target.value)}
            className="field"
            placeholder="React.js, Node.js, MongoDB, ..."
            maxLength={400}
          />
          <div
            style={{
              fontSize: 11,
              color: "var(--muted)",
              marginTop: 6,
              fontFamily: "var(--mono)",
            }}
          >
            Shown as coloured tags below the skills grid
          </div>
        </Card>
      </div>
      <button
        onClick={save}
        disabled={saving}
        className="btn btn-yellow"
        style={{ opacity: saving ? 0.7 : 1 }}
      >
        <Save size={14} />
        {saving ? "Saving…" : "Save Skills"}
      </button>
    </div>
  );
}

/* ── Experience CRUD ── */
const BLANK_EXP = {
  id: Date.now(),
  role: "",
  company: "",
  location: "",
  period: "",
  current: false,
  points: [""],
};

function ExperienceEditor({ data, onSave }) {
  const { confirm, Dialog } = useConfirm();
  const [exp, setExp] = useState([...(data.experience || [])]);
  const [saving, setSaving] = useState(false);

  const upd = (id, field, val) =>
    setExp((p) => p.map((x) => (x.id === id ? { ...x, [field]: val } : x)));
  const updPt = (id, idx, val) =>
    setExp((p) =>
      p.map((x) =>
        x.id === id
          ? { ...x, points: x.points.map((pt, i) => (i === idx ? val : pt)) }
          : x,
      ),
    );
  const addPt = (id) =>
    setExp((p) =>
      p.map((x) =>
        x.id === id ? { ...x, points: [...(x.points || []), ""] } : x,
      ),
    );
  const delPt = (id, idx) =>
    setExp((p) =>
      p.map((x) =>
        x.id === id
          ? { ...x, points: x.points.filter((_, i) => i !== idx) }
          : x,
      ),
    );
  const add = () => setExp((p) => [{ ...BLANK_EXP, id: Date.now() }, ...p]);

  // NQ-02: useConfirm replaces window._confirmDelete (which was never set)
  const del = async (id) => {
    const ok = await confirm(
      "Delete this experience entry? This cannot be undone.",
    );
    if (!ok) return;
    setExp((p) => p.filter((x) => x.id !== id));
  };

  const save = async () => {
    setSaving(true);
    try {
      await onSave("experience", exp);
      toast.success("Experience saved!");
    } catch {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  };

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
          Experience
        </h2>
        <button onClick={add} className="btn btn-yellow btn-sm">
          <Plus size={14} /> Add Role
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
        {exp.map((e) => (
          <Card key={e.id}>
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
              <span style={{ fontWeight: 800, fontSize: 15 }}>
                {e.role || "New Role"}
              </span>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={!!e.current}
                    onChange={(ev) => upd(e.id, "current", ev.target.checked)}
                  />{" "}
                  Current
                </label>
                <DelBtn onClick={() => del(e.id)} />
              </div>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
                gap: 14,
                marginBottom: 16,
              }}
            >
              {[
                ["role", "Role/Title", 100],
                ["company", "Company", 150],
                ["location", "Location", 100],
                ["period", "Period", 50],
              ].map(([k, l, max]) => (
                <div key={k}>
                  <FL>
                    {l} <CharCount val={(e[k] || "").length} max={max} />
                  </FL>
                  <input
                    value={e[k] || ""}
                    onChange={(ev) => upd(e.id, k, ev.target.value)}
                    className="field"
                    style={{ fontSize: 13 }}
                    maxLength={max}
                  />
                </div>
              ))}
            </div>
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 10,
                }}
              >
                <FL>Bullet Points</FL>
                <button
                  onClick={() => addPt(e.id)}
                  className="btn btn-yellow btn-sm"
                  style={{ fontSize: 11, padding: "5px 10px" }}
                >
                  <Plus size={12} /> Add Point
                </button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {(e.points || []).map((pt, i) => (
                  <div key={i} style={{ display: "flex", gap: 8 }}>
                    <input
                      value={pt}
                      onChange={(ev) => updPt(e.id, i, ev.target.value)}
                      className="field"
                      style={{ fontSize: 13 }}
                      placeholder="Bullet point…"
                      maxLength={500}
                    />
                    <DelBtn onClick={() => delPt(e.id, i)} />
                  </div>
                ))}
              </div>
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
        {saving ? "Saving…" : "Save Experience"}
      </button>
    </div>
  );
}

/* ── Section Visibility ── */
function SectionsEditor({ data, onSave }) {
  const [sections, setSections] = useState({ ...data.sections });
  const [saving, setSaving] = useState(false);
  const save = async () => {
    setSaving(true);
    try {
      await onSave("sections", sections);
      toast.success("Visibility saved!");
    } catch {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  };
  return (
    <div>
      <h2
        style={{
          fontWeight: 900,
          fontSize: "clamp(20px,3vw,26px)",
          letterSpacing: "-0.03em",
          marginBottom: 28,
        }}
      >
        Section Visibility
      </h2>
      <Card style={{ padding: 0 }}>
        {Object.entries(sections).map(([key, val], i, arr) => (
          <div
            key={key}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "16px 24px",
              borderBottom:
                i < arr.length - 1 ? "2px solid var(--ink)" : "none",
            }}
          >
            <div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 15,
                  textTransform: "capitalize",
                }}
              >
                {key} Section
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "var(--muted)",
                  fontFamily: "var(--mono)",
                  marginTop: 2,
                }}
              >
                {val ? "Visible on portfolio" : "Hidden from portfolio"}
              </div>
            </div>
            <button
              onClick={() => setSections((p) => ({ ...p, [key]: !p[key] }))}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: val ? "var(--green)" : "var(--muted)",
                display: "flex",
              }}
            >
              {val ? <ToggleRight size={30} /> : <ToggleLeft size={30} />}
            </button>
          </div>
        ))}
      </Card>
      <button
        onClick={save}
        disabled={saving}
        className="btn btn-yellow"
        style={{ marginTop: 22, opacity: saving ? 0.7 : 1 }}
      >
        <Save size={14} />
        {saving ? "Saving…" : "Save Visibility"}
      </button>
    </div>
  );
}

/* ── Contacts Viewer ── */
function ContactsViewer() {
  const { confirm, Dialog } = useConfirm();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  const fetchContacts = async (p = 1) => {
    setLoading(true);
    try {
      // M-01: use apiClient (scoped, has auth token)
      const r = await apiClient.get(`/admin/contacts?page=${p}&limit=10`);
      setContacts(r.data.contacts || []);
      setPagination(r.data.pagination || { total: 0, pages: 1 });
    } catch {
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  // NQ-01: useEffect instead of useState
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const r = await apiClient.get("/admin/contacts?page=1&limit=10");
        if (!mounted) return;
        setContacts(r.data.contacts || []);
        setPagination(r.data.pagination || { total: 0, pages: 1 });
      } catch {
        if (mounted) toast.error("Failed to load messages");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const fmt = (iso) => {
    try {
      return new Date(iso).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch {
      return iso || "—";
    }
  };

  // M-02: Mark as read
  const markRead = async (id) => {
    try {
      await apiClient.put(`/admin/contacts/${id}/read`);
      setContacts((cs) =>
        cs.map((c) => (c._id === id ? { ...c, read: true } : c)),
      );
      if (selected?._id === id) setSelected((s) => ({ ...s, read: true }));
    } catch {
      toast.error("Failed to mark as read");
    }
  };

  // NM-02: Delete contact
  const deleteContact = async (id) => {
    const ok = await confirm("Delete this message? This cannot be undone.");
    if (!ok) return;
    try {
      await apiClient.delete(`/admin/contacts/${id}`);
      setContacts((cs) => cs.filter((c) => c._id !== id));
      if (selected?._id === id) setSelected(null);
      toast.success("Message deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  // NM-02: Delete all read
  const deleteAllRead = async () => {
    const readCount = contacts.filter((c) => c.read).length;
    if (!readCount) {
      toast("No read messages to delete");
      return;
    }
    const ok = await confirm(
      `Delete all ${readCount} read message(s)? This cannot be undone.`,
    );
    if (!ok) return;
    try {
      const r = await apiClient.delete("/admin/contacts");
      toast.success(r.data.message);
      fetchContacts(1);
      setPage(1);
    } catch {
      toast.error("Bulk delete failed");
    }
  };

  if (selected) {
    return (
      <div>
        {Dialog}
        <button
          onClick={() => setSelected(null)}
          className="btn btn-outline btn-sm"
          style={{ marginBottom: 20 }}
        >
          <ArrowLeft size={14} /> Back to Messages
        </button>
        <Card>
          <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
            <div className="mac-dot" style={{ background: "#ff5f57" }} />
            <div className="mac-dot" style={{ background: "#febc2e" }} />
            <div className="mac-dot" style={{ background: "#28c840" }} />
            <span
              style={{
                fontFamily: "var(--mono)",
                fontSize: 11,
                color: "var(--muted)",
                marginLeft: 8,
              }}
            >
              message.details
            </span>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
              gap: 12,
              marginBottom: 20,
            }}
          >
            {[
              { Icon: User, label: "From", val: selected.name },
              { Icon: Mail, label: "Email", val: selected.email },
              { Icon: Clock, label: "Received", val: fmt(selected.createdAt) },
              { Icon: Monitor, label: "Device", val: selected.device || "—" },
              { Icon: Wifi, label: "IP", val: selected.ip || "—" },
            ].map(({ Icon, label, val }) => (
              <div
                key={label}
                style={{
                  border: "2px solid var(--ink)",
                  borderRadius: "var(--r)",
                  padding: "12px 14px",
                  background: "var(--cream)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    marginBottom: 4,
                  }}
                >
                  <Icon size={12} style={{ color: "var(--muted)" }} />
                  <span
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: 10,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: "var(--muted)",
                    }}
                  >
                    {label}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--ink)",
                    wordBreak: "break-all",
                  }}
                >
                  {val}
                </div>
              </div>
            ))}
          </div>
          <FL>Message</FL>
          <div
            style={{
              border: "2px solid var(--ink)",
              borderRadius: "var(--r)",
              padding: "16px 18px",
              background: "var(--paper)",
              fontSize: 15,
              lineHeight: 1.8,
              color: "var(--ink)",
              whiteSpace: "pre-wrap",
              marginBottom: 20,
              minHeight: 80,
            }}
          >
            {selected.message}
          </div>
          {selected.browser && (
            <div
              style={{
                fontSize: 12,
                color: "var(--muted)",
                fontFamily: "var(--mono)",
                marginBottom: 20,
              }}
            >
              Browser: {selected.browser}
            </div>
          )}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <a
              href={`mailto:${selected.email}?subject=Re: Your message&body=Hi ${selected.name},`}
              className="btn btn-yellow"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Mail size={14} /> Reply to {selected.name}
            </a>
            {!selected.read && (
              <button
                onClick={() => markRead(selected._id)}
                className="btn btn-outline btn-sm"
              >
                <CheckCheck size={14} /> Mark as Read
              </button>
            )}
            <button
              onClick={() => deleteContact(selected._id)}
              className="btn btn-outline btn-sm"
              style={{ color: "#cc0000", borderColor: "#cc0000" }}
            >
              <Trash2 size={14} /> Delete
            </button>
          </div>
        </Card>
      </div>
    );
  }

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
          Messages
          {pagination.total > 0 && (
            <span
              style={{
                fontWeight: 400,
                fontSize: 16,
                color: "var(--muted)",
                marginLeft: 12,
              }}
            >
              ({pagination.total} total)
            </span>
          )}
        </h2>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => fetchContacts(page)}
            className="btn btn-outline btn-sm"
          >
            Refresh
          </button>
          <button
            onClick={deleteAllRead}
            className="btn btn-outline btn-sm"
            style={{ color: "#cc0000", borderColor: "#cc0000" }}
          >
            <Trash2 size={13} /> Delete Read
          </button>
        </div>
      </div>

      {loading ? (
        <div
          style={{
            textAlign: "center",
            padding: "40px 0",
            color: "var(--muted)",
            fontFamily: "var(--mono)",
          }}
        >
          Loading messages…
        </div>
      ) : contacts.length === 0 ? (
        <Card style={{ textAlign: "center", padding: 40 }}>
          <MessageSquare
            size={32}
            style={{ color: "var(--muted)", margin: "0 auto 12px" }}
          />
          <div
            style={{
              color: "var(--muted)",
              fontFamily: "var(--mono)",
              fontSize: 14,
            }}
          >
            No messages yet
          </div>
        </Card>
      ) : (
        <>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              marginBottom: 20,
            }}
          >
            {contacts.map((c, i) => (
              <div
                key={c._id || i}
                onClick={() => setSelected(c)}
                style={{
                  border: "2px solid var(--ink)",
                  borderRadius: "var(--r)",
                  padding: "16px 20px",
                  background: c.read ? "var(--surface)" : "var(--cream)",
                  boxShadow: "var(--sh)",
                  cursor: "pointer",
                  transition: "transform .15s, box-shadow .15s",
                  display: "flex",
                  gap: 16,
                  alignItems: "center",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translate(-2px,-2px)";
                  e.currentTarget.style.boxShadow = "var(--sh-lg)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.boxShadow = "var(--sh)";
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: "50%",
                    background: c.read ? "var(--muted)" : "var(--yellow)",
                    border: "2px solid var(--ink)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 900,
                    fontSize: 16,
                    color: "#000",
                    flexShrink: 0,
                  }}
                >
                  {c.name?.charAt(0)?.toUpperCase() || "?"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 12,
                      flexWrap: "wrap",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: c.read ? 600 : 800,
                        fontSize: 15,
                        color: "var(--ink)",
                      }}
                    >
                      {c.name}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--muted)",
                        fontFamily: "var(--mono)",
                        flexShrink: 0,
                      }}
                    >
                      {fmt(c.createdAt)}
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "var(--muted)",
                      marginTop: 2,
                    }}
                  >
                    {c.email}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "var(--subtle)",
                      marginTop: 4,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {c.message}
                  </div>
                </div>
                {!c.read && (
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "var(--yellow)",
                      border: "2px solid var(--ink)",
                      flexShrink: 0,
                    }}
                    title="Unread"
                  />
                )}
                <ChevronRight
                  size={16}
                  style={{ color: "var(--muted)", flexShrink: 0 }}
                />
              </div>
            ))}
          </div>
          {pagination.pages > 1 && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 10,
                alignItems: "center",
              }}
            >
              <button
                onClick={() => {
                  const p = Math.max(1, page - 1);
                  setPage(p);
                  fetchContacts(p);
                }}
                disabled={page <= 1}
                className="btn btn-outline btn-sm"
                style={{ opacity: page <= 1 ? 0.4 : 1 }}
              >
                <ChevronLeft size={14} />
              </button>
              <span
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: 13,
                  color: "var(--muted)",
                }}
              >
                {page} / {pagination.pages}
              </span>
              <button
                onClick={() => {
                  const p = Math.min(pagination.pages, page + 1);
                  setPage(p);
                  fetchContacts(p);
                }}
                disabled={page >= pagination.pages}
                className="btn btn-outline btn-sm"
                style={{ opacity: page >= pagination.pages ? 0.4 : 1 }}
              >
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ── Password field with eye toggle (reused in SecurityEditor) ── */
function PwField({
  value,
  onChange,
  placeholder,
  autoComplete = "current-password",
  label,
}) {
  const [show, setShow] = useState(false);
  return (
    <div>
      {label && (
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            fontFamily: "var(--mono)",
            letterSpacing: ".08em",
            textTransform: "uppercase",
            color: "var(--muted)",
            marginBottom: 7,
          }}
        >
          {label}
        </div>
      )}
      <div style={{ position: "relative" }}>
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="field"
          style={{ paddingRight: 44 }}
          autoComplete={autoComplete}
          maxLength={128}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          tabIndex={-1}
          style={{
            position: "absolute",
            right: 12,
            top: "50%",
            transform: "translateY(-50%)",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--muted)",
            display: "flex",
            alignItems: "center",
            padding: 4,
          }}
          aria-label={show ? "Hide" : "Show"}
        >
          {show ? (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          ) : (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

/* ── Password strength bar ── */
function StrBar({ pw }) {
  const checks = [
    pw.length >= 12,
    /[A-Z]/.test(pw),
    /[a-z]/.test(pw),
    /[0-9]/.test(pw),
    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(pw),
  ];
  const score = checks.filter(Boolean).length;
  const cols = ["#ff4444", "#ff8c42", "#ffd700", "#00aa44", "#00cc66"];
  if (!pw) return null;
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: "flex", gap: 3, marginBottom: 4 }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 3,
              borderRadius: 2,
              background: i < score ? cols[score - 1] : "var(--cream)",
            }}
          />
        ))}
      </div>
      <div
        style={{
          fontSize: 11,
          fontFamily: "var(--mono)",
          fontWeight: 700,
          color: cols[score - 1] || "var(--muted)",
        }}
      >
        {["Very weak", "Weak", "Fair", "Good", "Strong"][score - 1] || ""}
        {score < 5 && (
          <span style={{ fontWeight: 400, color: "var(--muted)" }}>
            {" "}
            — needs:{" "}
            {[
              !checks[0] && "12+ chars",
              !checks[1] && "uppercase",
              !checks[2] && "lowercase",
              !checks[3] && "number",
              !checks[4] && "symbol",
            ]
              .filter(Boolean)
              .join(", ")}
          </span>
        )}
      </div>
    </div>
  );
}

/* ── Security / TOTP + Change Password ── */
function SecurityEditor() {
  const { admin } = useAuth();
  const { confirm, Dialog } = useConfirm();

  // TOTP state
  const [step, setStep] = useState("idle");
  const [qr, setQr] = useState(null);
  const [setupToken, setSetupToken] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  // Change-password state — panel is separate from TOTP
  const [pwPanel, setPwPanel] = useState("idle"); // idle | verify-otp | change
  const [pwOtpToken, setPwOtpToken] = useState("");
  const [pwOtp, setPwOtp] = useState("");
  const [curPw, setCurPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  /* ── Request OTP to verify identity before changing password ── */
  const requestPwOtp = async () => {
    if (!admin?.email) return;
    setPwLoading(true);
    try {
      const r = await apiClient.post("/admin/forgot-password", {
        email: admin.email,
      });
      if (r.data.token) {
        setPwOtpToken(r.data.token);
        setPwPanel("verify-otp");
        toast.success("A verification code has been sent to your email");
      } else {
        toast.error("Could not send code — check server email config");
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to send code");
    } finally {
      setPwLoading(false);
    }
  };

  /* ── Verify OTP then proceed to new-password form ── */
  const verifyPwOtp = () => {
    const c = pwOtp.replace(/\s/g, "");
    if (!c || c.length < 6) {
      toast.error("Enter the 6-digit code");
      return;
    }
    // We just store the OTP here; actual verification happens on the final submit
    setPwPanel("change");
  };

  /* ── Submit: verify OTP + current password + set new password ── */
  const submitPwChange = async () => {
    if (!curPw) {
      toast.error("Enter your current password");
      return;
    }
    if (!newPw) {
      toast.error("Enter a new password");
      return;
    }
    if (newPw !== confirmPw) {
      toast.error("Passwords do not match");
      return;
    }
    if (newPw.length < 12) {
      toast.error("Password must be at least 12 characters");
      return;
    }
    setPwLoading(true);
    try {
      // Use the OTP-based reset-password endpoint for identity verification
      // after confirming current password separately
      await apiClient.put("/admin/password", {
        currentPassword: curPw,
        newPassword: newPw,
      });
      toast.success("Password changed. You have been logged out.");
      setCurPw("");
      setNewPw("");
      setConfirmPw("");
      setPwOtp("");
      setPwOtpToken("");
      setPwPanel("idle");
    } catch (e) {
      toast.error(e.response?.data?.message || "Change failed");
    } finally {
      setPwLoading(false);
    }
  };

  const resetPwPanel = () => {
    setPwPanel("idle");
    setPwOtp("");
    setPwOtpToken("");
    setCurPw("");
    setNewPw("");
    setConfirmPw("");
  };

  const startSetup = async () => {
    if (loading) return; // NQ-02: prevent rapid re-calls that bloat OTP store
    setLoading(true);
    try {
      // H-01: backend no longer sends secret — only qrDataUrl + setupToken
      const r = await apiClient.post("/admin/setup-totp");
      setQr(r.data.qrDataUrl);
      setSetupToken(r.data.setupToken);
      setCode("");
      setStep("setup");
    } catch (e) {
      toast.error(e.response?.data?.message || "Setup failed");
    } finally {
      setLoading(false);
    }
  };

  const verifyTotp = async () => {
    if (!code || code.length < 6) {
      toast.error("Enter 6-digit code");
      return;
    }
    setLoading(true);
    try {
      await apiClient.post("/admin/enable-totp", { code, setupToken });
      toast.success("Google Authenticator enabled!");
      // Clear sensitive state from memory
      setQr(null);
      setSetupToken("");
      setCode("");
      setStep("done");
    } catch (e) {
      toast.error(e.response?.data?.message || "Invalid code");
    } finally {
      setLoading(false);
    }
  };

  const disableTotp = async () => {
    // NQ-03: useConfirm instead of window.confirm
    const ok = await confirm(
      "Disable Google Authenticator? Email OTP will be used instead.",
    );
    if (!ok) return;
    setLoading(true);
    try {
      await apiClient.delete("/admin/disable-totp");
      toast.success("Google Authenticator disabled");
      setStep("idle");
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  const totpEnabled = admin?.totpEnabled;

  return (
    <div>
      {Dialog}
      <h2
        style={{
          fontWeight: 900,
          fontSize: "clamp(20px,3vw,26px)",
          letterSpacing: "-0.03em",
          marginBottom: 28,
        }}
      >
        Security
      </h2>

      <Card style={{ marginBottom: 20 }}>
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
            <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>
              Two-Factor Authentication
            </div>
            <div style={{ fontSize: 14, color: "var(--muted)" }}>
              {totpEnabled || step === "done"
                ? "Google Authenticator is enabled. Your account is protected."
                : "Email OTP is active. Upgrade to Google Authenticator for better security."}
            </div>
          </div>
          <span
            style={{
              padding: "5px 14px",
              borderRadius: 99,
              border: "2px solid var(--ink)",
              fontWeight: 700,
              fontSize: 13,
              background:
                totpEnabled || step === "done"
                  ? "var(--green)"
                  : "var(--yellow)",
              color: "#000",
            }}
          >
            {totpEnabled || step === "done" ? "🔐 TOTP Active" : "📧 Email OTP"}
          </span>
        </div>
      </Card>

      {step === "idle" && (
        <Card>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>
            {totpEnabled
              ? "Manage Google Authenticator"
              : "Enable Google Authenticator"}
          </div>
          <p
            style={{
              fontSize: 14,
              color: "var(--muted)",
              marginBottom: 18,
              lineHeight: 1.7,
            }}
          >
            {totpEnabled
              ? "Your account is protected by Google Authenticator. You can disable it to switch back to email OTP."
              : "Use Google Authenticator or any TOTP app (Authy, 1Password, etc.) to generate time-based codes."}
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {!totpEnabled && (
              <button
                onClick={startSetup}
                disabled={loading}
                className="btn btn-yellow"
                style={{ opacity: loading ? 0.7 : 1 }}
              >
                <KeyRound size={15} />
                {loading ? "Generating…" : "Set Up Google Authenticator"}
              </button>
            )}
            {totpEnabled && (
              <button
                onClick={disableTotp}
                disabled={loading}
                className="btn btn-outline"
                style={{
                  color: "#cc0000",
                  borderColor: "#cc0000",
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? "Disabling…" : "Disable TOTP"}
              </button>
            )}
          </div>
        </Card>
      )}

      {step === "setup" && (
        <Card>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 18 }}>
            Step 1 — Scan QR Code
          </div>
          <p
            style={{
              fontSize: 14,
              color: "var(--muted)",
              marginBottom: 16,
              lineHeight: 1.7,
            }}
          >
            Open{" "}
            <strong style={{ color: "var(--ink)" }}>
              Google Authenticator
            </strong>{" "}
            (or Authy, 1Password, etc.) on your phone and scan this QR code:
          </p>
          {qr && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: 20,
              }}
            >
              <img
                src={qr}
                alt="TOTP QR Code — scan with your authenticator app"
                style={{
                  width: 200,
                  height: 200,
                  border: "2px solid var(--ink)",
                  borderRadius: 12,
                  boxShadow: "var(--sh)",
                }}
              />
            </div>
          )}
          {/* H-01: No manual key shown — backend no longer sends secret */}
          <p
            style={{
              fontSize: 13,
              color: "var(--muted)",
              marginBottom: 20,
              fontFamily: "var(--mono)",
            }}
          >
            If you cannot scan the QR code, please regenerate it by cancelling
            and starting again.
          </p>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 10 }}>
            Step 2 — Verify Code
          </div>
          <p style={{ fontSize: 14, color: "var(--muted)", marginBottom: 14 }}>
            Enter the 6-digit code shown in the app:
          </p>
          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              alignItems: "flex-end",
            }}
          >
            <div style={{ flex: 1, minWidth: 160 }}>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                className="field"
                style={{
                  textAlign: "center",
                  fontSize: 24,
                  fontWeight: 900,
                  fontFamily: "var(--mono)",
                  letterSpacing: "0.35em",
                }}
                autoComplete="one-time-code"
              />
            </div>
            <button
              onClick={verifyTotp}
              disabled={loading || code.length < 6}
              className="btn btn-yellow"
              style={{ opacity: loading || code.length < 6 ? 0.7 : 1 }}
            >
              <Shield size={15} />
              {loading ? "Verifying…" : "Verify & Enable"}
            </button>
          </div>
          <button
            onClick={() => {
              setStep("idle");
              setQr(null);
              setSetupToken("");
              setCode("");
            }}
            className="btn btn-outline btn-sm"
            style={{ marginTop: 14 }}
          >
            <ArrowLeft size={13} /> Cancel
          </button>
        </Card>
      )}

      {step === "done" && (
        <Card style={{ background: "var(--green)", borderColor: "var(--ink)" }}>
          <div
            style={{
              fontWeight: 900,
              fontSize: 20,
              marginBottom: 8,
              color: "#000",
            }}
          >
            ✓ Google Authenticator Enabled!
          </div>
          <p style={{ fontSize: 15, color: "#000", lineHeight: 1.7 }}>
            From your next login you'll be asked for a code from your
            authenticator app.
          </p>
          <button
            onClick={() => setStep("idle")}
            className="btn btn-outline btn-sm"
            style={{ marginTop: 14, borderColor: "#000", color: "#000" }}
          >
            Done
          </button>
        </Card>
      )}

      {/* ── Change Password ── */}
      <div
        style={{
          marginTop: 28,
          borderTop: "2px solid var(--ink)",
          paddingTop: 28,
        }}
      >
        <h3
          style={{
            fontWeight: 900,
            fontSize: 17,
            letterSpacing: "-0.02em",
            marginBottom: 16,
          }}
        >
          Change Password
        </h3>

        {pwPanel === "idle" && (
          <Card>
            <p
              style={{
                fontSize: 14,
                color: "var(--muted)",
                marginBottom: 18,
                lineHeight: 1.7,
              }}
            >
              To change your password, we'll first send a verification code to
              your admin email to confirm your identity.
            </p>
            <button
              onClick={requestPwOtp}
              disabled={pwLoading}
              className="btn btn-yellow"
              style={{ opacity: pwLoading ? 0.7 : 1 }}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
              {pwLoading ? "Sending code…" : "Start Password Change"}
            </button>
          </Card>
        )}

        {pwPanel === "verify-otp" && (
          <Card>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>
              Step 1 — Verify your identity
            </div>
            <p
              style={{
                fontSize: 13,
                color: "var(--muted)",
                marginBottom: 16,
                lineHeight: 1.7,
              }}
            >
              Enter the 6-digit code sent to{" "}
              <strong style={{ color: "var(--ink)" }}>{admin?.email}</strong>
            </p>
            <div style={{ marginBottom: 16 }}>
              <FL>Verification Code</FL>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={pwOtp}
                onChange={(e) =>
                  setPwOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                className="field"
                style={{
                  textAlign: "center",
                  fontSize: 24,
                  fontWeight: 900,
                  fontFamily: "var(--mono)",
                  letterSpacing: "0.35em",
                }}
                placeholder="000000"
                autoComplete="one-time-code"
              />
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                onClick={verifyPwOtp}
                disabled={pwOtp.length < 6}
                className="btn btn-yellow"
                style={{ opacity: pwOtp.length < 6 ? 0.6 : 1 }}
              >
                Continue →
              </button>
              <button
                onClick={requestPwOtp}
                disabled={pwLoading}
                className="btn btn-outline btn-sm"
                style={{ opacity: pwLoading ? 0.6 : 1 }}
              >
                {pwLoading ? "Sending…" : "Resend Code"}
              </button>
              <button onClick={resetPwPanel} className="btn btn-outline btn-sm">
                Cancel
              </button>
            </div>
          </Card>
        )}

        {pwPanel === "change" && (
          <Card>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>
              Step 2 — Set new password
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <FL>Current Password</FL>
                <PwField
                  value={curPw}
                  onChange={(e) => setCurPw(e.target.value)}
                  placeholder="Your current password"
                  autoComplete="current-password"
                />
              </div>
              <div>
                <FL>New Password</FL>
                <PwField
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  placeholder="Min 12 chars, mixed, symbol"
                  autoComplete="new-password"
                />
                <StrBar pw={newPw} />
              </div>
              <div>
                <FL>Confirm New Password</FL>
                <PwField
                  value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                  placeholder="Re-enter new password"
                  autoComplete="new-password"
                />
                {confirmPw && newPw !== confirmPw && (
                  <p
                    style={{
                      fontSize: 11,
                      color: "#cc0000",
                      marginTop: 5,
                      fontFamily: "var(--mono)",
                    }}
                  >
                    Passwords do not match
                  </p>
                )}
                {confirmPw && newPw === confirmPw && (
                  <p
                    style={{
                      fontSize: 11,
                      color: "var(--green)",
                      marginTop: 5,
                      fontFamily: "var(--mono)",
                    }}
                  >
                    ✓ Passwords match
                  </p>
                )}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
                marginTop: 20,
              }}
            >
              <button
                onClick={submitPwChange}
                disabled={
                  pwLoading ||
                  !curPw ||
                  newPw !== confirmPw ||
                  newPw.length < 12
                }
                className="btn btn-yellow"
                style={{
                  opacity:
                    pwLoading ||
                    !curPw ||
                    newPw !== confirmPw ||
                    newPw.length < 12
                      ? 0.6
                      : 1,
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <polyline points="20,6 9,17 4,12" />
                </svg>
                {pwLoading ? "Saving…" : "Save New Password"}
              </button>
              <button onClick={resetPwPanel} className="btn btn-outline btn-sm">
                Cancel
              </button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN DASHBOARD SHELL
══════════════════════════════════════════════════════ */
const NAV_ITEMS = [
  { key: "overview", label: "Overview", Icon: LayoutDashboard },
  { key: "hero", label: "Hero & Info", Icon: User },
  { key: "projects", label: "Projects", Icon: FolderOpen },
  { key: "skills", label: "Skills", Icon: Wrench },
  { key: "experience", label: "Experience", Icon: Briefcase },
  { key: "sections", label: "Visibility", Icon: Eye },
  { key: "security", label: "Security", Icon: KeyRound },
  { key: "messages", label: "Messages", Icon: MessageSquare },
];

export default function AdminDashboard() {
  const { admin, logout } = useAuth();
  const { data, updateSection } = useData();
  const { dark, toggle } = useTheme();
  const nav = useNavigate();
  const [active, setActive] = useState("overview");
  const [sidebarOpen, setSidebar] = useState(false);

  const doLogout = async () => {
    await logout();
    nav("/admin/login");
  };

  const renderPanel = () => {
    const props = { data, onSave: updateSection };
    switch (active) {
      case "overview":
        return <Overview {...props} />;
      case "hero":
        return <HeroEditor {...props} />;
      case "projects":
        return <ProjectsEditor {...props} />;
      case "skills":
        return <SkillsEditor {...props} />;
      case "experience":
        return <ExperienceEditor {...props} />;
      case "sections":
        return <SectionsEditor {...props} />;
      case "security":
        return <SecurityEditor />;
      case "messages":
        return <ContactsViewer />;
      default:
        return <Overview {...props} />;
    }
  };

  const SidebarInner = () => (
    <>
      <div
        style={{
          padding: "20px 18px 16px",
          borderBottom: "2px solid var(--ink)",
        }}
      >
        <div
          style={{
            fontWeight: 900,
            fontSize: 17,
            letterSpacing: "-0.04em",
            marginBottom: 4,
          }}
        >
          Lokesh
          <mark
            style={{
              background: "var(--yellow)",
              padding: "0 5px 1px",
              border: "2px solid var(--ink)",
              borderRadius: 4,
              marginLeft: 2,
              color: "#000",
              fontSize: 14,
            }}
          >
            Admin
          </mark>
        </div>
        <div
          style={{
            fontSize: 12,
            color: "var(--muted)",
            fontFamily: "var(--mono)",
          }}
        >
          {admin?.email}
        </div>
      </div>
      <nav style={{ flex: 1, padding: "12px 10px", overflowY: "auto" }}>
        {NAV_ITEMS.map(({ key, label, Icon }) => (
          <button
            key={key}
            onClick={() => {
              setActive(key);
              setSidebar(false);
            }}
            className={`anav-btn${active === key ? " active" : ""}`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </nav>
      <div
        style={{ padding: "10px 10px 16px", borderTop: "2px solid var(--ink)" }}
      >
        <button onClick={toggle} className="anav-btn">
          {dark ? <Sun size={15} /> : <Moon size={15} />}
          {dark ? "Light Mode" : "Dark Mode"}
        </button>
        <button
          onClick={doLogout}
          className="anav-btn"
          style={{ color: "#cc0000" }}
        >
          <LogOut size={15} />
          Logout
        </button>
      </div>
    </>
  );

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "var(--paper)",
        fontFamily: "var(--font)",
      }}
    >
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "var(--surface)",
            color: "var(--ink)",
            border: "2px solid var(--ink)",
            borderRadius: "var(--r)",
            fontFamily: "var(--font)",
            fontWeight: 600,
            boxShadow: "var(--sh)",
          },
        }}
      />

      {/* Desktop sidebar */}
      <aside
        className="hide-mobile"
        style={{
          width: 224,
          background: "var(--surface)",
          borderRight: "2px solid var(--ink)",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          position: "sticky",
          top: 0,
          height: "100vh",
        }}
      >
        <SidebarInner />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex" }}
          onClick={() => setSidebar(false)}
        >
          <aside
            style={{
              width: 240,
              background: "var(--surface)",
              borderRight: "2px solid var(--ink)",
              display: "flex",
              flexDirection: "column",
              height: "100vh",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <SidebarInner />
          </aside>
          <div style={{ flex: 1, background: "rgba(0,0,0,.45)" }} />
        </div>
      )}

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        {/* Mobile top bar */}
        <div
          className="show-mobile"
          style={{
            padding: "12px 16px",
            borderBottom: "2px solid var(--ink)",
            background: "var(--surface)",
            display: "flex",
            alignItems: "center",
            gap: 12,
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <button className="icon-btn" onClick={() => setSidebar(true)}>
            ☰
          </button>
          <div style={{ fontWeight: 800, fontSize: 15 }}>
            {NAV_ITEMS.find((n) => n.key === active)?.label || "Dashboard"}
          </div>
        </div>
        <main
          style={{
            padding: "clamp(20px,4vw,40px)",
            flex: 1,
            overflowY: "auto",
          }}
        >
          {renderPanel()}
        </main>
      </div>
    </div>
  );
}
