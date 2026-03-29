const { Router } = require("express");
const bookController = require("../controllers/bookController");

const booksRouter = Router();

booksRouter.get("/", bookController.getBookList);
booksRouter.get("/new", bookController.getBookCreatePage);
booksRouter.post("/new", bookController.createBook);
booksRouter.get("/:id/edit", bookController.getBookEditPage);
booksRouter.post("/:id/edit", bookController.updateBook);
booksRouter.post("/:id/delete", bookController.deleteBook);
booksRouter.get("/:id", bookController.getBookDetail);

module.exports = booksRouter;
