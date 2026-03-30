const { body, validationResult, matchedData } = require("express-validator");
const db = require("../db/queries");
const { renderNotFound } = require("../utils/renderErrorPage");

function getPositiveIntegerId(value) {
  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  return id;
}

async function getBookList(req, res) {
  const books = await db.getAllBooks();

  res.render("books/list", {
    title: "Books",
    books,
  });
}

async function getBookDetail(req, res) {
  const id = getPositiveIntegerId(req.params.id);

  if (!id) {
    return renderNotFound(res, "Book not found.");
  }

  const book = await db.getBookById(id);

  if (!book) {
    return renderNotFound(res, "Book not found.");
  }

  res.render("books/detail", {
    title: book.title,
    book,
  });
}

async function getBookCreatePage(req, res) {
  const [categories, authors] = await Promise.all([
    db.getAllCategories(),
    db.getAllAuthors(),
  ]);

  res.render("books/form", {
    title: "Add Book",
    formTitle: "Add book",
    formAction: "/books/new",
    submitLabel: "Create book",
    book: {},
    categories,
    authors,
    errors: [],
  });
}

const validateBook = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required.")
    .isLength({ max: 255 })
    .withMessage("Title must be 255 characters or fewer."),
  body("description").trim().notEmpty().withMessage("Description is required."),
  body("price")
    .trim()
    .notEmpty()
    .withMessage("Price is required.")
    .bail()
    .isFloat({ min: 0 })
    .withMessage("Price must be 0 or greater.")
    .bail()
    .toFloat(),
  body("stock_quantity")
    .trim()
    .notEmpty()
    .withMessage("Stock quantity is required.")
    .bail()
    .isInt({ min: 0 })
    .withMessage("Stock quantity must be 0 or greater.")
    .bail()
    .toInt(),
  body("isbn")
    .trim()
    .notEmpty()
    .withMessage("ISBN is required.")
    .bail()
    .isLength({ min: 13, max: 13 })
    .withMessage("ISBN must be exactly 13 digits.")
    .bail()
    .isNumeric()
    .withMessage("ISBN must contain digits only."),
  body("category_id")
    .trim()
    .notEmpty()
    .withMessage("Category is required.")
    .bail()
    .isInt({ min: 1 })
    .withMessage("Choose a valid category.")
    .bail()
    .custom(async (value) => {
      const category = await db.getCategoryById(value);

      if (!category) {
        throw new Error("Choose a valid category.");
      }

      return true;
    })
    .toInt(),
  body("author_id")
    .trim()
    .notEmpty()
    .withMessage("Author is required.")
    .bail()
    .isInt({ min: 1 })
    .withMessage("Choose a valid author.")
    .bail()
    .custom(async (value) => {
      const author = await db.getAuthorById(value);

      if (!author) {
        throw new Error("Choose a valid author.");
      }

      return true;
    })
    .toInt(),
];

const createBook = [
  validateBook,
  body("isbn").custom(async (value) => {
    const existingBook = await db.getBookByIsbn(value);

    if (existingBook) {
      throw new Error("ISBN already exists.");
    }

    return true;
  }),
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const [categories, authors] = await Promise.all([
        db.getAllCategories(),
        db.getAllAuthors(),
      ]);

      return res.status(400).render("books/form", {
        title: "Add Book",
        formTitle: "Add book",
        formAction: "/books/new",
        submitLabel: "Create book",
        book: req.body,
        categories,
        authors,
        errors: errors.array(),
      });
    }

    const data = matchedData(req);

    const newBook = await db.createBook({
      title: data.title,
      description: data.description,
      price: data.price,
      stockQuantity: data.stock_quantity,
      isbn: data.isbn,
      categoryId: data.category_id,
      authorId: data.author_id,
    });

    res.redirect(`/books/${newBook.id}`);
  },
];

async function getBookEditPage(req, res) {
  const id = getPositiveIntegerId(req.params.id);

  if (!id) {
    return renderNotFound(res, "Book not found.");
  }

  const [book, categories, authors] = await Promise.all([
    db.getBookById(id),
    db.getAllCategories(),
    db.getAllAuthors(),
  ]);

  if (!book) {
    return renderNotFound(res, "Book not found.");
  }

  res.render("books/form", {
    title: `Edit ${book.title}`,
    formTitle: "Edit book",
    formAction: `/books/${book.id}/edit`,
    submitLabel: "Save changes",
    book,
    categories,
    authors,
    errors: [],
  });
}

const updateBook = [
  validateBook,
  body("isbn").custom(async (value, { req }) => {
    const id = getPositiveIntegerId(req.params.id);

    if (!id) {
      throw new Error("Book not found.");
    }

    const existingBook = await db.getBookByIsbn(value);

    if (existingBook && existingBook.id !== id) {
      throw new Error("ISBN already exists.");
    }

    return true;
  }),
  async (req, res) => {
    const id = getPositiveIntegerId(req.params.id);

    if (!id) {
      return renderNotFound(res, "Book not found.");
    }

    const existingBook = await db.getBookById(id);

    if (!existingBook) {
      return renderNotFound(res, "Book not found.");
    }

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const [categories, authors] = await Promise.all([
        db.getAllCategories(),
        db.getAllAuthors(),
      ]);

      return res.status(400).render("books/form", {
        title: `Edit ${existingBook.title}`,
        formTitle: "Edit book",
        formAction: `/books/${id}/edit`,
        submitLabel: "Save changes",
        book: { ...req.body, id },
        categories,
        authors,
        errors: errors.array(),
      });
    }

    const data = matchedData(req);

    await db.updateBook(id, {
      title: data.title,
      description: data.description,
      price: data.price,
      stockQuantity: data.stock_quantity,
      isbn: data.isbn,
      categoryId: data.category_id,
      authorId: data.author_id,
    });

    res.redirect(`/books/${id}`);
  },
];

async function deleteBook(req, res) {
  const id = getPositiveIntegerId(req.params.id);

  if (!id) {
    return renderNotFound(res, "Book not found.");
  }

  const book = await db.getBookById(id);

  if (!book) {
    return renderNotFound(res, "Book not found.");
  }

  await db.deleteBook(id);

  res.redirect("/books");
}

module.exports = {
  getBookList,
  getBookDetail,
  getBookCreatePage,
  createBook,
  getBookEditPage,
  updateBook,
  deleteBook,
};
