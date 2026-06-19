import { Inter, Outfit, JetBrains_Mono } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-body" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-display" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://lokeshsain.vercel.app'),
  title: {
    default: "Lokesh Sain | Full-Stack Software Engineer",
    template: "%s | Lokesh Sain"
  },
  description: "Portfolio of Lokesh Sain, a Full-Stack React & Node.js Software Engineer specializing in modern web applications.",
  keywords: ["Lokesh Sain", "Software Engineer", "React Developer", "MERN Stack", "Next.js", "Portfolio"],
  authors: [{ name: "Lokesh Sain" }],
  creator: "Lokesh Sain",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "Lokesh Sain | Software Engineer",
    description: "Portfolio of Lokesh Sain, a Full-Stack React & Node.js Software Engineer.",
    siteName: "Lokesh Sain Portfolio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lokesh Sain | Software Engineer",
    description: "Portfolio of Lokesh Sain, a Full-Stack React & Node.js Software Engineer.",
  },
  alternates: {
    canonical: "/",
  }
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
