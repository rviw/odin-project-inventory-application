const db = require("../db/queries");

async function getBookList(req, res) {
  const books = await db.getAllBooks();

  res.render("books/list", {
    title: "Books",
    books,
  });
}

async function getBookDetail(req, res) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(404).send("Book not found");
  }

  const book = await db.getBookById(id);

  if (!book) {
    return res.status(404).send("Book not found");
  }

  res.render("books/detail", {
    title: book.title,
    book,
  });
}

module.exports = {
  getBookList,
  getBookDetail,
};
