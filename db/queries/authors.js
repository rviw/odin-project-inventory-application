const pool = require("../pool");

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

async function getAuthorByName(name) {
  const { rows } = await pool.query(
    `
      SELECT id, name
      FROM authors
      WHERE LOWER(name) = LOWER($1)
    `,
    [name],
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
  const { rows } = await pool.query(
    `
      INSERT INTO authors (name)
      VALUES ($1)
      RETURNING id
    `,
    [name],
  );

  return rows[0];
}

async function updateAuthor(id, name) {
  await pool.query(
    `
      UPDATE authors
      SET name = $1
      WHERE id = $2
    `,
    [name, id],
  );
}

async function deleteAuthor(id) {
  await pool.query(
    `
      DELETE FROM authors
      WHERE id = $1
    `,
    [id],
  );
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
