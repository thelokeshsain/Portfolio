// Portfolio Controller — Provides public access to portfolio data.
// Sensitive personal contact details (like phone number) are explicitly excluded.
const Portfolio = require("../models/Portfolio");
const cache = require("../utils/responseCache");
const toPublicPortfolio = require("../utils/publicPortfolio");

const PUBLIC_CACHE_CONTROL =
  "public, max-age=120, s-maxage=300, stale-while-revalidate=60";

exports.getPortfolio = async (req, res) => {
  try {
    const cached = cache.get("portfolio");
    if (cached) {
      return res.set("Cache-Control", PUBLIC_CACHE_CONTROL).json(cached);
    }

    const portfolioDoc = await Portfolio.findOne({})
      .select("-__v")
      .maxTimeMS(3000)
      .lean();
    if (!portfolioDoc) {
      return res
        .status(404)
        .json({ message: "Portfolio not found. Run: npm run seed" });
    }

    const portfolio = toPublicPortfolio(portfolioDoc);

    cache.set("portfolio", portfolio, 300);

    res.set("Cache-Control", PUBLIC_CACHE_CONTROL).json(portfolio);
  } catch (err) {
    console.error("[Portfolio]", err.message);
    res.status(500).json({ message: "Failed to load portfolio data" });
  }
};
