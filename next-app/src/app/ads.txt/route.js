import { ADS_CONFIG } from "@/config/ads";

export const dynamic = "force-dynamic";

export async function GET() {
  const pubId = ADS_CONFIG.getAdsTxtPubId();
  
  if (!pubId) {
    return new Response(
      "# Google AdSense ads.txt\n# Publisher ID is pending configuration. Set NEXT_PUBLIC_ADSENSE_PUBLISHER_ID in your environment variables.\n",
      {
        status: 200,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-cache",
        },
      }
    );
  }

  const content = `google.com, ${pubId}, DIRECT, f08c47fec0942fa0\n`;

  return new Response(content, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
