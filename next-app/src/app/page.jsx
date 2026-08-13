import { cache } from "react";
import connectDB from "@/lib/db";
import Portfolio from "@/models/Portfolio";
import toPublicPortfolio from "@/utils/publicPortfolio";
import PortfolioClient from "@/components/PortfolioClient";
import { DataProvider } from "@/context/DataContext";

export const revalidate = 3600; // ISR: revalidate pre-rendered HTML every 1 hour for instant initial page loads

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://lokeshsain.vercel.app';

// Cached MongoDB fetcher shared across generateMetadata and Page execution
const getPortfolioData = cache(async () => {
  try {
    await connectDB();
    const raw = await Portfolio.findOne({}).select("-__v").lean();
    return toPublicPortfolio(raw);
  } catch (err) {
    console.warn("DB fetch failed in getPortfolioData:", err.message);
    return null;
  }
});

// Helper to guarantee 100% valid absolute URLs for Google Search Console & Social Crawlers
function toAbsoluteUrl(urlStr) {
  if (!urlStr || typeof urlStr !== 'string') {
    return `${BASE_URL}/images/social_preview.webp`;
  }
  if (urlStr.startsWith('http://') || urlStr.startsWith('https://')) {
    return urlStr;
  }
  if (urlStr.startsWith('/')) {
    return `${BASE_URL}${urlStr}`;
  }
  return `${BASE_URL}/${urlStr}`;
}

export async function generateMetadata() {
  const data = await getPortfolioData();

  const name = data?.hero?.name || "Lokesh Sain";
  const role = data?.hero?.role || data?.hero?.title || "Software Engineer";
  const desc = data?.hero?.description || "Software Engineer specializing in React.js, Node.js, and MERN stack development based in Jaipur, Rajasthan.";

  const title = `${name} — ${role} | React & MERN Stack Developer in Jaipur`;
  const description = `${desc} Currently working at 3Handshake Techsoft. View projects, skills, and experience.`;
  const socialImgUrl = toAbsoluteUrl('/images/social_preview.webp');

  return {
    title,
    description,
    keywords: [name, "thelokeshsain", `${name} Jaipur`, `${name} Engineer`, `${name} Developer`, `${name} Portfolio`, "Software Engineer Jaipur", "React Developer India"],
    openGraph: {
      title,
      description,
      url: BASE_URL,
      siteName: `${name} — Portfolio`,
      images: [
        {
          url: socialImgUrl,
          width: 1200,
          height: 630,
          alt: `${name} — ${role}`,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [socialImgUrl],
    },
  };
}

export default async function Page() {
  const serverData = await getPortfolioData();

  const h = serverData?.hero || {};
  const skills = serverData?.skills || {};
  const allSkills = Object.values(skills).flat();

  const personImageUrl = toAbsoluteUrl(h.image);

  // Rich structured data for Google Knowledge Panel & Search Console validation
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${BASE_URL}/#person`,
    name: h.name || "Lokesh Sain",
    givenName: "Lokesh",
    familyName: "Sain",
    jobTitle: h.role || "Software Engineer",
    url: BASE_URL,
    image: personImageUrl,
    email: h.email || undefined,
    sameAs: [
      h.linkedin,
      h.github,
    ].filter(Boolean),
    description: h.description,
    knowsAbout: allSkills.length > 0 ? allSkills : ["React.js", "Node.js", "MongoDB", "Next.js", "JavaScript", "Express.js", "MERN Stack"],
    alumniOf: [
      {
        "@type": "EducationalOrganization",
        name: "DY Patil Institute of MCA & Management",
      },
      {
        "@type": "EducationalOrganization",
        name: "S.S. Jain Subodh PG College",
      },
    ],
    worksFor: {
      "@type": "Organization",
      name: "3Handshake Techsoft Pvt. Ltd.",
      url: "https://3handshake.com",
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Jaipur",
      addressRegion: "Rajasthan",
      addressCountry: "IN",
    },
    nationality: {
      "@type": "Country",
      name: "India",
    },
  };

  // Website schema for search engines
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${BASE_URL}/#website`,
    url: BASE_URL,
    name: `${h.name || "Lokesh Sain"} — Software Engineer Portfolio`,
    description: h.description || "Portfolio website of Lokesh Sain, Software Engineer",
    author: { "@id": `${BASE_URL}/#person` },
  };

  // Professional profile / resume schema — Valid ISO 8601 datetimes for Search Console
  const profileSchema = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": `${BASE_URL}/#profilepage`,
    url: BASE_URL,
    mainEntity: {
      "@type": "Person",
      "@id": `${BASE_URL}/#person`,
      name: h.name || "Lokesh Sain",
      image: personImageUrl,
    },
    dateCreated: "2024-01-01T00:00:00Z",
    dateModified: new Date().toISOString(),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([personSchema, websiteSchema, profileSchema]) }}
      />
      <DataProvider serverData={serverData}>
        <PortfolioClient />
      </DataProvider>
    </>
  );
}
