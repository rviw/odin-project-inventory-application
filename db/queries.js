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

async function getAllCategories() {
  const { rows } = await pool.query(
    `
      SELECT
        categories.id,
        categories.name,
        COUNT(books.id)::int AS book_count
      FROM categories
      LEFT JOIN books ON books.category_id = categories.id
      GROUP BY categories.id, categories.name
      ORDER BY categories.name ASC
    `,
  );

  return rows;
}

async function getCategoryById(categoryId) {
  const { rows } = await pool.query(
    `
      SELECT id, name
      FROM categories
      WHERE id = $1
    `,
    [categoryId],
  );

  return rows[0];
}

async function getBooksByCategoryId(categoryId) {
  const { rows } = await pool.query(
    `
      SELECT
        books.id,
        books.title,
        books.stock_quantity,
        books.isbn,
        authors.name AS author_name
      FROM books
      JOIN authors ON authors.id = books.author_id
      WHERE books.category_id = $1
      ORDER BY books.title ASC
    `,
    [categoryId],
  );

  return rows;
}

module.exports = {
  getInventoryCounts,
  getLowStockBooks,
  getAllCategories,
  getCategoryById,
  getBooksByCategoryId,
};
