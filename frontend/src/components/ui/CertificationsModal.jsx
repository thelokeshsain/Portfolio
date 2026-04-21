import { X, ExternalLink } from "lucide-react";
import { useEffect } from "react";

export default function CertificationsModal({ isOpen, onClose, achievements }) {
  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(0, 0, 0, 0.5)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "clamp(16px, 3vw, 24px)",
        opacity: isOpen ? 1 : 0,
        pointerEvents: isOpen ? "auto" : "none",
        transition: "opacity 0.2s ease",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--cream, #FDFDF8)",
          width: "100%",
          maxWidth: 600,
          maxHeight: "85vh",
          borderRadius: "var(--r, 16px)",
          border: "var(--bw, 3px) solid var(--ink, #1F1F1F)",
          boxShadow: "var(--sh, 8px 8px 0px #1E1E1E)",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 24px",
            borderBottom: "var(--bw, 3px) solid var(--ink, #1F1F1F)",
            background: "var(--surface)",
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: 22,
              fontWeight: 900,
              letterSpacing: "-0.03em",
              color: "var(--ink)",
            }}
          >
            Achievements & Certifications
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "var(--yellow, #FDE68A)",
              border: "var(--bw, 3px) solid var(--ink, #1F1F1F)",
              borderRadius: "50%",
              width: 36,
              height: 36,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              padding: 0,
              boxShadow: "2px 2px 0 var(--ink)",
            }}
            aria-label="Close modal"
          >
            <X size={18} strokeWidth={3} />
          </button>
        </div>

        {/* Content Body */}
        <div
          style={{
            padding: "24px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {achievements && achievements.length > 0 ? (
            achievements.map((item) => (
              <div
                key={item.id || item._id}
                style={{
                  border: "2px solid var(--ink, #1F1F1F)",
                  borderRadius: 12,
                  padding: "18px 20px",
                  background: "var(--white, #FFFFFF)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-start",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      background: "var(--yellow)",
                      border: "2px solid var(--ink)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      fontSize: 18,
                    }}
                  >
                    {item.icon || "🏆"}
                  </div>
                  <div>
                    <div
                      style={{
                        fontWeight: 800,
                        fontSize: 16,
                        color: "var(--ink)",
                      }}
                    >
                      {item.title}
                    </div>
                    {item.sub && (
                      <div
                        style={{
                          fontSize: 14,
                          color: "var(--muted, #6B7280)",
                          fontFamily: "var(--mono)",
                          marginTop: 4,
                        }}
                      >
                        {item.sub}
                      </div>
                    )}
                  </div>
                </div>
                {item.link && (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline btn-sm"
                    style={{
                      alignSelf: "flex-start",
                      marginTop: 8,
                      width: "auto",
                    }}
                  >
                    View Credential <ExternalLink size={14} />
                  </a>
                )}
              </div>
            ))
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "40px 20px",
                color: "var(--muted)",
                fontSize: 15,
              }}
            >
              No achievements or certifications added yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
