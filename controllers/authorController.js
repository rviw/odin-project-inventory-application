const { body, validationResult, matchedData } = require("express-validator");
const db = require("../db/queries");
const { renderNotFound } = require("../utils/renderErrorPage");
const { validateAdminPassword } = require("../utils/validateAdminPassword");

function getPositiveIntegerId(value) {
  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  return id;
}

async function getAuthorList(req, res) {
  const authors = await db.getAllAuthors();

  res.render("authors/list", {
    title: "Authors",
    authors,
  });
}

async function getAuthorDetail(req, res) {
  const id = getPositiveIntegerId(req.params.id);

  if (!id) {
    return renderNotFound(res, "Author not found.");
  }

  const [author, books] = await Promise.all([
    db.getAuthorById(id),
    db.getBooksByAuthorId(id),
  ]);

  if (!author) {
    return renderNotFound(res, "Author not found.");
  }

  res.render("authors/detail", {
    title: author.name,
    author,
    books,
    deleteError: null,
  });
}

async function getAuthorCreatePage(req, res) {
  res.render("authors/form", {
    title: "Add Author",
    formTitle: "Add author",
    formAction: "/authors/new",
    submitLabel: "Create author",
    author: {},
    errors: [],
  });
}

const createAuthor = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Author name is required.")
    .bail()
    .isLength({ min: 2, max: 40 })
    .withMessage("Author name must be between 2 and 40 characters.")
    .bail()
    .custom(async (value) => {
      const existingAuthor = await db.getAuthorByName(value);

      if (existingAuthor) {
        throw new Error("Author name already exists.");
      }

      return true;
    }),
  validateAdminPassword(),
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).render("authors/form", {
        title: "Add Author",
        formTitle: "Add author",
        formAction: "/authors/new",
        submitLabel: "Create author",
        author: req.body,
        errors: errors.array(),
      });
    }

    const data = matchedData(req);
    const newAuthor = await db.createAuthor(data.name);

    res.redirect(`/authors/${newAuthor.id}`);
  },
];

async function getAuthorEditPage(req, res) {
  const id = getPositiveIntegerId(req.params.id);

  if (!id) {
    return renderNotFound(res, "Author not found.");
  }

  const author = await db.getAuthorById(id);

  if (!author) {
    return renderNotFound(res, "Author not found.");
  }

  res.render("authors/form", {
    title: `Edit ${author.name}`,
    formTitle: "Edit author",
    formAction: `/authors/${author.id}/edit`,
    submitLabel: "Save changes",
    author,
    errors: [],
  });
}

const updateAuthor = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Author name is required.")
    .bail()
    .isLength({ min: 2, max: 40 })
    .withMessage("Author name must be between 2 and 40 characters.")
    .bail()
    .custom(async (value, { req }) => {
      const id = getPositiveIntegerId(req.params.id);

      if (!id) {
        throw new Error("Author not found.");
      }

      const existingAuthor = await db.getAuthorByName(value);

      if (existingAuthor && existingAuthor.id !== id) {
        throw new Error("Author name already exists.");
      }

      return true;
    }),
  validateAdminPassword(),
  async (req, res) => {
    const id = getPositiveIntegerId(req.params.id);

    if (!id) {
      return renderNotFound(res, "Author not found.");
    }

    const existingAuthor = await db.getAuthorById(id);

    if (!existingAuthor) {
      return renderNotFound(res, "Author not found.");
    }

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).render("authors/form", {
        title: `Edit ${existingAuthor.name}`,
        formTitle: "Edit author",
        formAction: `/authors/${id}/edit`,
        submitLabel: "Save changes",
        author: { ...req.body, id },
        errors: errors.array(),
      });
    }

    const data = matchedData(req);

    await db.updateAuthor(id, data.name);

    res.redirect(`/authors/${id}`);
  },
];

const deleteAuthor = [
  validateAdminPassword(),
  async (req, res) => {
    const id = getPositiveIntegerId(req.params.id);

    if (!id) {
      return renderNotFound(res, "Author not found.");
    }

    const [author, books] = await Promise.all([
      db.getAuthorById(id),
      db.getBooksByAuthorId(id),
    ]);

    if (!author) {
      return renderNotFound(res, "Author not found.");
    }

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).render("authors/detail", {
        title: author.name,
        author,
        books,
        deleteError: errors.array()[0].msg,
      });
    }

    if (books.length > 0) {
      return res.status(400).render("authors/detail", {
        title: author.name,
        author,
        books,
        deleteError: "You cannot delete an author that still has books.",
      });
    }

    await db.deleteAuthor(id);
    res.redirect("/authors");
  },
];

module.exports = {
  getAuthorList,
  getAuthorDetail,
  getAuthorCreatePage,
  createAuthor,
  getAuthorEditPage,
  updateAuthor,
  deleteAuthor,
};
