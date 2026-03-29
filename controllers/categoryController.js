const db = require("../db/queries");

async function getCategoryList(req, res) {
  const categories = await db.getAllCategories();

  res.render("categories/list", {
    title: "Categories",
    categories,
  });
}

async function getCategoryDetail(req, res) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(404).send("Category not found");
  }

  const [category, books] = await Promise.all([
    db.getCategoryById(id),
    db.getBooksByCategoryId(id),
  ]);

  if (!category) {
    return res.status(404).send("Category not found");
  }

  res.render("categories/detail", {
    title: category.name,
    category,
    books,
  });
}

module.exports = {
  getCategoryList,
  getCategoryDetail,
};
