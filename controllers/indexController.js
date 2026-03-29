const db = require("../db/queries");

async function getHomePage(req, res) {
  const [counts, lowStockBooks] = await Promise.all([
    db.getInventoryCounts(),
    db.getLowStockBooks(),
  ]);

  res.render("index", {
    title: "Bookstore Inventory",
    counts,
    lowStockBooks,
  });
}

module.exports = {
  getHomePage,
};
