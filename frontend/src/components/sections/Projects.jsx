import { ExternalLink } from "lucide-react";
import useScrollFade from "../../hooks/useScrollFade";
import { useData } from "../../context/DataContext";

const GHIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
  </svg>
);

function ProjectCard({ p }) {
  // tags is always string[] after DataContext normalization
  const tags = Array.isArray(p.tags)
    ? p.tags.map((t) => (typeof t === "string" ? t : t?.label || ""))
    : [];
  const isGithubLink = p.link?.includes("github.com");

  return (
    <div className="proj">
      {/* ── Accent bar ── */}
      <div
        style={{
          height: 5,
          background: p.accentBg || "var(--yellow)",
          borderBottom: "2px solid var(--ink)",
        }}
      />

      {/* ── Mac titlebar ── */}
      <div className="mac-bar">
        <div className="mac-dot" style={{ background: "#ff5f57" }} />
        <div className="mac-dot" style={{ background: "#febc2e" }} />
        <div className="mac-dot" style={{ background: "#28c840" }} />
        <span className="mac-bar-title">{p.file || p.title}</span>
      </div>

      {/* ── Card content ── */}
      <div
        style={{
          padding: "clamp(18px,3vw,24px)",
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* ── Header row: category tag + period + logo ── */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 14,
            gap: 10,
          }}
        >
          {/* Left: category + period stacked */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 5,
              minWidth: 0,
            }}
          >
            <span
              className={`tag ${p.tagClass || "tag-y"}`}
              style={{ fontSize: 11, alignSelf: "flex-start" }}
            >
              {p.category || "Project"}
            </span>
            {p.period && (
              <span
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: 11,
                  color: "var(--subtle)",
                }}
              >
                {p.period}
              </span>
            )}
          </div>

          {/* Right: project logo — shown only when image is set */}
          {p.image && (
            <div
              style={{
                width: "clamp(44px, 8vw, 56px)",
                height: "clamp(44px, 8vw, 56px)",
                borderRadius: 10,
                border: "2px solid var(--ink)",
                background: p.accentBg || "var(--yellow)",
                overflow: "hidden",
                flexShrink: 0,
                boxShadow: "3px 3px 0 var(--ink)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img
                src={p.image}
                alt={`${p.title} logo`}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  padding: 5,
                }}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
          )}
        </div>

        {/* ── Title ── */}
        <h3
          style={{
            fontWeight: 900,
            fontSize: "clamp(17px,2.5vw,20px)",
            letterSpacing: "-0.03em",
            marginBottom: 10,
            lineHeight: 1.2,
          }}
        >
          {p.title}
        </h3>

        {/* ── Tags ── */}
        {tags.length > 0 && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 5,
              marginBottom: 12,
            }}
          >
            {tags.map((t, i) => (
              <span
                key={`${t}-${i}`}
                className="tag tag-cr"
                style={{ fontSize: 11 }}
              >
                {t}
              </span>
            ))}
          </div>
        )}

        {/* ── Description ── */}
        <p
          style={{
            fontSize: "clamp(13px,1.5vw,14px)",
            lineHeight: 1.75,
            color: "var(--muted)",
            flex: 1,
            marginBottom: 20,
          }}
        >
          {p.desc || p.description}
        </p>

        {/* ── Action buttons ── */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {p.link && (
            <a
              href={p.link}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-solid btn-sm"
            >
              {isGithubLink ? (
                <>
                  <GHIcon /> Source Code
                </>
              ) : (
                <>
                  <ExternalLink size={13} /> Live Demo
                </>
              )}
            </a>
          )}
          {p.github && p.github !== p.link && (
            <a
              href={p.github}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline btn-sm"
            >
              <GHIcon /> Source
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Projects() {
  const { data } = useData();
  const ref = useScrollFade();
  const projects = (data.projects || []).filter((p) => p.visible !== false);

  return (
    <section id="projects" className="section fade-up" ref={ref}>
      <div className="inner">
        <div className="label">Projects</div>
        <h2 className="h2" style={{ marginBottom: 48 }}>
          Things I've <span className="mark">shipped.</span>
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fill, minmax(min(100%, 320px), 1fr))",
            gap: 20,
          }}
        >
          {projects.map((p, i) => (
            <ProjectCard key={p.id || `proj-${i}`} p={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
