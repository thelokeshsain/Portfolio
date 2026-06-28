import connectDB from "@/lib/db";
import Portfolio from "@/models/Portfolio";
import toPublicPortfolio from "@/utils/publicPortfolio";
import PortfolioClient from "@/components/PortfolioClient";
import { DataProvider } from "@/context/DataContext";

export const revalidate = 60; // ISR: revalidate every 60 seconds

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://lokeshsain.vercel.app';

export async function generateMetadata() {
  let data = null;
  try {
    await connectDB();
    const raw = await Portfolio.findOne({}).select("-__v").lean();
    data = toPublicPortfolio(raw);
  } catch (err) {
    console.warn("DB failed in generateMetadata:", err.message);
  }

  const name = data?.hero?.name || "Lokesh Sain";
  const role = data?.hero?.role || data?.hero?.title || "Software Engineer";
  const desc = data?.hero?.description || "Software Engineer specializing in React.js, Node.js, and MERN stack development based in Jaipur, Rajasthan.";

  const title = `${name} — ${role} | React & MERN Stack Developer in Jaipur`;
  const description = `${desc} Currently working at 3Handshake Techsoft. View projects, skills, and experience.`;

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
          url: "/images/social_preview.webp",
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
      images: ["/images/social_preview.webp"],
    },
  };
}

export default async function Page() {
  let serverData = null;
  try {
    await connectDB();
    const raw = await Portfolio.findOne({}).select("-__v").lean();
    serverData = toPublicPortfolio(raw);
  } catch (err) {
    console.warn("DB failed in Page:", err.message);
  }

  const h = serverData?.hero || {};
  const exp = serverData?.experience || [];
  const projects = serverData?.projects || [];
  const skills = serverData?.skills || {};
  const allSkills = Object.values(skills).flat();

  // Rich structured data for Google Knowledge Panel & AI search engines
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${BASE_URL}/#person`,
    name: h.name || "Lokesh Sain",
    givenName: "Lokesh",
    familyName: "Sain",
    jobTitle: h.role || "Software Engineer",
    url: BASE_URL,
    image: h.image || `${BASE_URL}/images/social_preview.webp`,
    email: h.email,
    sameAs: [
      h.linkedin,
      h.github,
    ].filter(Boolean),
    description: h.description,
    knowsAbout: allSkills.length > 0 ? allSkills : ["React.js", "Node.js", "MongoDB", "Next.js", "JavaScript", "Express.js", "MERN Stack"],
    alumniOf: [
      {
        "@type": "EducationOrganization",
        name: "DY Patil Institute of MCA & Management",
      },
      {
        "@type": "EducationOrganization",
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

  // Professional profile / resume schema
  const profileSchema = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": `${BASE_URL}/#profilepage`,
    url: BASE_URL,
    mainEntity: { "@id": `${BASE_URL}/#person` },
    dateCreated: "2024-01-01",
    dateModified: new Date().toISOString().split("T")[0],
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
