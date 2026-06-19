import { useState } from "react";
import toast from "react-hot-toast";
import { Plus, ChevronUp, ChevronDown, Save } from "lucide-react";
import { useConfirm } from "../ui/ConfirmDialog";
import { Card, FL, DelBtn, CharCount } from "./AdminHelpers";

const BLANK_ACHIEVEMENT = {
  id: Date.now(),
  icon: "🏆",
  title: "",
  sub: "",
};

export default function AchievementsEditor({ data, onSave }) {
  const { confirm, Dialog } = useConfirm();
  const [achievements, setAchievements] = useState(
    Array.isArray(data.achievements) ? data.achievements : []
  );
  const [saving, setSaving] = useState(false);

  const upd = (id, field, val) =>
    setAchievements((p) => p.map((x) => (x.id === id || x._id === id ? { ...x, [field]: val } : x)));
  const add = () =>
    setAchievements((p) => [...p, { ...BLANK_ACHIEVEMENT, id: Date.now() }]);
  const moveUp = (i) => {
    if (i === 0) return;
    const a = [...achievements];
    [a[i - 1], a[i]] = [a[i], a[i - 1]];
    setAchievements(a);
  };
  const moveDown = (i) => {
    if (i === achievements.length - 1) return;
    const a = [...achievements];
    [a[i], a[i + 1]] = [a[i + 1], a[i]];
    setAchievements(a);
  };

  const del = async (id) => {
    const ok = await confirm("Delete this achievement? This cannot be undone.");
    if (!ok) return;
    setAchievements((p) => p.filter((x) => x.id !== id && x._id !== id));
  };

  const save = async () => {
    setSaving(true);
    try {
      await onSave("achievements", achievements);
      toast.success("Achievements saved!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed");
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
          Achievements
        </h2>
        <button onClick={add} className="btn btn-yellow btn-sm">
          <Plus size={14} /> Add Category
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
        {achievements.map((a, i) => {
          const keyId = a.id || a._id;
          return (
            <Card key={keyId}>
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
                    {a.title || "New Achievement"}
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
                  <DelBtn onClick={() => del(keyId)} />
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "80px 1fr 1fr",
                  gap: 14,
                  marginBottom: 14,
                }}
              >
                <div>
                  <FL>
                    Icon
                  </FL>
                  <input
                    value={a.icon || ""}
                    onChange={(e) => upd(keyId, "icon", e.target.value)}
                    className="field"
                    placeholder="🏆"
                    maxLength={10}
                    style={{ textAlign: 'center' }}
                  />
                </div>
                <div>
                  <FL>
                    Title <CharCount val={(a.title || "").length} max={100} />
                  </FL>
                  <input
                    value={a.title || ""}
                    onChange={(e) => upd(keyId, "title", e.target.value)}
                    className="field"
                    placeholder="e.g. Codeathon Hackathon"
                    maxLength={100}
                  />
                </div>
                <div>
                  <FL>
                    Subtitle / Date <CharCount val={(a.sub || "").length} max={100} />
                  </FL>
                  <input
                    value={a.sub || ""}
                    onChange={(e) => upd(keyId, "sub", e.target.value)}
                    className="field"
                    placeholder="e.g. MIT-WPU · Apr 2024"
                    maxLength={100}
                  />
                </div>
              </div>
              <div>
                <FL>
                  Link / URL (Optional) <CharCount val={(a.link || "").length} max={300} />
                </FL>
                <input
                  value={a.link || ""}
                  onChange={(e) => upd(keyId, "link", e.target.value)}
                  className="field"
                  placeholder="https://... (e.g., Certificate Link)"
                  maxLength={300}
                />
              </div>
            </Card>
          );
        })}
        {achievements.length === 0 && (
          <div
            style={{
              padding: 40,
              textAlign: "center",
              border: "2px dashed var(--ink)",
              borderRadius: 14,
              color: "var(--muted)",
            }}
          >
            No achievements added yet.
          </div>
        )}
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
    </div>
  );
}
