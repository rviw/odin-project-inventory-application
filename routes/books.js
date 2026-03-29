const { Router } = require("express");
const bookController = require("../controllers/bookController");

const booksRouter = Router();

booksRouter.get("/", bookController.getBookList);
booksRouter.get("/:id", bookController.getBookDetail);

module.exports = booksRouter;
