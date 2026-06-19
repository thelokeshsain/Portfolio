import React from 'react'
import { ExternalLink } from 'lucide-react'
import { Card } from './AdminHelpers'

export default function Overview({ data }) {
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
  ]

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
  )
}
