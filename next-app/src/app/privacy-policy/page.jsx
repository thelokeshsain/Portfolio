import Link from "next/link";
import { 
  ShieldCheck, 
  ArrowLeft, 
  Lock, 
  Database, 
  Smartphone, 
  Trash2, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  Mail, 
  Scale,
  RefreshCw,
  FileText
} from "lucide-react";

export const metadata = {
  title: "Privacy Policy & Disclosures | Smart Udhaar",
  description: "Official Privacy Policy, Data Safety, and Financial Regulatory Disclosures for Smart Udhaar - 100% Offline Personal Ledger & Debt Manager by Lokesh Sain.",
  alternates: {
    canonical: "/privacy-policy",
  },
};

export default function PrivacyPolicyPage() {
  const lastUpdated = "August 2026";

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-primary, #08080a)", color: "var(--text-primary, #fcfcfc)", paddingBottom: "80px" }}>
      {/* Top Navigation Bar */}
      <header style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        backgroundColor: "rgba(8, 8, 10, 0.85)",
        borderBottom: "1px solid var(--border, rgba(255, 255, 255, 0.08))",
        padding: "16px clamp(20px, 5vw, 80px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}>
        <Link 
          href="/" 
          style={{ 
            display: "inline-flex", 
            alignItems: "center", 
            gap: "8px", 
            color: "var(--text-secondary, #a3a3ac)", 
            textDecoration: "none",
            fontSize: "14px",
            fontWeight: 500,
            transition: "color 0.2s ease"
          }}
        >
          <ArrowLeft size={16} />
          Back to Portfolio
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ 
            display: "inline-flex", 
            alignItems: "center", 
            gap: "6px", 
            padding: "4px 12px", 
            borderRadius: "9999px", 
            backgroundColor: "rgba(52, 199, 89, 0.12)", 
            color: "#34c759", 
            fontSize: "12px", 
            fontWeight: 600,
            border: "1px solid rgba(52, 199, 89, 0.25)"
          }}>
            <CheckCircle2 size={13} />
            Verified Clean App
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: "880px", margin: "0 auto", padding: "40px 20px 0" }}>
        
        {/* Title Header */}
        <div style={{ marginBottom: "36px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 14px", borderRadius: "8px", backgroundColor: "rgba(255, 107, 0, 0.12)", border: "1px solid rgba(255, 107, 0, 0.25)", color: "var(--accent, #ff6b00)", fontSize: "13px", fontWeight: 700, marginBottom: "14px" }}>
            <ShieldCheck size={16} />
            LEGAL & PRIVACY DISCLOSURES
          </div>
          <h1 style={{ 
            fontFamily: "var(--font-display, inherit)", 
            fontSize: "clamp(28px, 4vw, 42px)", 
            fontWeight: 800, 
            letterSpacing: "-0.02em", 
            lineHeight: 1.2,
            marginBottom: "12px"
          }}>
            Privacy Policy for <span style={{ background: "linear-gradient(135deg, #ff6b00, #ff9e00)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Smart Udhaar</span>
          </h1>
          <p style={{ color: "var(--text-secondary, #a3a3ac)", fontSize: "15px", lineHeight: 1.6 }}>
            Last Reviewed & Updated: <strong>{lastUpdated}</strong> • In full compliance with Google Play Protect Developer Guidelines, Android Security Standards, and Personal Financial Safety Policies.
          </p>
        </div>

        {/* Quick App Identity Snapshot Card */}
        <div style={{
          backgroundColor: "var(--bg-secondary, #111216)",
          border: "1px solid var(--border, rgba(255, 255, 255, 0.08))",
          borderRadius: "16px",
          padding: "24px",
          marginBottom: "36px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "20px"
        }}>
          <div>
            <div style={{ fontSize: "12px", color: "var(--text-muted, #6e6e78)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Application Name</div>
            <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary, #fcfcfc)" }}>Smart Udhaar</div>
          </div>
          <div>
            <div style={{ fontSize: "12px", color: "var(--text-muted, #6e6e78)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Package Identifier</div>
            <div style={{ fontSize: "14px", fontFamily: "var(--font-mono, monospace)", color: "var(--accent, #ff6b00)" }}>com.smartudhaar.personalmanager</div>
          </div>
          <div>
            <div style={{ fontSize: "12px", color: "var(--text-muted, #6e6e78)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Lead Developer</div>
            <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary, #fcfcfc)" }}>Lokesh Sain</div>
          </div>
          <div>
            <div style={{ fontSize: "12px", color: "var(--text-muted, #6e6e78)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Architecture</div>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "#34c759" }}>100% Offline SQLite (Zero Cloud)</div>
          </div>
        </div>

        {/* Policy Content Sections */}
        <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>

          {/* Section 1: Non-Lending & Personal Loans Disclaimer */}
          <section style={{
            backgroundColor: "rgba(255, 107, 0, 0.04)",
            border: "1px solid rgba(255, 107, 0, 0.3)",
            borderRadius: "16px",
            padding: "24px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "rgba(255, 107, 0, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent, #ff6b00)" }}>
                <Scale size={20} />
              </div>
              <h2 style={{ fontSize: "18px", fontWeight: 700, margin: 0 }}>1. Non-Lending & Financial Regulatory Disclaimer</h2>
            </div>
            <p style={{ color: "var(--text-secondary, #a3a3ac)", fontSize: "14px", lineHeight: 1.7, marginBottom: "12px" }}>
              <strong>Smart Udhaar is NOT a lending application, loan provider, bank, or Non-Banking Financial Company (NBFC).</strong>
            </p>
            <ul style={{ paddingLeft: "20px", color: "var(--text-secondary, #a3a3ac)", fontSize: "14px", lineHeight: 1.7, display: "flex", flexDirection: "column", gap: "8px" }}>
              <li><strong>Zero Credit / Loan Issuance:</strong> Smart Udhaar does not disburse, facilitate, arrange, or offer loans, micro-loans, payday advances, or credit facilities.</li>
              <li><strong>Utility Ledger Only:</strong> The application functions strictly as a personal digital notebook and calculation ledger for individuals to manually keep track of informal reciprocal borrowings, IOUs, and personal credits between friends or acquaintances.</li>
              <li><strong>Zero Intermediation or Custody:</strong> Smart Udhaar never holds, transmits, brokers, or escrows any money.</li>
            </ul>
          </section>

          {/* Section 2: 100% On-Device Storage & Zero Cloud Transmission */}
          <section style={{
            backgroundColor: "var(--bg-secondary, #111216)",
            border: "1px solid var(--border, rgba(255, 255, 255, 0.08))",
            borderRadius: "16px",
            padding: "24px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "rgba(52, 199, 89, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#34c759" }}>
                <Database size={20} />
              </div>
              <h2 style={{ fontSize: "18px", fontWeight: 700, margin: 0 }}>2. Zero Cloud Data Collection & 100% Local Storage</h2>
            </div>
            <p style={{ color: "var(--text-secondary, #a3a3ac)", fontSize: "14px", lineHeight: 1.7, marginBottom: "12px" }}>
              We adhere to an absolute <strong>Zero-Knowledge & Zero-Cloud</strong> design philosophy:
            </p>
            <ul style={{ paddingLeft: "20px", color: "var(--text-secondary, #a3a3ac)", fontSize: "14px", lineHeight: 1.7, display: "flex", flexDirection: "column", gap: "8px" }}>
              <li><strong>Local SQLite Database:</strong> 100% of your entries—including contact labels, transaction notes, loan amounts, and payment dates—are saved solely inside your phone&apos;s isolated application sandbox using SQLite.</li>
              <li><strong>No Remote Servers:</strong> We do not operate external database servers, API analytics, or cloud sync backends. Your financial data never leaves your physical device.</li>
              <li><strong>Zero Advertising SDKs:</strong> No third-party ad networks, tracking pixels, or telemetry beacons are embedded in the app binary.</li>
            </ul>
          </section>

          {/* Section 3: Android Device Permissions Policy */}
          <section style={{
            backgroundColor: "var(--bg-secondary, #111216)",
            border: "1px solid var(--border, rgba(255, 255, 255, 0.08))",
            borderRadius: "16px",
            padding: "24px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "rgba(139, 92, 246, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#8b5cf6" }}>
                <Lock size={20} />
              </div>
              <h2 style={{ fontSize: "18px", fontWeight: 700, margin: 0 }}>3. Device Permissions & Prohibited Access Audit</h2>
            </div>
            <p style={{ color: "var(--text-secondary, #a3a3ac)", fontSize: "14px", lineHeight: 1.7, marginBottom: "14px" }}>
              In strict adherence to Google Play Store High-Risk Permission Policies, Smart Udhaar does NOT request intrusive device access:
            </p>
            
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", color: "var(--text-secondary, #a3a3ac)" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border, rgba(255, 255, 255, 0.08))", textAlign: "left" }}>
                    <th style={{ padding: "10px 12px", color: "var(--text-primary, #fcfcfc)" }}>Permission</th>
                    <th style={{ padding: "10px 12px", color: "var(--text-primary, #fcfcfc)" }}>Status</th>
                    <th style={{ padding: "10px 12px", color: "var(--text-primary, #fcfcfc)" }}>Explanation</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: "1px solid var(--border, rgba(255, 255, 255, 0.04))" }}>
                    <td style={{ padding: "10px 12px", fontFamily: "var(--font-mono, monospace)" }}>READ_SMS / RECEIVE_SMS</td>
                    <td style={{ padding: "10px 12px", color: "#34c759", fontWeight: 600 }}>BLOCKED (Never Requested)</td>
                    <td style={{ padding: "10px 12px" }}>No SMS scraping or reading.</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid var(--border, rgba(255, 255, 255, 0.04))" }}>
                    <td style={{ padding: "10px 12px", fontFamily: "var(--font-mono, monospace)" }}>READ_CONTACTS</td>
                    <td style={{ padding: "10px 12px", color: "#34c759", fontWeight: 600 }}>BLOCKED (Never Requested)</td>
                    <td style={{ padding: "10px 12px" }}>User enters names manually.</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid var(--border, rgba(255, 255, 255, 0.04))" }}>
                    <td style={{ padding: "10px 12px", fontFamily: "var(--font-mono, monospace)" }}>ACCESS_FINE_LOCATION</td>
                    <td style={{ padding: "10px 12px", color: "#34c759", fontWeight: 600 }}>BLOCKED (Never Requested)</td>
                    <td style={{ padding: "10px 12px" }}>Zero geographical tracking.</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid var(--border, rgba(255, 255, 255, 0.04))" }}>
                    <td style={{ padding: "10px 12px", fontFamily: "var(--font-mono, monospace)" }}>CAMERA / MICROPHONE</td>
                    <td style={{ padding: "10px 12px", color: "#34c759", fontWeight: 600 }}>BLOCKED (Never Requested)</td>
                    <td style={{ padding: "10px 12px" }}>No media recording hardware used.</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "10px 12px", fontFamily: "var(--font-mono, monospace)" }}>USE_BIOMETRIC</td>
                    <td style={{ padding: "10px 12px", color: "#ff9500", fontWeight: 600 }}>Optional Local Only</td>
                    <td style={{ padding: "10px 12px" }}>Android BiometricPrompt API for optional app lock. Biometric keys never leave hardware chip.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 4: User Data Control & Deletion */}
          <section style={{
            backgroundColor: "var(--bg-secondary, #111216)",
            border: "1px solid var(--border, rgba(255, 255, 255, 0.08))",
            borderRadius: "16px",
            padding: "24px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "rgba(239, 68, 68, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ef4444" }}>
                <Trash2 size={20} />
              </div>
              <h2 style={{ fontSize: "18px", fontWeight: 700, margin: 0 }}>4. User Data Sovereignty & 1-Tap Permanent Deletion</h2>
            </div>
            <p style={{ color: "var(--text-secondary, #a3a3ac)", fontSize: "14px", lineHeight: 1.7, marginBottom: "12px" }}>
              Because data is stored only on your phone, you have 100% control over its retention:
            </p>
            <ul style={{ paddingLeft: "20px", color: "var(--text-secondary, #a3a3ac)", fontSize: "14px", lineHeight: 1.7, display: "flex", flexDirection: "column", gap: "8px" }}>
              <li><strong>In-App Immediate Wipe:</strong> You can purge all app records and reset settings anytime via <em>Settings → Delete All App Data & Reset</em>.</li>
              <li><strong>Uninstall Purge:</strong> Deleting or uninstalling the app from your Android operating system instantly deletes the local database file permanently.</li>
              <li><strong>Encrypted Local Backup:</strong> You may generate and export your own JSON or CSV backup to your device storage whenever you wish.</li>
            </ul>
          </section>

          {/* Section 5: Peer-to-Peer UPI Payment Link Disclosures */}
          <section style={{
            backgroundColor: "var(--bg-secondary, #111216)",
            border: "1px solid var(--border, rgba(255, 255, 255, 0.08))",
            borderRadius: "16px",
            padding: "24px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "rgba(255, 149, 0, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ff9500" }}>
                <Smartphone size={20} />
              </div>
              <h2 style={{ fontSize: "18px", fontWeight: 700, margin: 0 }}>5. UPI Intent Links Disclosures</h2>
            </div>
            <p style={{ color: "var(--text-secondary, #a3a3ac)", fontSize: "14px", lineHeight: 1.7 }}>
              Smart Udhaar allows users to trigger standard NPCI UPI intent URIs (<code style={{ fontFamily: "var(--font-mono, monospace)", color: "var(--accent, #ff6b00)" }}>upi://pay</code>) to initiate direct, peer-to-peer settlement via user-installed UPI apps (such as PhonePe, Google Pay, or Paytm). Smart Udhaar does not process payments, does not store UPI PINs, does not have access to your bank balance, and acts strictly as a deep-link trigger.
            </p>
          </section>

          {/* Section 6: Developer Governance & Contact */}
          <section style={{
            backgroundColor: "var(--bg-secondary, #111216)",
            border: "1px solid var(--border, rgba(255, 255, 255, 0.08))",
            borderRadius: "16px",
            padding: "24px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "rgba(255, 107, 0, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent, #ff6b00)" }}>
                <Mail size={20} />
              </div>
              <h2 style={{ fontSize: "18px", fontWeight: 700, margin: 0 }}>6. Developer Contact & Security Inquiries</h2>
            </div>
            <p style={{ color: "var(--text-secondary, #a3a3ac)", fontSize: "14px", lineHeight: 1.7, marginBottom: "16px" }}>
              If you have any questions, verification inquiries, or feedback regarding Smart Udhaar&apos;s privacy policies and code safety, feel free to contact the lead engineer directly:
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "14px" }}>
              <div>
                <span style={{ color: "var(--text-muted, #6e6e78)" }}>Developer:</span>{" "}
                <strong style={{ color: "var(--text-primary, #fcfcfc)" }}>Lokesh Sain</strong>
              </div>
              <div>
                <span style={{ color: "var(--text-muted, #6e6e78)" }}>Location:</span>{" "}
                <span style={{ color: "var(--text-primary, #fcfcfc)" }}>Jaipur, Rajasthan, India</span>
              </div>
              <div>
                <span style={{ color: "var(--text-muted, #6e6e78)" }}>Official Portfolio:</span>{" "}
                <Link href="https://lokeshsain.vercel.app" style={{ color: "var(--accent, #ff6b00)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                  https://lokeshsain.vercel.app <ExternalLink size={13} />
                </Link>
              </div>
            </div>
          </section>

        </div>

        {/* Footer note */}
        <div style={{ marginTop: "40px", textAlign: "center", fontSize: "13px", color: "var(--text-muted, #6e6e78)", fontFamily: "var(--font-mono, monospace)" }}>
          © {new Date().getFullYear()} Lokesh Sain • Smart Udhaar Privacy Policy • All Rights Reserved.
        </div>
      </main>
    </div>
  );
}
