"use client";
/**
 * AdminDashboard — Midnight Blueprint Control Center
 * Professional dark dashboard UI for portfolio content management.
 * Strict design consistency with #05070A canvas, #0B0F17 sidebar, and #38BDF8 accent.
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Toaster } from "react-hot-toast";
import {
  LayoutDashboard,
  User,
  FolderOpen,
  Wrench,
  Briefcase,
  Eye,
  LogOut,
  Menu,
  X,
  KeyRound,
  MessageSquare,
  Trophy,
  BookOpen,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";

// Modular Panel Imports
import Overview from "./Overview";
import BlogEditor from "./BlogEditor";
import HeroEditor from "./HeroEditor";
import ProjectsEditor from "./ProjectsEditor";
import AchievementsEditor from "./AchievementsEditor";
import SkillsEditor from "./SkillsEditor";
import ExperienceEditor from "./ExperienceEditor";
import SectionsEditor from "./SectionsEditor";
import SecurityEditor from "./SecurityEditor";
import ContactsViewer from "./ContactsViewer";

/* ── NAV ITEMS CONFIGURATION ── */
const NAV_ITEMS = [
  { key: "overview", label: "Dashboard", Icon: LayoutDashboard },
  { key: "blog", label: "Perspectives Blog", Icon: BookOpen },
  { key: "hero", label: "Hero & Bio", Icon: User },
  { key: "projects", label: "Projects", Icon: FolderOpen },
  { key: "experience", label: "Experience", Icon: Briefcase },
  { key: "skills", label: "Skills", Icon: Wrench },
  { key: "achievements", label: "Achievements", Icon: Trophy },
  { key: "sections", label: "Section Visibility", Icon: Eye },
  { key: "messages", label: "Inquiries", Icon: MessageSquare },
  { key: "security", label: "Security & Keys", Icon: KeyRound },
];

export default function AdminDashboard() {
  const { admin, loading, logout } = useAuth();
  const { data, updateSection } = useData();
  const nav = useRouter();
  const [active, setActive] = useState("overview");
  const [sidebarOpen, setSidebar] = useState(false);

  useEffect(() => {
    if (!loading && !admin) {
      nav.push("/admin/login");
    }
  }, [admin, loading, nav]);

  const doLogout = async () => {
    await logout();
    nav.push("/admin/login");
  };

  if (loading || !admin) return null;

  const renderPanel = () => {
    const props = { data, onSave: updateSection };
    switch (active) {
      case "overview":
        return <Overview {...props} />;
      case "blog":
        return <BlogEditor />;
      case "hero":
        return <HeroEditor {...props} />;
      case "projects":
        return <ProjectsEditor {...props} />;
      case "experience":
        return <ExperienceEditor {...props} />;
      case "skills":
        return <SkillsEditor {...props} />;
      case "achievements":
        return <AchievementsEditor {...props} />;
      case "sections":
        return <SectionsEditor {...props} />;
      case "messages":
        return <ContactsViewer />;
      case "security":
        return <SecurityEditor />;
      default:
        return <Overview {...props} />;
    }
  };

  const renderSidebarInner = () => (
    <>
      <div
        style={{
          padding: "24px 20px 18px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "#0F141D",
                border: "1px solid rgba(56, 189, 248, 0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                fontWeight: 900,
                color: "#38BDF8",
                fontFamily: "var(--font-mono, monospace)",
                boxShadow: "0 0 12px rgba(56, 189, 248, 0.15)",
              }}
            >
              LS
            </div>
            <div>
              <div
                style={{
                  fontWeight: 800,
                  fontSize: 14,
                  letterSpacing: "-0.02em",
                  color: "#F0F2F5",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                Lokesh Sain
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    color: "#38BDF8",
                    background: "rgba(56, 189, 248, 0.1)",
                    border: "1px solid rgba(56, 189, 248, 0.25)",
                    padding: "1px 5px",
                    borderRadius: 4,
                  }}
                >
                  CONSOLE
                </span>
              </div>
            </div>
          </div>
          {sidebarOpen && (
            <button
              onClick={() => setSidebar(false)}
              className="icon-btn"
              style={{ border: "none", padding: 4 }}
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          )}
        </div>
        <div
          style={{
            fontSize: 11,
            color: "#8B93A7",
            fontFamily: "var(--font-mono, monospace)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
          title={admin?.email}
        >
          {admin?.email}
        </div>
      </div>

      <nav style={{ flex: 1, padding: "16px 12px", overflowY: "auto" }}>
        {NAV_ITEMS.map(({ key, label, Icon }) => {
          const NavIcon = Icon;
          const isActive = active === key;
          return (
            <button
              key={key}
              onClick={() => {
                setActive(key);
                setSidebar(false);
              }}
              className={`anav-btn${isActive ? " active" : ""}`}
            >
              <NavIcon size={16} />
              <span>{label}</span>
            </button>
          );
        })}
      </nav>

      <div
        style={{
          padding: "14px 12px 20px",
          borderTop: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        <button
          onClick={doLogout}
          className="anav-btn"
          style={{
            color: "#EF4444",
            background: "transparent",
            borderColor: "transparent",
          }}
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </>
  );

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#05070A",
        fontFamily: "var(--font-body)",
        color: "#F0F2F5",
      }}
    >
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#0B0F17",
            color: "#F0F2F5",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "8px",
            fontFamily: "var(--font-body)",
            fontSize: "13px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.6)",
          },
        }}
      />

      {/* Desktop fixed sidebar */}
      <aside
        className="hide-mobile"
        style={{
          width: 240,
          background: "#0B0F17",
          borderRight: "1px solid rgba(255, 255, 255, 0.08)",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          position: "sticky",
          top: 0,
          height: "100vh",
          zIndex: 40,
        }}
      >
        {renderSidebarInner()}
      </aside>

      {/* Mobile drawer overlay */}
      {sidebarOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            display: "flex",
            background: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(6px)",
          }}
          onClick={() => setSidebar(false)}
        >
          <aside
            style={{
              width: 260,
              background: "#0B0F17",
              borderRight: "1px solid rgba(255, 255, 255, 0.1)",
              display: "flex",
              flexDirection: "column",
              height: "100vh",
              boxShadow: "4px 0 24px rgba(0,0,0,0.8)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {renderSidebarInner()}
          </aside>
          <div style={{ flex: 1 }} />
        </div>
      )}

      {/* Main Content Area */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          background: "#05070A",
        }}
      >
        {/* Mobile top bar */}
        <div
          className="show-mobile"
          style={{
            padding: "14px 18px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            background: "#0B0F17",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            zIndex: 30,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              className="icon-btn"
              onClick={() => setSidebar(true)}
              aria-label="Open navigation drawer"
            >
              <Menu size={18} />
            </button>
            <div style={{ fontWeight: 800, fontSize: 15, color: "#F0F2F5" }}>
              {NAV_ITEMS.find((n) => n.key === active)?.label || "Dashboard"}
            </div>
          </div>
          <div
            style={{
              fontSize: 10,
              fontFamily: "var(--font-mono, monospace)",
              fontWeight: 700,
              color: "#38BDF8",
              background: "rgba(56, 189, 248, 0.1)",
              padding: "2px 8px",
              borderRadius: 4,
              border: "1px solid rgba(56, 189, 248, 0.2)",
            }}
          >
            ADMIN
          </div>
        </div>

        <main
          style={{
            padding: "clamp(20px, 3.5vw, 40px)",
            flex: 1,
            overflowY: "auto",
            maxWidth: 1200,
            width: "100%",
            margin: "0 auto",
          }}
        >
          {renderPanel()}
        </main>
      </div>
    </div>
  );
}
