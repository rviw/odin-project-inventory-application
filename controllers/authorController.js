const { body, validationResult, matchedData } = require("express-validator");
const db = require("../db/queries");

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
    return res.status(404).send("Author not found");
  }

  const [author, books] = await Promise.all([
    db.getAuthorById(id),
    db.getBooksByAuthorId(id),
  ]);

  if (!author) {
    return res.status(404).send("Author not found");
  }

  res.render("authors/detail", {
    title: author.name,
    author,
    books,
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
    .isLength({ min: 2, max: 120 })
    .withMessage("Author name must be between 2 and 120 characters.")
    .bail()
    .custom(async (value) => {
      const existingAuthor = await db.getAuthorByName(value);

      if (existingAuthor) {
        throw new Error("Author name already exists.");
      }

      return true;
    }),
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

module.exports = {
  getAuthorList,
  getAuthorDetail,
  getAuthorCreatePage,
  createAuthor,
};
