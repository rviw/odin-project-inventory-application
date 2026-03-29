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

async function getAllAuthors() {
  const { rows } = await pool.query(`
    SELECT
      authors.id,
      authors.name,
      COUNT(books.id)::int AS book_count
    FROM authors
    LEFT JOIN books ON books.author_id = authors.id
    GROUP BY authors.id, authors.name
    ORDER BY authors.name ASC
  `);

  return rows;
}

async function getAuthorById(authorId) {
  const { rows } = await pool.query(
    `
      SELECT id, name
      FROM authors
      WHERE id = $1
    `,
    [authorId],
  );

  return rows[0];
}

async function getBooksByAuthorId(authorId) {
  const { rows } = await pool.query(
    `
      SELECT
        books.id,
        books.title,
        books.stock_quantity,
        books.isbn,
        categories.name AS category_name
      FROM books
      JOIN categories ON categories.id = books.category_id
      WHERE books.author_id = $1
      ORDER BY books.title ASC
    `,
    [authorId],
  );

  return rows;
}

async function getAllBooks() {
  const { rows } = await pool.query(`
    SELECT
      books.id,
      books.title,
      books.price,
      books.stock_quantity,
      books.isbn,
      categories.name AS category_name,
      authors.name AS author_name
    FROM books
    JOIN categories ON categories.id = books.category_id
    JOIN authors ON authors.id = books.author_id
    ORDER BY books.title ASC
  `);

  return rows;
}

async function getBookById(bookId) {
  const { rows } = await pool.query(
    `
      SELECT
        books.id,
        books.title,
        books.description,
        books.price,
        books.stock_quantity,
        books.isbn,
        books.category_id,
        books.author_id,
        categories.name AS category_name,
        authors.name AS author_name
      FROM books
      JOIN categories ON categories.id = books.category_id
      JOIN authors ON authors.id = books.author_id
      WHERE books.id = $1
    `,
    [bookId],
  );

  return rows[0];
}

module.exports = {
  getInventoryCounts,
  getLowStockBooks,
  getAllCategories,
  getCategoryById,
  getBooksByCategoryId,
  getAllAuthors,
  getAuthorById,
  getBooksByAuthorId,
  getAllBooks,
  getBookById,
};
