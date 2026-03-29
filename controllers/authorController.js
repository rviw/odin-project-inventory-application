const db = require("../db/queries");

async function getAuthorList(req, res) {
  const authors = await db.getAllAuthors();

  res.render("authors/list", {
    title: "Authors",
    authors,
  });
}

async function getAuthorDetail(req, res) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
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

module.exports = {
  getAuthorList,
  getAuthorDetail,
};
