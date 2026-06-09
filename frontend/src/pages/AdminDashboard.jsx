// AdminDashboard — The primary control center for portfolio content management.
// Securely handles CRUD operations for hero, projects, and contact inquiries by compiling modular panels.
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
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
  KeyRound,
  MessageSquare,
  Trophy,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import { useTheme } from "../context/ThemeContext";

// Modular Panel Imports
import Overview from "../components/admin/Overview";
import HeroEditor from "../components/admin/HeroEditor";
import ProjectsEditor from "../components/admin/ProjectsEditor";
import AchievementsEditor from "../components/admin/AchievementsEditor";
import SkillsEditor from "../components/admin/SkillsEditor";
import ExperienceEditor from "../components/admin/ExperienceEditor";
import SectionsEditor from "../components/admin/SectionsEditor";
import SecurityEditor from "../components/admin/SecurityEditor";
import ContactsViewer from "../components/admin/ContactsViewer";

/* ── NAV ITEMS CONFIGURATION ── */
const NAV_ITEMS = [
  { key: "overview", label: "Overview", Icon: LayoutDashboard },
  { key: "hero", label: "Hero & Info", Icon: User },
  { key: "projects", label: "Projects", Icon: FolderOpen },
  { key: "achievements", label: "Achievements & Certs", Icon: Trophy },
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
      case "achievements":
        return <AchievementsEditor {...props} />;
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

  const renderSidebarInner = () => (
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
              padding: "0 5px 1px",
              border: "2px solid var(--ink)",
              borderRadius: 4,
              marginLeft: 2,
              color: "#000",
              fontSize: 14,
              background: "var(--yellow)",
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
        {NAV_ITEMS.map(({ key, label, Icon }) => {
          const NavIcon = Icon;
          return (
            <button
              key={key}
              onClick={() => {
                setActive(key);
                setSidebar(false);
              }}
              className={`anav-btn${active === key ? " active" : ""}`}
            >
              <NavIcon size={15} />
              {label}
            </button>
          );
        })}
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
        {renderSidebarInner()}
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
            {renderSidebarInner()}
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
