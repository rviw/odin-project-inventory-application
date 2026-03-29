const { body, validationResult, matchedData } = require("express-validator");
const db = require("../db/queries");

function getPositiveIntegerId(value) {
  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  return id;
}

async function getCategoryList(req, res) {
  const categories = await db.getAllCategories();

  res.render("categories/list", {
    title: "Categories",
    categories,
  });
}

async function getCategoryDetail(req, res) {
  const id = getPositiveIntegerId(req.params.id);

  if (!id) {
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
    deleteError: null,
  });
}

async function getCategoryCreatePage(req, res) {
  res.render("categories/form", {
    title: "Add Category",
    formTitle: "Add category",
    formAction: "/categories/new",
    submitLabel: "Create category",
    category: {},
    errors: [],
  });
}

const createCategory = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Category name is required.")
    .bail()
    .isLength({ min: 2, max: 40 })
    .withMessage("Category name must be between 2 and 40 characters.")
    .bail()
    .custom(async (value) => {
      const existingCategory = await db.getCategoryByName(value);

      if (existingCategory) {
        throw new Error("Category name already exists.");
      }

      return true;
    }),
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).render("categories/form", {
        title: "Add Category",
        formTitle: "Add category",
        formAction: "/categories/new",
        submitLabel: "Create category",
        category: req.body,
        errors: errors.array(),
      });
    }

    const data = matchedData(req);
    const newCategory = await db.createCategory(data.name);

    res.redirect(`/categories/${newCategory.id}`);
  },
];

async function getCategoryEditPage(req, res) {
  const id = getPositiveIntegerId(req.params.id);

  if (!id) {
    return res.status(404).send("Category not found");
  }

  const category = await db.getCategoryById(id);

  if (!category) {
    return res.status(404).send("Category not found");
  }

  res.render("categories/form", {
    title: `Edit ${category.name}`,
    formTitle: "Edit category",
    formAction: `/categories/${category.id}/edit`,
    submitLabel: "Save changes",
    category,
    errors: [],
  });
}

const updateCategory = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Category name is required.")
    .bail()
    .isLength({ min: 2, max: 40 })
    .withMessage("Category name must be between 2 and 40 characters.")
    .bail()
    .custom(async (value, { req }) => {
      const id = getPositiveIntegerId(req.params.id);

      if (!id) {
        throw new Error("Category not found.");
      }

      const existingCategory = await db.getCategoryByName(value);

      if (existingCategory && existingCategory.id !== id) {
        throw new Error("Category name already exists.");
      }

      return true;
    }),
  async (req, res) => {
    const id = getPositiveIntegerId(req.params.id);

    if (!id) {
      return res.status(404).send("Category not found");
    }

    const existingCategory = await db.getCategoryById(id);

    if (!existingCategory) {
      return res.status(404).send("Category not found");
    }

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).render("categories/form", {
        title: `Edit ${existingCategory.name}`,
        formTitle: "Edit category",
        formAction: `/categories/${id}/edit`,
        submitLabel: "Save changes",
        category: { ...req.body, id },
        errors: errors.array(),
      });
    }

    const data = matchedData(req);

    await db.updateCategory(id, data.name);

    res.redirect(`/categories/${id}`);
  },
];

async function deleteCategory(req, res) {
  const id = getPositiveIntegerId(req.params.id);

  if (!id) {
    return res.status(404).send("Category not found");
  }

  const [category, books] = await Promise.all([
    db.getCategoryById(id),
    db.getBooksByCategoryId(id),
  ]);

  if (!category) {
    return res.status(404).send("Category not found");
  }

  if (books.length > 0) {
    return res.status(400).render("categories/detail", {
      title: category.name,
      category,
      books,
      deleteError: "You cannot delete a category that still has books.",
    });
  }

  await db.deleteCategory(id);
  res.redirect("/categories");
}

module.exports = {
  getCategoryList,
  getCategoryDetail,
  getCategoryCreatePage,
  createCategory,
  getCategoryEditPage,
  updateCategory,
  deleteCategory,
};
