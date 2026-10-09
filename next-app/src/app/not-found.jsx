import Link from "next/link";
import { ArrowLeft, Home, Compass, BookOpen, Mail, ShieldAlert } from "lucide-react";

export const metadata = {
  title: "404: Page Not Found | Lokesh Sain",
  description: "The page you are looking for does not exist or may have been moved. Return to the portfolio or explore perspectives.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#05070A",
        color: "#F0F2F5",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "0",
        fontFamily: "var(--font-body, system-ui, -apple-system, sans-serif)",
        position: "relative",
        overflowX: "hidden",
      }}
    >
      {/* Background Decorative Mesh Glow */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "-15%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "min(800px, 100vw)",
          height: "450px",
          background: "radial-gradient(ellipse 60% 50% at 50% 30%, rgba(79, 124, 255, 0.12) 0%, rgba(56, 189, 248, 0.05) 50%, transparent 80%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Top Navigation Bar */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          backgroundColor: "rgba(5, 7, 10, 0.8)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
          padding: "16px clamp(16px, 5vw, 48px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            color: "#94A3B8",
            textDecoration: "none",
            fontSize: "14px",
            fontWeight: 500,
            transition: "color 0.2s ease",
          }}
          className="hover:text-white"
        >
          <ArrowLeft size={16} />
          <span>Back to Portfolio</span>
        </Link>

        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "4px 12px",
            borderRadius: "9999px",
            backgroundColor: "rgba(248, 113, 113, 0.1)",
            color: "#F87171",
            fontSize: "12px",
            fontWeight: 600,
            border: "1px solid rgba(248, 113, 113, 0.25)",
            fontFamily: "var(--font-mono, monospace)",
          }}
        >
          <ShieldAlert size={13} />
          HTTP 404
        </span>
      </header>

      {/* Main Content Card */}
      <main
        style={{
          flex: "1 0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px clamp(16px, 4vw, 32px)",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            maxWidth: "640px",
            width: "100%",
            textAlign: "center",
            backgroundColor: "#0B0F17",
            border: "1px solid #1E2638",
            borderRadius: "20px",
            padding: "clamp(32px, 6vw, 48px) clamp(20px, 5vw, 40px)",
            boxShadow: "0 12px 40px rgba(0, 0, 0, 0.6)",
          }}
        >
          {/* Subtle Accent Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "4px 14px",
              borderRadius: "9999px",
              backgroundColor: "rgba(56, 189, 248, 0.1)",
              border: "1px solid rgba(56, 189, 248, 0.25)",
              color: "#38BDF8",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: "20px",
              fontFamily: "var(--font-mono, monospace)",
            }}
          >
            Route Not Located
          </div>

          {/* Prominent 404 Display */}
          <h1
            style={{
              fontSize: "clamp(64px, 14vw, 108px)",
              fontWeight: 900,
              lineHeight: 1,
              letterSpacing: "-0.04em",
              margin: "0 0 16px",
              background: "linear-gradient(135deg, #F0F2F5 30%, #4F7CFF 70%, #38BDF8 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontFamily: "var(--font-display, inherit)",
            }}
          >
            404
          </h1>

          <h2
            style={{
              fontSize: "clamp(20px, 3.5vw, 26px)",
              fontWeight: 700,
              color: "#F0F2F5",
              margin: "0 0 12px",
              letterSpacing: "-0.01em",
            }}
          >
            This page could not be found
          </h2>

          <p
            style={{
              color: "#94A3B8",
              fontSize: "clamp(14px, 2vw, 15px)",
              lineHeight: 1.6,
              maxWidth: "480px",
              margin: "0 auto 32px",
            }}
          >
            The link you followed may be outdated, mistyped, or the resource may have moved. Use the options below to navigate back to active sections.
          </p>

          {/* Action Buttons Grid */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              maxWidth: "420px",
              margin: "0 auto 28px",
            }}
          >
            {/* Primary Action: Home */}
            <Link
              href="/"
              id="not-found-home-btn"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                padding: "12px 24px",
                borderRadius: "10px",
                backgroundColor: "#4F7CFF",
                color: "#FFFFFF",
                textDecoration: "none",
                fontSize: "14px",
                fontWeight: 600,
                transition: "all 0.2s ease",
                boxShadow: "0 4px 16px rgba(79, 124, 255, 0.25)",
              }}
            >
              <Home size={16} />
              <span>Back to Home</span>
            </Link>

            {/* Secondary Actions in 2-column on wider screens */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "10px",
              }}
            >
              <Link
                href="/#projects"
                id="not-found-projects-btn"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  padding: "10px 18px",
                  borderRadius: "10px",
                  backgroundColor: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  color: "#F0F2F5",
                  textDecoration: "none",
                  fontSize: "13px",
                  fontWeight: 500,
                  transition: "background 0.2s ease, border-color 0.2s ease",
                }}
              >
                <Compass size={15} style={{ color: "#38BDF8" }} />
                <span>Explore Projects</span>
              </Link>

              <Link
                href="/blog"
                id="not-found-blog-btn"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  padding: "10px 18px",
                  borderRadius: "10px",
                  backgroundColor: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  color: "#F0F2F5",
                  textDecoration: "none",
                  fontSize: "13px",
                  fontWeight: 500,
                  transition: "background 0.2s ease, border-color 0.2s ease",
                }}
              >
                <BookOpen size={15} style={{ color: "#34D399" }} />
                <span>Read Perspectives</span>
              </Link>
            </div>
          </div>

          {/* Useful Contact & Policy Footer in card */}
          <div
            style={{
              paddingTop: "20px",
              borderTop: "1px solid #1E2638",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "20px",
              fontSize: "12px",
              color: "#64748B",
              flexWrap: "wrap",
            }}
          >
            <Link
              href="/#contact"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                color: "#94A3B8",
                textDecoration: "none",
              }}
            >
              <Mail size={12} />
              <span>Contact Lokesh</span>
            </Link>
            <span>•</span>
            <Link
              href="/privacy-policy"
              style={{
                color: "#94A3B8",
                textDecoration: "none",
              }}
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </main>

      {/* Global Page Footer */}
      <footer
        style={{
          flexShrink: 0,
          textAlign: "center",
          padding: "20px 16px",
          borderTop: "1px solid rgba(255, 255, 255, 0.04)",
          fontSize: "12px",
          color: "#64748B",
          fontFamily: "var(--font-mono, monospace)",
        }}
      >
        Lokesh Sain • Software Engineer Portfolio • Jaipur, India
      </footer>
    </div>
  );
}
