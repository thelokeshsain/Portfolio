const crypto = require("crypto");

function toPublicPortfolio(portfolioDoc) {
  if (!portfolioDoc) return null;

  // Deeply serialize the document to ensure all ObjectIds (including nested ones)
  // are converted to plain strings. This is strictly required by Next.js when
  // passing data from Server Components to Client Components.
  const portfolio = JSON.parse(
    JSON.stringify(
      typeof portfolioDoc.toObject === "function"
        ? portfolioDoc.toObject()
        : portfolioDoc
    )
  );

  delete portfolio.__v;

  if (portfolio.hero) {
    const { phone: _phone, ...heroPublic } = portfolio.hero;
    if (heroPublic.image && typeof heroPublic.image === 'string' && heroPublic.image.startsWith('data:')) {
      const hash = crypto
        .createHash('md5')
        .update(heroPublic.image.slice(0, 100) + heroPublic.image.slice(-100))
        .digest('hex')
        .slice(0, 8);
      heroPublic.image = `/api/hero/image?v=${hash}`;
    } else if (!heroPublic.image) {
      heroPublic.image = '/images/hero_laptop_mockup.webp';
    }
    portfolio.hero = heroPublic;
  }

  // Authoritative project visuals:
  // If a project has a custom image stored in MongoDB as a data URI, resolve it to
  // the dedicated versioned endpoint: /api/projects/${p.id}/image?v=${contentHash}
  // This guarantees:
  // 1. Authoritative current visual from the backend (never overridden by stale local fallbacks).
  // 2. Ultra-lean RSC HTML payload (preserves fast TTFB/FCP/LCP and mobile performance).
  // 3. Immutable browser/CDN caching keyed by content hash (automatic cache-busting when updated).
  if (Array.isArray(portfolio.projects)) {
    portfolio.projects = portfolio.projects.map((p) => {
      let image = p.image;
      if (image && typeof image === 'string' && image.startsWith('data:')) {
        const hash = crypto
          .createHash('md5')
          .update(image.slice(0, 100) + image.slice(-100) + (p.updatedAt || ''))
          .digest('hex')
          .slice(0, 8);
        image = `/api/projects/${p.id}/image?v=${hash}`;
      }
      return { ...p, image };
    });
  }

  return portfolio;
}

module.exports = toPublicPortfolio;
