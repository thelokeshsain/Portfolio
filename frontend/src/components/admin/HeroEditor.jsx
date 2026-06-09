import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { Save, ToggleLeft, ToggleRight } from 'lucide-react'
import { Card, FL, CharCount } from './AdminHelpers'

export default function HeroEditor({ data, onSave }) {
  const [hero, setHero] = useState({ ...data.hero })
  const [saving, setSaving] = useState(false)
  const [imgPreview, setImgPreview] = useState(hero.image || null)

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
  ]

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.match(/^image\/(jpeg|png|webp|gif)$/)) {
      toast.error("Please select a JPEG, PNG, WebP, or GIF image (not SVG)")
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be under 2MB")
      return
    }
    const reader = new FileReader()
    reader.onload = (ev) => {
      const dataUrl = ev.target.result
      setImgPreview(dataUrl)
      setHero((p) => ({ ...p, image: dataUrl }))
    }
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setImgPreview(null)
    setHero((p) => ({ ...p, image: null }))
  }

  const save = async () => {
    setSaving(true)
    try {
      await onSave("hero", hero)
      toast.success("Hero saved!")
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed")
    } finally {
      setSaving(false)
    }
  }

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
  )
}
