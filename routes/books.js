const { Router } = require("express");
const bookController = require("../controllers/bookController");

const booksRouter = Router();

booksRouter.get("/", bookController.getBookList);
booksRouter.get("/new", bookController.getBookCreatePage);
booksRouter.post("/new", bookController.createBook);
booksRouter.get("/:id", bookController.getBookDetail);

module.exports = booksRouter;
