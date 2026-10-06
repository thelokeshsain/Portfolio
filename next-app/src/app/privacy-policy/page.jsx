import Link from "next/link";
import { 
  ShieldCheck, 
  ArrowLeft, 
  Lock, 
  Database, 
  ExternalLink, 
  CheckCircle2, 
  Mail, 
  Globe,
  Cookie,
  UserCheck
} from "lucide-react";
import ConsentRevokeButton from "@/components/ads/ConsentRevokeButton";

export const metadata = {
  title: {
    absolute: "Privacy Policy | Lokesh Sain",
  },
  description: "Privacy Policy for the personal portfolio of Lokesh Sain. Explains how this website handles contact inquiries, technical request logs, security cookies, and Google AdSense advertising choices.",
  alternates: {
    canonical: "/privacy-policy",
  },
};

export default function PrivacyPolicyPage() {
  const lastUpdated = "October 2026";
  const effectiveDate = "October 2026";

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#05070A", color: "#F0F2F5", paddingBottom: "80px", overflowX: "hidden", overflowWrap: "break-word", wordBreak: "break-word" }}>
      {/* Top Sticky Navigation Bar */}
      <header style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        backgroundColor: "rgba(5, 7, 10, 0.85)",
        borderBottom: "1px solid #1E2638",
        padding: "16px clamp(16px, 5vw, 64px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        minWidth: 0,
        overflow: "hidden"
      }}>
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
            backgroundColor: "rgba(56, 189, 248, 0.1)", 
            color: "#38BDF8", 
            fontSize: "12px", 
            fontWeight: 600,
            border: "1px solid rgba(56, 189, 248, 0.25)"
          }}>
            <CheckCircle2 size={13} />
            Verified Portfolio Policy
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: "860px", margin: "0 auto", padding: "40px clamp(16px, 4vw, 24px) 0" }}>
        
        {/* Title Header */}
        <div style={{ marginBottom: "36px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 14px", borderRadius: "8px", backgroundColor: "rgba(56, 189, 248, 0.1)", border: "1px solid rgba(56, 189, 248, 0.25)", color: "#38BDF8", fontSize: "13px", fontWeight: 700, marginBottom: "14px" }}>
            <ShieldCheck size={16} />
            PRIVACY & DATA PRACTICES
          </div>
          <h1 style={{ 
            fontFamily: "var(--font-display, inherit)", 
            fontSize: "clamp(28px, 4vw, 40px)", 
            fontWeight: 800, 
            letterSpacing: "-0.02em", 
            lineHeight: 1.2,
            marginBottom: "8px",
            color: "#F0F2F5"
          }}>
            Privacy Policy
          </h1>
          <p style={{ fontSize: "18px", color: "#38BDF8", fontWeight: 500, marginBottom: "12px" }}>
            Lokesh Sain — Software Engineer Portfolio
          </p>
          <p style={{ color: "#94A3B8", fontSize: "14px", lineHeight: 1.6 }}>
            Effective Date: <strong>{effectiveDate}</strong> • Last Updated: <strong>{lastUpdated}</strong>
          </p>
        </div>

        {/* Identity Snapshot Card */}
        <div style={{
          backgroundColor: "#0B0F17",
          border: "1px solid #1E2638",
          borderRadius: "16px",
          padding: "24px",
          marginBottom: "36px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "20px"
        }}>
          <div>
            <div style={{ fontSize: "12px", color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Website</div>
            <div style={{ fontSize: "14px", fontFamily: "var(--font-mono, monospace)", color: "#38BDF8", wordBreak: "break-all" }}>https://lokeshsain.vercel.app</div>
          </div>
          <div>
            <div style={{ fontSize: "12px", color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Owner & Operator</div>
            <div style={{ fontSize: "15px", fontWeight: 700, color: "#F0F2F5" }}>Lokesh Sain</div>
          </div>
          <div>
            <div style={{ fontSize: "12px", color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Location</div>
            <div style={{ fontSize: "15px", fontWeight: 600, color: "#F0F2F5" }}>Jaipur, Rajasthan, India</div>
          </div>
          <div>
            <div style={{ fontSize: "12px", color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Primary Purpose</div>
            <div style={{ fontSize: "14px", fontWeight: 500, color: "#94A3B8" }}>Professional Engineering Portfolio</div>
          </div>
        </div>

        {/* Policy Content Sections */}
        <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>

          {/* Section 1: Overview */}
          <section style={{
            backgroundColor: "#0B0F17",
            border: "1px solid #1E2638",
            borderRadius: "16px",
            padding: "24px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "rgba(56, 189, 248, 0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#38BDF8" }}>
                <Globe size={20} />
              </div>
              <h2 style={{ fontSize: "18px", fontWeight: 700, margin: 0 }}>1. Overview & Scope</h2>
            </div>
            <p style={{ color: "#94A3B8", fontSize: "14px", lineHeight: 1.7, margin: 0 }}>
              This Privacy Policy explains how this website (<Link href="https://lokeshsain.vercel.app" style={{ color: "#38BDF8", textDecoration: "none" }}>https://lokeshsain.vercel.app</Link>), operated by Lokesh Sain (&quot;I&quot;, &quot;me&quot;, or &quot;operator&quot;), collects, uses, stores, and handles information when you visit or interact with this software engineering portfolio. I am committed to transparency, minimal data collection, and safeguarding your privacy.
            </p>
          </section>

          {/* Section 2: Information We Collect */}
          <section style={{
            backgroundColor: "#0B0F17",
            border: "1px solid #1E2638",
            borderRadius: "16px",
            padding: "24px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "rgba(56, 189, 248, 0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#38BDF8" }}>
                <Database size={20} />
              </div>
              <h2 style={{ fontSize: "18px", fontWeight: 700, margin: 0 }}>2. Information We Collect</h2>
            </div>
            <p style={{ color: "#94A3B8", fontSize: "14px", lineHeight: 1.7, marginBottom: "14px" }}>
              This website collects only the data necessary to provide portfolio content, respond to professional inquiries, and maintain site security:
            </p>
            
            <h3 style={{ fontSize: "15px", fontWeight: 600, color: "#F0F2F5", marginBottom: "8px" }}>A. Information You Voluntarily Provide</h3>
            <p style={{ color: "#94A3B8", fontSize: "14px", lineHeight: 1.7, marginBottom: "10px" }}>
              When you submit a message through the on-site contact form, the website collects:
            </p>
            <ul style={{ paddingLeft: "20px", color: "#94A3B8", fontSize: "14px", lineHeight: 1.7, display: "flex", flexDirection: "column", gap: "6px", marginBottom: "16px" }}>
              <li><strong>Name:</strong> Your provided full or professional name (maximum 100 characters).</li>
              <li><strong>Email Address:</strong> Your return email address (maximum 120 characters) so that I may respond to you.</li>
              <li><strong>Message:</strong> The inquiry or correspondence text you write (maximum 2,000 characters).</li>
            </ul>

            <h3 style={{ fontSize: "15px", fontWeight: 600, color: "#F0F2F5", marginBottom: "8px" }}>B. Information Collected Automatically for Security</h3>
            <p style={{ color: "#94A3B8", fontSize: "14px", lineHeight: 1.7, marginBottom: "10px" }}>
              When you interact with the contact form and API endpoints, the server records technical telemetry strictly for security and abuse prevention:
            </p>
            <ul style={{ paddingLeft: "20px", color: "#94A3B8", fontSize: "14px", lineHeight: 1.7, display: "flex", flexDirection: "column", gap: "6px" }}>
              <li><strong>IP Address:</strong> Used solely for rate limiting (limiting submissions to a maximum of 5 messages per 10 minutes) to protect against denial-of-service and automated spam.</li>
              <li><strong>Device & Browser Metadata:</strong> The standard HTTP <code style={{ fontFamily: "var(--font-mono, monospace)", color: "#38BDF8" }}>User-Agent</code> string indicating browser version and operating system.</li>
              <li><strong>Timestamps:</strong> Exact date and time of the submission.</li>
              <li><strong>Hosting Edge Logs:</strong> Transient server-side access logs processed by the hosting platform (Vercel) for standard routing and DDoS defense.</li>
            </ul>
          </section>

          {/* Section 3: Contact Form & Communications Data */}
          <section style={{
            backgroundColor: "#0B0F17",
            border: "1px solid #1E2638",
            borderRadius: "16px",
            padding: "24px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "rgba(56, 189, 248, 0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#38BDF8" }}>
                <Mail size={20} />
              </div>
              <h2 style={{ fontSize: "18px", fontWeight: 700, margin: 0 }}>3. How Contact Form Inquiries Are Processed</h2>
            </div>
            <p style={{ color: "#94A3B8", fontSize: "14px", lineHeight: 1.7, marginBottom: "12px" }}>
              Inquiries submitted through the contact form are:
            </p>
            <ul style={{ paddingLeft: "20px", color: "#94A3B8", fontSize: "14px", lineHeight: 1.7, display: "flex", flexDirection: "column", gap: "8px" }}>
              <li><strong>Direct Correspondence:</strong> Transmitted directly to Lokesh Sain via automated email dispatch (using Nodemailer / SMTP delivery) to allow direct response.</li>
              <li><strong>Database Backup:</strong> Stored securely in a MongoDB Atlas database accessible exclusively by authenticated administrator session to ensure messages are not lost due to mail delivery issues.</li>
              <li><strong>No Commercial Resale:</strong> Your contact information is never sold, leased, rented, or shared with third-party telemarketers or marketing lists.</li>
            </ul>
          </section>

          {/* Section 4: Cookies & Local Storage */}
          <section style={{
            backgroundColor: "#0B0F17",
            border: "1px solid #1E2638",
            borderRadius: "16px",
            padding: "24px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "rgba(56, 189, 248, 0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#38BDF8" }}>
                <Cookie size={20} />
              </div>
              <h2 style={{ fontSize: "18px", fontWeight: 700, margin: 0 }}>4. Cookies and Local Storage Technologies</h2>
            </div>
            <p style={{ color: "#94A3B8", fontSize: "14px", lineHeight: 1.7, marginBottom: "14px" }}>
              This website clearly delineates between first-party functional storage and third-party advertising technologies:
            </p>
            <ul style={{ paddingLeft: "20px", color: "#94A3B8", fontSize: "14px", lineHeight: 1.7, display: "flex", flexDirection: "column", gap: "8px", marginBottom: "14px" }}>
              <li><strong>First-Party Essential Security Cookies:</strong> The public portfolio does not set tracking cookies on general visitors. Cookies (<code style={{ fontFamily: "var(--font-mono, monospace)", color: "#38BDF8" }}>refreshToken</code> HTTP-only, and <code style={{ fontFamily: "var(--font-mono, monospace)", color: "#38BDF8" }}>csrfToken</code> with SameSite=Strict) are deployed exclusively for administrative dashboard authentication.</li>
              <li><strong>Local Storage:</strong> Utilized solely for non-sensitive client preferences, such as transient application caching and progressive web app (PWA) banner state. No personal tracking identifiers are saved to localStorage.</li>
              <li><strong>Advertising Cookies:</strong> When Google AdSense is active on the website, Google and third-party advertising partners place cookies or similar technologies to serve ads and prevent fraudulent traffic.</li>
            </ul>
          </section>

          {/* Section 5: Google AdSense and Advertising */}
          <section style={{
            backgroundColor: "#0B0F17",
            border: "1px solid #1E2638",
            borderRadius: "16px",
            padding: "24px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "rgba(56, 189, 248, 0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#38BDF8" }}>
                <ExternalLink size={20} />
              </div>
              <h2 style={{ fontSize: "18px", fontWeight: 700, margin: 0 }}>5. Google AdSense and Advertising Disclosures</h2>
            </div>
            <p style={{ color: "#94A3B8", fontSize: "14px", lineHeight: 1.7, marginBottom: "12px" }}>
              This website may display advertisements provided by Google AdSense and Google&apos;s certified advertising partners. In compliance with Google AdSense Required Content guidance:
            </p>
            <ul style={{ paddingLeft: "20px", color: "#94A3B8", fontSize: "14px", lineHeight: 1.7, display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
              <li><strong>Third-Party Vendors & Cookies:</strong> Third-party vendors, including Google, use cookies to serve ads based on a user&apos;s prior visits to this website or other websites across the Internet.</li>
              <li><strong>Advertising Personalization:</strong> Google&apos;s use of advertising cookies enables it and its partners to serve ads to users based on their visits to this site and/or other sites on the Internet.</li>
              <li><strong>Contextual vs. Personalized Delivery:</strong> Not all advertisements are personalized. In jurisdictions requiring prior consent, or where personalization has been opted out, non-personalized (contextual) advertisements may be served based on page content rather than user history.</li>
            </ul>
            <p style={{ color: "#94A3B8", fontSize: "14px", lineHeight: 1.7, marginBottom: "12px" }}>
              You have the right to manage or opt out of personalized advertising at any time through the official Google and industry portals:
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "8px" }}>
              <div>
                • <strong>Google Ads Settings:</strong> Manage personalized advertising preferences directly at{" "}
                <a 
                  href="https://adssettings.google.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: "#38BDF8", textDecoration: "none", fontWeight: 600, wordBreak: "break-all" }}
                >
                  https://adssettings.google.com/ <ExternalLink size={12} style={{ display: "inline", verticalAlign: "middle" }} />
                </a>
              </div>
              <div>
                • <strong>Digital Advertising Alliance (AboutAds):</strong> Opt out of third-party vendor cookies across multiple ad networks at{" "}
                <a 
                  href="https://www.aboutads.info/choices/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: "#38BDF8", textDecoration: "none", fontWeight: 600, wordBreak: "break-all" }}
                >
                  https://www.aboutads.info/choices/ <ExternalLink size={12} style={{ display: "inline", verticalAlign: "middle" }} />
                </a>
              </div>
            </div>
          </section>

          {/* Section 6: Google Consent Management (CMP) & Revocation */}
          <section style={{
            backgroundColor: "#0F141D",
            border: "1px solid rgba(56, 189, 248, 0.25)",
            borderRadius: "16px",
            padding: "24px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "rgba(56, 189, 248, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#38BDF8" }}>
                <UserCheck size={20} />
              </div>
              <h2 style={{ fontSize: "18px", fontWeight: 700, margin: 0, color: "#F0F2F5" }}>6. Consent Architecture & Regulatory Choices</h2>
            </div>
            <p style={{ color: "#94A3B8", fontSize: "14px", lineHeight: 1.7, marginBottom: "12px" }}>
              To ensure full compliance for international visitors, this site implements Google&apos;s Privacy &amp; Messaging Consent Management Platform (CMP):
            </p>
            <ul style={{ paddingLeft: "20px", color: "#94A3B8", fontSize: "14px", lineHeight: 1.7, display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
              <li><strong>EEA, UK, and Switzerland:</strong> Certified with the IAB Transparency and Consent Framework (TCF v2.2) as mandated by Google. Personalized advertising and advertising cookies are not served until appropriate consent is recorded.</li>
              <li><strong>US State Privacy Regulations:</strong> Supports statutory opt-out choices regarding the sale or sharing of personal data and targeted advertising where applicable.</li>
              <li><strong>Persistent Choice Revisit:</strong> You can revisit or revoke your consent preferences at any time using the control below or via the footer on this website.</li>
            </ul>
            <div style={{ marginTop: "16px" }}>
              <ConsentRevokeButton />
            </div>
          </section>

          {/* Section 7: User Rights */}
          <section style={{
            backgroundColor: "#0B0F17",
            border: "1px solid #1E2638",
            borderRadius: "16px",
            padding: "24px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "rgba(56, 189, 248, 0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#38BDF8" }}>
                <Lock size={20} />
              </div>
              <h2 style={{ fontSize: "18px", fontWeight: 700, margin: 0 }}>7. Your Privacy Rights</h2>
            </div>
            <p style={{ color: "#94A3B8", fontSize: "14px", lineHeight: 1.7, marginBottom: "12px" }}>
              This policy is intended to explain the privacy practices of this website. Depending on your location and applicable law (such as the EU/UK GDPR, California CCPA/CPRA, or India&apos;s Digital Personal Data Protection Act), you may have rights including:
            </p>
            <ul style={{ paddingLeft: "20px", color: "#94A3B8", fontSize: "14px", lineHeight: 1.7, display: "flex", flexDirection: "column", gap: "6px", marginBottom: "14px" }}>
              <li><strong>Access:</strong> The right to confirm whether I process your contact inquiry data.</li>
              <li><strong>Correction:</strong> The right to correct inaccurate or incomplete correspondence information.</li>
              <li><strong>Deletion / Erasure:</strong> The right to request the permanent deletion of contact inquiries you have sent.</li>
              <li><strong>Withdrawal of Consent:</strong> The right to withdraw consent for advertising cookies at any time via the consent manager.</li>
            </ul>
            <p style={{ color: "#94A3B8", fontSize: "14px", lineHeight: 1.7, margin: 0 }}>
              To exercise any of these rights regarding contact messages, please email <a href="mailto:iamlokeshsain@gmail.com" style={{ color: "#38BDF8", textDecoration: "none", fontWeight: 600 }}>iamlokeshsain@gmail.com</a>.
            </p>
          </section>

          {/* Section 8: Data Retention & Security */}
          <section style={{
            backgroundColor: "#0B0F17",
            border: "1px solid #1E2638",
            borderRadius: "16px",
            padding: "24px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "rgba(56, 189, 248, 0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#38BDF8" }}>
                <ShieldCheck size={20} />
              </div>
              <h2 style={{ fontSize: "18px", fontWeight: 700, margin: 0 }}>8. Data Retention & Security</h2>
            </div>
            <p style={{ color: "#94A3B8", fontSize: "14px", lineHeight: 1.7, marginBottom: "12px" }}>
              Contact form inquiries are retained in the database until they are reviewed and no longer required for ongoing professional dialogue, or until a deletion request is received.
            </p>
            <p style={{ color: "#94A3B8", fontSize: "14px", lineHeight: 1.7, margin: 0 }}>
              Security protections include HTTPS/TLS transmission encryption, secure HTTP-only cookies for admin access, API rate limiting to mitigate automated attacks, and input validation. While no digital platform can guarantee absolute immunity, reasonable administrative and technical safeguards are maintained to protect submitted communications.
            </p>
          </section>

          {/* Section 9: Third-Party Links */}
          <section style={{
            backgroundColor: "#0B0F17",
            border: "1px solid #1E2638",
            borderRadius: "16px",
            padding: "24px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "rgba(56, 189, 248, 0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#38BDF8" }}>
                <ExternalLink size={20} />
              </div>
              <h2 style={{ fontSize: "18px", fontWeight: 700, margin: 0 }}>9. Third-Party Links & Integrations</h2>
            </div>
            <p style={{ color: "#94A3B8", fontSize: "14px", lineHeight: 1.7, margin: 0 }}>
              This portfolio contains links to external websites, including GitHub, LinkedIn, and live project deployments. I am not responsible for the privacy practices, content, or data processing of those external sites. When visiting external links, you are subject to the respective third-party policies.
            </p>
          </section>

          {/* Section 10: Operator Contact Information */}
          <section style={{
            backgroundColor: "#0B0F17",
            border: "1px solid #1E2638",
            borderRadius: "16px",
            padding: "24px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "rgba(56, 189, 248, 0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#38BDF8" }}>
                <Mail size={20} />
              </div>
              <h2 style={{ fontSize: "18px", fontWeight: 700, margin: 0 }}>10. Contact Information</h2>
            </div>
            <p style={{ color: "#94A3B8", fontSize: "14px", lineHeight: 1.7, marginBottom: "16px" }}>
              For any privacy-related inquiries, data requests, or questions regarding this policy, contact:
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "14px" }}>
              <div>
                <span style={{ color: "#64748B" }}>Owner & Operator:</span>{" "}
                <strong style={{ color: "#F0F2F5" }}>Lokesh Sain</strong>
              </div>
              <div>
                <span style={{ color: "#64748B" }}>Email:</span>{" "}
                <a href="mailto:iamlokeshsain@gmail.com" style={{ color: "#38BDF8", textDecoration: "none", fontWeight: 600, wordBreak: "break-all" }}>
                  iamlokeshsain@gmail.com
                </a>
              </div>
              <div>
                <span style={{ color: "#64748B" }}>Location:</span>{" "}
                <span style={{ color: "#F0F2F5" }}>Jaipur, Rajasthan, India</span>
              </div>
              <div>
                <span style={{ color: "#64748B" }}>Official Website:</span>{" "}
                <Link href="https://lokeshsain.vercel.app" style={{ color: "#38BDF8", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px", wordBreak: "break-all" }}>
                  https://lokeshsain.vercel.app <ExternalLink size={13} />
                </Link>
              </div>
            </div>
          </section>

        </div>

        {/* Footer note */}
        <div style={{ marginTop: "40px", textAlign: "center", fontSize: "13px", color: "#64748B", fontFamily: "var(--font-mono, monospace)" }}>
          © {new Date().getFullYear()} Lokesh Sain • Software Engineer Portfolio • All Rights Reserved.
        </div>
      </main>
    </div>
  );
}
