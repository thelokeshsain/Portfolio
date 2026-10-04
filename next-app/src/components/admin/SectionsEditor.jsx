import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { Save, ToggleLeft, ToggleRight } from 'lucide-react'
import { Card } from './AdminHelpers'

export default function SectionsEditor({ data, onSave }) {
  const [sections, setSections] = useState({ ...data.sections })
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    try {
      await onSave("sections", sections)
      toast.success("Visibility saved!")
    } catch {
      toast.error("Save failed")
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
                i < arr.length - 1 ? "1px solid rgba(255, 255, 255, 0.08)" : "none",
            }}
          >
            <div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 15,
                  textTransform: "capitalize",
                  color: "#F0F2F5",
                }}
              >
                {key} Section
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "#8B93A7",
                  fontFamily: "var(--font-mono, monospace)",
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
                color: val ? "#10B981" : "#505872",
                display: "flex",
              }}
              aria-label={`Toggle ${key} section visibility`}
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
  )
}
