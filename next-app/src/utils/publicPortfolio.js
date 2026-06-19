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
    portfolio.hero = heroPublic;
  }

  return portfolio;
}

module.exports = toPublicPortfolio;
