import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { Save, Plus } from 'lucide-react'
import { useConfirm } from '../ui/ConfirmDialog'
import { Card, FL, DelBtn, CharCount } from './AdminHelpers'

const BLANK_EXP = {
  id: Date.now(),
  role: "",
  company: "",
  location: "",
  period: "",
  current: false,
  points: [""],
}

export default function ExperienceEditor({ data, onSave }) {
  const { confirm, Dialog } = useConfirm()
  const [exp, setExp] = useState([...(data.experience || [])])
  const [saving, setSaving] = useState(false)

  const upd = (id, field, val) =>
    setExp((p) => p.map((x) => (x.id === id ? { ...x, [field]: val } : x)))
  const updPt = (id, idx, val) =>
    setExp((p) =>
      p.map((x) =>
        x.id === id
          ? { ...x, points: x.points.map((pt, i) => (i === idx ? val : pt)) }
          : x,
      ),
    )
  const addPt = (id) =>
    setExp((p) =>
      p.map((x) =>
        x.id === id ? { ...x, points: [...(x.points || []), ""] } : x,
      ),
    )
  const delPt = (id, idx) =>
    setExp((p) =>
      p.map((x) =>
        x.id === id
          ? { ...x, points: x.points.filter((_, i) => i !== idx) }
          : x,
      ),
    )
  const add = () => setExp((p) => [{ ...BLANK_EXP, id: Date.now() }, ...p])

  const del = async (id) => {
    const ok = await confirm(
      "Delete this experience entry? This cannot be undone.",
    )
    if (!ok) return
    setExp((p) => p.filter((x) => x.id !== id))
  }

  const save = async () => {
    setSaving(true)
    try {
      await onSave("experience", exp)
      toast.success("Experience saved!")
    } catch {
      toast.error("Save failed")
    } finally {
      setSaving(false)
    }
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
  )
}
