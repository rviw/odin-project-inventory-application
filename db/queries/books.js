const pool = require("../pool");

async function getAllBooks() {
  const { rows } = await pool.query(`
    SELECT
      books.id,
      books.title,
      books.price,
      books.stock_quantity,
      books.isbn,
      categories.id AS category_id,
      categories.name AS category_name,
      authors.id AS author_id,
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

async function getBookByIsbn(isbn) {
  const { rows } = await pool.query(
    `
      SELECT id
      FROM books
      WHERE isbn = $1
    `,
    [isbn],
  );

  return rows[0];
}

async function createBook({
  title,
  description,
  price,
  stockQuantity,
  isbn,
  categoryId,
  authorId,
}) {
  const { rows } = await pool.query(
    `
      INSERT INTO books (
        title,
        description,
        price,
        stock_quantity,
        isbn,
        category_id,
        author_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
    `,
    [title, description, price, stockQuantity, isbn, categoryId, authorId],
  );

  return rows[0];
}

async function updateBook(
  id,
  { title, description, price, stockQuantity, isbn, categoryId, authorId },
) {
  await pool.query(
    `
      UPDATE books
      SET
        title = $1,
        description = $2,
        price = $3,
        stock_quantity = $4,
        isbn = $5,
        category_id = $6,
        author_id = $7
      WHERE id = $8
    `,
    [title, description, price, stockQuantity, isbn, categoryId, authorId, id],
  );
}

async function deleteBook(id) {
  await pool.query(
    `
      DELETE FROM books
      WHERE id = $1
    `,
    [id],
  );
}

module.exports = {
  getAllBooks,
  getBookById,
  getBookByIsbn,
  createBook,
  updateBook,
  deleteBook,
};
