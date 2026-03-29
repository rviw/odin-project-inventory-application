const { Router } = require("express");
const authorController = require("../controllers/authorController");

const authorsRouter = Router();

authorsRouter.get("/", authorController.getAuthorList);
authorsRouter.get("/:id", authorController.getAuthorDetail);

module.exports = authorsRouter;
