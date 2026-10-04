import React from 'react'
import { ExternalLink, Layers, CheckCircle2, Cpu, Briefcase } from 'lucide-react'
import { Card } from './AdminHelpers'

export default function Overview({ data }) {
  const counts = [
    {
      label: "Total Projects",
      val: data.projects?.length ?? 0,
      accent: "#38BDF8",
      Icon: Layers,
    },
    {
      label: "Published Projects",
      val: (data.projects ?? []).filter((p) => p.visible !== false).length,
      accent: "#10B981",
      Icon: CheckCircle2,
    },
    {
      label: "Registered Skills",
      val: Object.values(data.skills ?? {}).flat().length,
      accent: "#818CF8",
      Icon: Cpu,
    },
    {
      label: "Career Roles",
      val: data.experience?.length ?? 0,
      accent: "#38BDF8",
      Icon: Briefcase,
    },
  ]

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1
          style={{
            fontWeight: 800,
            fontSize: "clamp(22px, 3vw, 28px)",
            letterSpacing: "-0.03em",
            color: "#F0F2F5",
            marginBottom: 6,
          }}
        >
          System Overview
        </h1>
        <p style={{ color: "#8B93A7", fontSize: 13, fontFamily: "var(--font-mono, monospace)" }}>
          Portfolio database & content status
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16,
          marginBottom: 28,
        }}
      >
        {counts.map((s) => {
          const StatIcon = s.Icon;
          return (
            <div
              key={s.label}
              style={{
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: 12,
                padding: "20px 18px",
                background: "#0B0F17",
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.4)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 2,
                  background: s.accent,
                }}
              />
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 12,
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    fontFamily: "var(--font-mono, monospace)",
                    fontWeight: 600,
                    letterSpacing: ".08em",
                    textTransform: "uppercase",
                    color: "#8B93A7",
                  }}
                >
                  {s.label}
                </span>
                <StatIcon size={16} style={{ color: s.accent, opacity: 0.8 }} />
              </div>
              <div
                style={{
                  fontSize: 32,
                  fontWeight: 800,
                  letterSpacing: "-0.04em",
                  color: "#F0F2F5",
                  lineHeight: 1,
                }}
              >
                {s.val}
              </div>
            </div>
          );
        })}
      </div>

      <Card>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12, color: "#F0F2F5" }}>
          Quick Actions
        </div>
        <p style={{ color: "#8B93A7", fontSize: 13, marginBottom: 16, maxWidth: 540, lineHeight: 1.6 }}>
          Review the live client interface with current database entries and active section tracking.
        </p>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary btn-sm"
        >
          <ExternalLink size={13} /> View Live Portfolio
        </a>
      </Card>
    </div>
  )
}
