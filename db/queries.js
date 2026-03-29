const pool = require("./pool");

async function getInventoryCounts() {
  const { rows } = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM categories)::int AS category_count,
      (SELECT COUNT(*) FROM authors)::int AS author_count,
      (SELECT COUNT(*) FROM books)::int AS book_count
    `);

  return rows[0];
}

async function getLowStockBooks(limit = 5) {
  const { rows } = await pool.query(
    `
    SELECT
      books.id,
      books.title,
      books.stock_quantity,
      authors.name AS author_name
    FROM books
    JOIN authors ON authors.id = books.author_id
    WHERE books.stock_quantity <= 3
    ORDER BY books.stock_quantity ASC, books.title ASC
    LIMIT $1
    `,
    [limit],
  );

  return rows;
}

module.exports = {
  getInventoryCounts,
  getLowStockBooks,
};
