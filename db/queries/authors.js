const pool = require("../pool");
const { createCrudQueries } = require("./createCrudQueries");

const authorQueries = createCrudQueries({
  pool,
  tableName: "authors",
  selectColumns: ["id", "name"],
  insertColumns: ["name"],
});

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
  return authorQueries.findUnique({
    where: { id: authorId },
  });
}

async function getAuthorByName(name) {
  return authorQueries.findUnique({
    where: { name },
    caseInsensitive: true,
  });
}

async function getBooksByAuthorId(authorId) {
  const { rows } = await pool.query(
    `
      SELECT
        books.id,
        books.title,
        books.stock_quantity,
        books.isbn,
        categories.id AS category_id,
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

async function createAuthor(name) {
  return authorQueries.create({
    data: { name },
  });
}

async function updateAuthor(id, name) {
  await authorQueries.update({
    where: { id },
    data: { name },
  });
}

async function deleteAuthor(id) {
  await authorQueries.delete({
    where: { id },
  });
}

module.exports = {
  getAllAuthors,
  getAuthorById,
  getAuthorByName,
  getBooksByAuthorId,
  createAuthor,
  updateAuthor,
  deleteAuthor,
};
