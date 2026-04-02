const pool = require("../pool");
const { createCrudQueries } = require("./createCrudQueries");

const categoryQueries = createCrudQueries({
  pool,
  tableName: "categories",
  selectColumns: ["id", "name"],
  insertColumns: ["name"],
});

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
  return categoryQueries.findUnique({
    where: { id: categoryId },
  });
}

async function getCategoryByName(name) {
  return categoryQueries.findUnique({
    where: { name },
    caseInsensitive: true,
  });
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
  return categoryQueries.create({
    data: { name },
  });
}

async function updateCategory(id, name) {
  await categoryQueries.update({
    where: { id },
    data: { name },
  });
}

async function deleteCategory(id) {
  await categoryQueries.delete({
    where: { id },
  });
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
