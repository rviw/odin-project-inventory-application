const pool = require("../pool");

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

async function getCategoryByName(name) {
  const { rows } = await pool.query(
    `
      SELECT id, name
      FROM categories
      WHERE LOWER(name) = LOWER($1)
    `,
    [name],
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
        authors.id AS author_id,
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

async function createCategory(name) {
  const { rows } = await pool.query(
    `
      INSERT INTO categories (name)
      VALUES ($1)
      RETURNING id
    `,
    [name],
  );

  return rows[0];
}

async function updateCategory(id, name) {
  await pool.query(
    `
      UPDATE categories
      SET name = $1
      WHERE id = $2
    `,
    [name, id],
  );
}

async function deleteCategory(id) {
  await pool.query(
    `
      DELETE FROM categories
      WHERE id = $1
    `,
    [id],
  );
}

module.exports = {
  getAllCategories,
  getCategoryById,
  getCategoryByName,
  getBooksByCategoryId,
  createCategory,
  updateCategory,
  deleteCategory,
};
