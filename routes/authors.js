const { Router } = require("express");
const authorController = require("../controllers/authorController");

const authorsRouter = Router();

authorsRouter.get("/", authorController.getAuthorList);
authorsRouter.get("/new", authorController.getAuthorCreatePage);
authorsRouter.post("/new", authorController.createAuthor);
authorsRouter.get("/:id/edit", authorController.getAuthorEditPage);
authorsRouter.post("/:id/edit", authorController.updateAuthor);
authorsRouter.post("/:id/delete", authorController.deleteAuthor);
authorsRouter.get("/:id", authorController.getAuthorDetail);

module.exports = authorsRouter;
