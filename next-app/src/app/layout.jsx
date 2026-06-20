import { Inter, Outfit, JetBrains_Mono } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-body" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-display" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://lokeshsain.vercel.app';

export const metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Lokesh Sain | Software Engineer in Jaipur | React & MERN Stack Developer",
    template: "%s | Lokesh Sain"
  },
  description: "Lokesh Sain — Software Engineer at 3Handshake Techsoft, Jaipur. Specializing in React.js, Node.js, MongoDB & MERN stack development. MCA from DY Patil Institute (CGPA 8.29). View projects, experience, and contact information.",
  keywords: [
    "Lokesh Sain",
    "thelokeshsain",
    "Lokesh Sain Jaipur",
    "Lokesh Sain Software Engineer",
    "Lokesh Sain Developer",
    "Lokesh Sain React Developer",
    "Lokesh Sain MERN Stack",
    "Lokesh Sain Portfolio",
    "Lokesh Sain 3Handshake",
    "Software Engineer Jaipur",
    "React Developer Jaipur",
    "MERN Stack Developer India",
    "Full Stack Developer Jaipur",
    "Lokesh Sain MCA",
    "Lokesh Sain DY Patil",
  ],
  authors: [{ name: "Lokesh Sain", url: BASE_URL }],
  creator: "Lokesh Sain",
  publisher: "Lokesh Sain",
  category: "technology",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "Lokesh Sain | Software Engineer | React & MERN Stack Developer",
    description: "Portfolio of Lokesh Sain — Software Engineer at 3Handshake Techsoft, Jaipur. React.js, Node.js, MongoDB specialist. View projects and experience.",
    siteName: "Lokesh Sain — Software Engineer Portfolio",
    images: [
      {
        url: "/images/social_preview.webp",
        width: 1200,
        height: 630,
        alt: "Lokesh Sain — Software Engineer Portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lokesh Sain | Software Engineer | React & MERN Stack Developer",
    description: "Software Engineer at 3Handshake Techsoft, Jaipur. React.js, Node.js, MongoDB specialist.",
    images: ["/images/social_preview.webp"],
  },
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  verification: {
    // Add your Google Search Console verification code here after setup
    // google: "your-verification-code",
  },
  other: {
    "google-site-verification": process.env.GOOGLE_SITE_VERIFICATION || "",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} ${jetbrainsMono.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
