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
  UserCheck,
  BookOpen,
  Server
} from "lucide-react";
import ConsentRevokeButton from "@/components/ads/ConsentRevokeButton";

export const metadata = {
  title: {
    absolute: "Privacy Policy | Lokesh Sain",
  },
  description: "Comprehensive Privacy Policy for the portfolio and Perspectives publication of Lokesh Sain. Details verified data practices for contact inquiries, editorial reading, Vercel analytics, security cookies, and Google AdSense.",
  alternates: {
    canonical: "/privacy-policy",
  },
};

export default function PrivacyPolicyPage() {
  const lastUpdated = "October 9, 2026";
  const effectiveDate = "October 9, 2026";

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
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
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
          <Link
            href="/blog"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              color: "#64748B",
              textDecoration: "none",
              fontSize: "13px",
              fontWeight: 500,
            }}
          >
            <BookOpen size={14} />
            Perspectives
          </Link>
        </div>
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
            Verified Policy • Oct 2026
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
            Lokesh Sain — Engineering Portfolio & Perspectives Blog
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
            <div style={{ fontSize: "14px", fontWeight: 500, color: "#94A3B8" }}>Portfolio & Independent Technology Publication</div>
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
              This Privacy Policy explains how this website (<Link href="https://lokeshsain.vercel.app" style={{ color: "#38BDF8", textDecoration: "none" }}>https://lokeshsain.vercel.app</Link>), operated by Lokesh Sain (&quot;I&quot;, &quot;me&quot;, or &quot;operator&quot;), handles data when you browse this software engineering portfolio and its companion editorial publication, <em>Perspectives</em>. I am committed to data minimization, transparent technical operations, and respecting user privacy across all site features.
            </p>
          </section>

          {/* Section 2: Perspectives Editorial Blog */}
          <section style={{
            backgroundColor: "#0B0F17",
            border: "1px solid #1E2638",
            borderRadius: "16px",
            padding: "24px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "rgba(56, 189, 248, 0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#38BDF8" }}>
                <BookOpen size={20} />
              </div>
              <h2 style={{ fontSize: "18px", fontWeight: 700, margin: 0 }}>2. Perspectives Editorial Blog & Reader Privacy</h2>
            </div>
            <p style={{ color: "#94A3B8", fontSize: "14px", lineHeight: 1.7, marginBottom: "12px" }}>
              The <em>Perspectives</em> publication (<Link href="/blog" style={{ color: "#38BDF8", textDecoration: "none" }}>/blog</Link>) offers independent long-form analysis, technical essays, and industry commentary. Its operational data practices are designed to protect reader autonomy:
            </p>
            <ul style={{ paddingLeft: "20px", color: "#94A3B8", fontSize: "14px", lineHeight: 1.7, display: "flex", flexDirection: "column", gap: "8px", marginBottom: "14px" }}>
              <li><strong>No Reader Accounts or Registration:</strong> Public articles are freely accessible. There is no user registration, reader profile creation, or paywall requirement.</li>
              <li><strong>No Public Commenting System:</strong> The blog does not operate third-party commenting widgets (such as Disqus) or public forums, eliminating invasive comment-tracking cookies.</li>
              <li><strong>Article Storage in MongoDB Atlas:</strong> Published articles, headlines, metadata, and editorial tags are stored securely in a dedicated MongoDB Atlas database cluster and rendered using server-side Incremental Static Regeneration (ISR).</li>
              <li><strong>Editorial Corrections & Inquiries:</strong> Readers wishing to submit factual corrections, feedback, or journalistic inquiries can do so directly via email at <a href="mailto:iamlokeshsain@gmail.com" style={{ color: "#38BDF8", textDecoration: "none", fontWeight: 600 }}>iamlokeshsain@gmail.com</a>.</li>
            </ul>
          </section>

          {/* Section 3: Information We Collect */}
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
              <h2 style={{ fontSize: "18px", fontWeight: 700, margin: 0 }}>3. Information We Collect</h2>
            </div>
            <p style={{ color: "#94A3B8", fontSize: "14px", lineHeight: 1.7, marginBottom: "14px" }}>
              This website collects only the data strictly necessary to provide portfolio and article content, respond to correspondence, and safeguard infrastructure:
            </p>
            
            <h3 style={{ fontSize: "15px", fontWeight: 600, color: "#F0F2F5", marginBottom: "8px" }}>A. Information You Voluntarily Provide (Contact Form)</h3>
            <p style={{ color: "#94A3B8", fontSize: "14px", lineHeight: 1.7, marginBottom: "10px" }}>
              When you submit an inquiry through the on-site contact form, the website collects:
            </p>
            <ul style={{ paddingLeft: "20px", color: "#94A3B8", fontSize: "14px", lineHeight: 1.7, display: "flex", flexDirection: "column", gap: "6px", marginBottom: "16px" }}>
              <li><strong>Name:</strong> Your provided name (maximum 100 characters).</li>
              <li><strong>Email Address:</strong> Your return email address (maximum 120 characters) so that I may respond.</li>
              <li><strong>Message:</strong> The inquiry or correspondence text you provide (maximum 2,000 characters).</li>
            </ul>

            <h3 style={{ fontSize: "15px", fontWeight: 600, color: "#F0F2F5", marginBottom: "8px" }}>B. Hosting Telemetry & Vercel Analytics</h3>
            <p style={{ color: "#94A3B8", fontSize: "14px", lineHeight: 1.7, marginBottom: "10px" }}>
              When you browse the site, standard technical telemetry is processed by our hosting infrastructure (Vercel):
            </p>
            <ul style={{ paddingLeft: "20px", color: "#94A3B8", fontSize: "14px", lineHeight: 1.7, display: "flex", flexDirection: "column", gap: "6px" }}>
              <li><strong>IP Address & Edge Logs:</strong> Client IP addresses are processed transiently at Vercel edge routers for HTTP routing, rate limiting (such as our 5-submission per 10-minute contact limit), and automated DDoS defense.</li>
              <li><strong>Vercel Web Analytics:</strong> Privacy-friendly aggregate metrics (page views, referrer, device type, country) are collected without creating cross-site tracking profiles or setting intrusive tracking cookies.</li>
              <li><strong>Browser User-Agent & Timestamps:</strong> Standard HTTP headers used to optimize responsive asset delivery and debug browser-specific layout anomalies.</li>
            </ul>
          </section>

          {/* Section 4: Contact Form & Communications Data */}
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
              <h2 style={{ fontSize: "18px", fontWeight: 700, margin: 0 }}>4. How Contact Inquiries Are Processed & Stored</h2>
            </div>
            <p style={{ color: "#94A3B8", fontSize: "14px", lineHeight: 1.7, marginBottom: "12px" }}>
              Messages submitted via the portfolio contact form undergo the following processing:
            </p>
            <ul style={{ paddingLeft: "20px", color: "#94A3B8", fontSize: "14px", lineHeight: 1.7, display: "flex", flexDirection: "column", gap: "8px" }}>
              <li><strong>Automated Email Notification:</strong> Forwarded securely via Nodemailer / SMTP delivery to Lokesh Sain&apos;s verified inbox for direct response.</li>
              <li><strong>MongoDB Atlas Inquiries Collection:</strong> Retained in a secure MongoDB Atlas database collection accessible exclusively through authenticated administrator session to prevent message loss.</li>
              <li><strong>Strict Confidentiality:</strong> Your correspondence details are never rented, sold, traded, or shared with third-party telemarketers or external commercial databases.</li>
            </ul>
          </section>

          {/* Section 5: Cookies & Local Storage */}
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
              <h2 style={{ fontSize: "18px", fontWeight: 700, margin: 0 }}>5. Cookies and Local Storage Technologies</h2>
            </div>
            <p style={{ color: "#94A3B8", fontSize: "14px", lineHeight: 1.7, marginBottom: "14px" }}>
              This website clearly distinguishes between first-party essential functional storage and third-party advertising cookies:
            </p>
            <ul style={{ paddingLeft: "20px", color: "#94A3B8", fontSize: "14px", lineHeight: 1.7, display: "flex", flexDirection: "column", gap: "8px", marginBottom: "14px" }}>
              <li><strong>First-Party Essential Security Cookies:</strong> General public visitors reading the portfolio or blog are not assigned tracking cookies. Essential cookies (<code style={{ fontFamily: "var(--font-mono, monospace)", color: "#38BDF8" }}>adminSession</code>, <code style={{ fontFamily: "var(--font-mono, monospace)", color: "#38BDF8" }}>refreshToken</code> HTTP-only Secure, and <code style={{ fontFamily: "var(--font-mono, monospace)", color: "#38BDF8" }}>csrfToken</code> with SameSite=Strict) are deployed exclusively for authorized administrator login and session protection.</li>
              <li><strong>Local Storage:</strong> Utilized strictly for non-sensitive client preferences, such as transient application caching, active tab states, and progressive web app (PWA) banner dismissal. No personal identification data is stored.</li>
              <li><strong>Third-Party Advertising Cookies:</strong> Google AdSense and its certified advertising network partners deploy cookies or similar technologies to serve advertisements, prevent invalid traffic, and measure performance.</li>
            </ul>
          </section>

          {/* Section 6: Google AdSense & Advertising */}
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
              <h2 style={{ fontSize: "18px", fontWeight: 700, margin: 0 }}>6. Google AdSense & Advertising Disclosures</h2>
            </div>
            <p style={{ color: "#94A3B8", fontSize: "14px", lineHeight: 1.7, marginBottom: "12px" }}>
              This website may display advertisements served by Google AdSense (Publisher ID: <code style={{ fontFamily: "var(--font-mono, monospace)", color: "#38BDF8" }}>ca-pub-6421974191427219</code>) and Google&apos;s certified advertising partners. In compliance with official Google AdSense policies:
            </p>
            <ul style={{ paddingLeft: "20px", color: "#94A3B8", fontSize: "14px", lineHeight: 1.7, display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
              <li><strong>Third-Party Vendors & Cookies:</strong> Third-party vendors, including Google, use cookies to serve ads based on prior visits to this website or other websites across the web.</li>
              <li><strong>Personalized Advertising:</strong> Google&apos;s use of advertising cookies enables it and its partners to serve ads based on your visit to this site and other websites on the Internet.</li>
              <li><strong>Contextual Ad Delivery:</strong> Where personalized ads have been declined or in jurisdictions requiring prior opt-in consent, non-personalized (contextual) ads may be served based on the topic of the current page rather than user browsing history.</li>
            </ul>
            <p style={{ color: "#94A3B8", fontSize: "14px", lineHeight: 1.7, marginBottom: "12px" }}>
              You may manage or opt out of personalized advertising at any time through authorized industry mechanisms:
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "8px" }}>
              <div>
                • <strong>Google Ads Settings:</strong> Adjust your advertising preferences at{" "}
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
                • <strong>Digital Advertising Alliance (AboutAds):</strong> Opt out of third-party advertising cookies at{" "}
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

          {/* Section 7: Google Consent Management Platform (CMP) */}
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
              <h2 style={{ fontSize: "18px", fontWeight: 700, margin: 0, color: "#F0F2F5" }}>7. Consent Architecture & Regulatory Choices</h2>
            </div>
            <p style={{ color: "#94A3B8", fontSize: "14px", lineHeight: 1.7, marginBottom: "12px" }}>
              To ensure compliance for global readers, this site implements Google&apos;s Privacy &amp; Messaging Consent Management Platform (CMP):
            </p>
            <ul style={{ paddingLeft: "20px", color: "#94A3B8", fontSize: "14px", lineHeight: 1.7, display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
              <li><strong>EEA, UK, and Switzerland:</strong> Certified with the IAB Transparency and Consent Framework (TCF v2.2) as mandated by Google. Personalized advertising and advertising cookies are withheld until positive consent is obtained.</li>
              <li><strong>US State Privacy Regulations:</strong> Supports statutory opt-out choices regarding targeted advertising under California CCPA/CPRA, Virginia VCDPA, and related state frameworks.</li>
              <li><strong>Revoke or Revisit Consent:</strong> You can revisit or revoke your consent preferences at any time using the button below:</li>
            </ul>
            <div style={{ marginTop: "16px" }}>
              <ConsentRevokeButton />
            </div>
          </section>

          {/* Section 8: User Rights */}
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
              <h2 style={{ fontSize: "18px", fontWeight: 700, margin: 0 }}>8. Your Privacy Rights</h2>
            </div>
            <p style={{ color: "#94A3B8", fontSize: "14px", lineHeight: 1.7, marginBottom: "12px" }}>
              Depending on your location and applicable law (including India&apos;s Digital Personal Data Protection Act 2023, EU/UK GDPR, and California CCPA/CPRA), you may have rights regarding personal information processed through this site:
            </p>
            <ul style={{ paddingLeft: "20px", color: "#94A3B8", fontSize: "14px", lineHeight: 1.7, display: "flex", flexDirection: "column", gap: "6px", marginBottom: "14px" }}>
              <li><strong>Right to Confirmation & Access:</strong> The right to confirm whether I process your contact information and request a summary.</li>
              <li><strong>Right to Correction:</strong> The right to update inaccurate or incomplete contact or correspondence records.</li>
              <li><strong>Right to Erasure / Deletion:</strong> The right to request the deletion of your submitted contact messages.</li>
              <li><strong>Right to Revoke Consent:</strong> The right to withdraw consent for advertising cookies at any time via the consent manager.</li>
              <li><strong>Right to Grievance Redressal:</strong> The right to contact the operator directly with concerns regarding personal data processing.</li>
            </ul>
            <p style={{ color: "#94A3B8", fontSize: "14px", lineHeight: 1.7, margin: 0 }}>
              To exercise any of these rights regarding contact communications, please email <a href="mailto:iamlokeshsain@gmail.com" style={{ color: "#38BDF8", textDecoration: "none", fontWeight: 600 }}>iamlokeshsain@gmail.com</a>.
            </p>
          </section>

          {/* Section 9: Data Retention & Security */}
          <section style={{
            backgroundColor: "#0B0F17",
            border: "1px solid #1E2638",
            borderRadius: "16px",
            padding: "24px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "rgba(56, 189, 248, 0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#38BDF8" }}>
                <Server size={20} />
              </div>
              <h2 style={{ fontSize: "18px", fontWeight: 700, margin: 0 }}>9. Data Retention & Infrastructure Security</h2>
            </div>
            <p style={{ color: "#94A3B8", fontSize: "14px", lineHeight: 1.7, marginBottom: "12px" }}>
              Submitted contact inquiries are retained in MongoDB Atlas only as long as necessary to conduct professional communication or until a verified deletion request is received.
            </p>
            <p style={{ color: "#94A3B8", fontSize: "14px", lineHeight: 1.7, margin: 0 }}>
              Security measures include enforced HTTPS/TLS transport encryption, hardened Content Security Policy (with strict production script restrictions), secure HTTP-only cookies with SameSite attributes, API rate limiting, and parameter validation. While no internet transmission is ever unconditionally invulnerable, appropriate commercial and technical safeguards protect all collected data.
            </p>
          </section>

          {/* Section 10: Third-Party Links */}
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
              <h2 style={{ fontSize: "18px", fontWeight: 700, margin: 0 }}>10. External Links & Citations</h2>
            </div>
            <p style={{ color: "#94A3B8", fontSize: "14px", lineHeight: 1.7, margin: 0 }}>
              This portfolio and the Perspectives publication include links and citations to third-party sources (such as GitHub, LinkedIn, news organizations, and government registries). I am not responsible for the privacy practices, content, or policies of external websites. We encourage you to review their respective privacy notices upon leaving this domain.
            </p>
          </section>

          {/* Section 11: Operator Contact Information */}
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
              <h2 style={{ fontSize: "18px", fontWeight: 700, margin: 0 }}>11. Operator Contact Information</h2>
            </div>
            <p style={{ color: "#94A3B8", fontSize: "14px", lineHeight: 1.7, marginBottom: "16px" }}>
              For privacy-related inquiries, data requests, or questions regarding this policy, contact:
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
                <span style={{ color: "#64748B" }}>Official Domain:</span>{" "}
                <Link href="https://lokeshsain.vercel.app" style={{ color: "#38BDF8", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px", wordBreak: "break-all" }}>
                  https://lokeshsain.vercel.app <ExternalLink size={13} />
                </Link>
              </div>
            </div>
          </section>

        </div>

        {/* Footer note */}
        <div style={{ marginTop: "40px", textAlign: "center", fontSize: "13px", color: "#64748B", fontFamily: "var(--font-mono, monospace)" }}>
          © {new Date().getFullYear()} Lokesh Sain • Software Engineer Portfolio & Perspectives • All Rights Reserved.
        </div>
      </main>
    </div>
  );
}
