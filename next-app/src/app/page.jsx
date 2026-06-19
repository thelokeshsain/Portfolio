import connectDB from "@/lib/db";
import Portfolio from "@/models/Portfolio";
import toPublicPortfolio from "@/utils/publicPortfolio";
import PortfolioClient from "@/components/PortfolioClient";
import { DataProvider } from "@/context/DataContext";

export const revalidate = 60; // ISR: revalidate every 60 seconds

export async function generateMetadata() {
  let data = null;
  try {
    await connectDB();
    const raw = await Portfolio.findOne({}).lean();
    data = toPublicPortfolio(raw);
  } catch (err) {
    console.warn("DB failed in generateMetadata:", err.message);
  }

  const title = data?.hero?.name ? `${data.hero.name} - ${data.hero.title}` : "Portfolio";
  const description = data?.hero?.description || "Software Engineer Portfolio";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: process.env.CLIENT_URL,
      siteName: data?.hero?.name || "Portfolio",
      images: [
        {
          url: "/images/developer_workspace.webp",
          width: 1200,
          height: 630,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function Page() {
  let serverData = null;
  try {
    await connectDB();
    const raw = await Portfolio.findOne({}).lean();
    serverData = toPublicPortfolio(raw);
  } catch (err) {
    console.warn("DB failed in Page:", err.message);
  }

  // SEO: Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: serverData?.hero?.name,
    jobTitle: serverData?.hero?.title,
    url: process.env.CLIENT_URL,
    sameAs: [
      serverData?.hero?.linkedin,
      serverData?.hero?.github,
    ].filter(Boolean),
    description: serverData?.hero?.description,
    "knowsAbout": ["React.js", "Node.js", "MongoDB", "Next.js", "JavaScript"]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <DataProvider serverData={serverData}>
        <PortfolioClient />
      </DataProvider>
    </>
  );
}
