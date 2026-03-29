const { Router } = require("express");
const categoryController = require("../controllers/categoryController");

const categoriesRouter = Router();

categoriesRouter.get("/", categoryController.getCategoryList);
categoriesRouter.get("/new", categoryController.getCategoryCreatePage);
categoriesRouter.post("/new", categoryController.createCategory);
categoriesRouter.get("/:id/edit", categoryController.getCategoryEditPage);
categoriesRouter.post("/:id/edit", categoryController.updateCategory);
categoriesRouter.post("/:id/delete", categoryController.deleteCategory);
categoriesRouter.get("/:id", categoryController.getCategoryDetail);

module.exports = categoriesRouter;
