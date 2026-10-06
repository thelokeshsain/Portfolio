import { Inter, Outfit, JetBrains_Mono } from "next/font/google";
import { ADS_CONFIG } from "@/config/ads";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-body", display: "swap" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://lokeshsain.vercel.app';

export const metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Lokesh Sain | Software Engineer in Jaipur | React & MERN Stack Developer",
    template: "%s | Lokesh Sain"
  },
  description: "Lokesh Sain — Software Engineer based in Jaipur, India. Specializing in React.js, Node.js, and modern full-stack web development. View projects, technical skills, and experience.",
  keywords: [
    "Lokesh Sain",
    "thelokeshsain",
    "Lokesh Sain Jaipur",
    "Lokesh Sain Software Engineer",
    "Lokesh Sain Developer",
    "Lokesh Sain React Developer",
    "Lokesh Sain MERN Stack",
    "Lokesh Sain Portfolio",
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
    description: "Portfolio of Lokesh Sain — Software Engineer building responsive web applications, scalable products, and AI-powered experiences. View projects and experience.",
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
    description: "Software Engineer specializing in React.js, Node.js, and modern full-stack web development. Building responsive web applications and scalable products.",
    images: ["/images/social_preview.webp"],
  },
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
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
  const adClientId = ADS_CONFIG.getClientId();

  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} ${jetbrainsMono.variable}`}>
      <head>
        {adClientId && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adClientId}`}
            crossOrigin="anonymous"
          />
        )}
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
