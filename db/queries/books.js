const pool = require("../pool");
const { createCrudQueries } = require("./createCrudQueries");

const bookQueries = createCrudQueries({
  pool,
  tableName: "books",
  insertColumns: [
    "title",
    "description",
    "price",
    "stock_quantity",
    "isbn",
    "category_id",
    "author_id",
  ],
});

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
  return bookQueries.findUnique({
    where: { isbn },
  });
}

async function createBook(data) {
  return bookQueries.create({
    data,
  });
}

async function updateBook(id, data) {
  await bookQueries.update({
    where: { id },
    data,
  });
}

async function deleteBook(id) {
  await bookQueries.delete({
    where: { id },
  });
}

module.exports = {
  getAllBooks,
  getBookById,
  getBookByIsbn,
  createBook,
  updateBook,
  deleteBook,
};
