function toPublicPortfolio(portfolioDoc) {
  if (!portfolioDoc) return null;

  const portfolio =
    typeof portfolioDoc.toObject === "function"
      ? portfolioDoc.toObject()
      : { ...portfolioDoc };

  delete portfolio.__v;

  if (portfolio.hero) {
    const { phone: _phone, ...heroPublic } = portfolio.hero;
    portfolio.hero = heroPublic;
  }

  return portfolio;
}

module.exports = toPublicPortfolio;
