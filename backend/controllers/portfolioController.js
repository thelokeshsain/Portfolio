// Portfolio Controller — Provides public access to portfolio data.
// Sensitive personal contact details (like phone number) are explicitly excluded.
const crypto = require("crypto");
const Portfolio = require("../models/Portfolio");
const cache = require("../utils/responseCache");
const toPublicPortfolio = require("../utils/publicPortfolio");

const PUBLIC_CACHE_CONTROL =
  "public, max-age=120, s-maxage=300, stale-while-revalidate=60";

exports.getPortfolio = async (req, res) => {
  try {
    let portfolio = cache.get("portfolio");

    if (!portfolio) {
      const portfolioDoc = await Portfolio.findOne({})
        .select("-__v")
        .maxTimeMS(3000)
        .lean();

      if (!portfolioDoc) {
        return res
          .status(404)
          .json({ message: "Portfolio not found. Run: npm run seed" });
      }

      portfolio = toPublicPortfolio(portfolioDoc);
      cache.set("portfolio", portfolio, 300);
    }

    // Generate SHA-1 based weak ETag for cached portfolio contents
    const hash = crypto
      .createHash("sha1")
      .update(JSON.stringify(portfolio))
      .digest("base64");
    const etag = `W/"${hash}"`;

    res.set("Cache-Control", PUBLIC_CACHE_CONTROL);
    res.set("ETag", etag);

    // Fast-path 304 Not Modified check
    if (req.headers["if-none-match"] === etag) {
      return res.status(304).end();
    }

    res.json(portfolio);
  } catch (err) {
    console.error("[Portfolio]", err.message);
    res.status(500).json({ message: "Failed to load portfolio data" });
  }
};
