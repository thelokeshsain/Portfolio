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
      heroPublic.image = '/images/social_preview.webp';
    }
    portfolio.hero = heroPublic;
  }

  // Normalize project visuals: if project has an oversized data URI matching known assets, map to static WebP
  if (Array.isArray(portfolio.projects)) {
    portfolio.projects = portfolio.projects.map((p) => {
      let image = p.image;
      if (image && typeof image === 'string' && image.startsWith('data:')) {
        const title = (p.title || '').toLowerCase();
        if (title.includes('apna') || title.includes('backup')) {
          image = '/images/project_apna_backup.webp';
        } else if (title.includes('food') || title.includes('court')) {
          image = '/images/project_foodcourt.webp';
        } else if (title.includes('sizzling')) {
          image = '/images/project_sizzling.webp';
        } else if (image.length > 4000) {
          // Cap excessive base64 blobs that destroy mobile bandwidth & CPU parsing
          image = '/images/social_preview.webp';
        }
      }
      return { ...p, image };
    });
  }

  return portfolio;
}

module.exports = toPublicPortfolio;
