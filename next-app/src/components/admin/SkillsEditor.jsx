import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { Save, Plus } from 'lucide-react'
import { useConfirm } from '../ui/ConfirmDialog'
import { Card, FL, DelBtn, CharCount } from './AdminHelpers'

export default function SkillsEditor({ data, onSave }) {
  const { confirm, Dialog } = useConfirm()
  const [skills, setSkills] = useState({ ...data.skills })
  const [rawSkills, setRawSkills] = useState(() => {
    const raw = {}
    for (const [cat, list] of Object.entries(data.skills || {})) {
      raw[cat] = Array.isArray(list) ? list.join(", ") : list || ""
    }
    return raw
  })
  const [coreStack, setCoreStack] = useState((data.coreStack || []).join(", "))
  const [saving, setSaving] = useState(false)
  const [newCatName, setNewCatName] = useState("")
  const [showAddCat, setShowAddCat] = useState(false)

  const save = async () => {
    setSaving(true)
    const skillsToSave = {}
    for (const [cat, raw] of Object.entries(rawSkills)) {
      skillsToSave[cat] = raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    }
    try {
      await onSave("skills", skillsToSave)
      await onSave(
        "coreStack",
        coreStack
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      )
      toast.success("Skills saved!")
    } catch {
      toast.error("Save failed")
    } finally {
      setSaving(false)
    }
  }

  const addCategory = () => {
    const name = newCatName.trim()
    if (!name) {
      toast.error("Category name is required")
      return
    }
    if (name.length > 50) {
      toast.error("Category name must be under 50 characters")
      return
    }
    if (!/^[\w\s\-/]+$/.test(name)) {
      toast.error("Letters, numbers, spaces, hyphens only")
      return
    }
    if (skills[name]) {
      toast.error("Category already exists")
      return
    }
    setSkills((p) => ({ ...p, [name]: [] }))
    setRawSkills((p) => ({ ...p, [name]: "" }))
    setNewCatName("")
    setShowAddCat(false)
  }

  const delCategory = async (cat) => {
    const ok = await confirm(
      `Delete the "${cat}" category and all its skills?`,
    )
    if (!ok) return
    setSkills((p) => {
      const n = { ...p }
      delete n[cat]
      return n
    })
    setRawSkills((p) => {
      const n = { ...p }
      delete n[cat]
      return n
    })
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
          Skills
        </h2>
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
                setShowAddCat(false)
                setNewCatName("")
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
  )
}
