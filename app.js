require("dotenv").config();

const express = require("express");
const path = require("node:path");
const { renderErrorPage, renderNotFound } = require("./utils/renderErrorPage");

const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

const assetsPath = path.join(__dirname, "public");
app.use(express.static(assetsPath));

app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  const currentPath = req.path;

  res.locals.isActive = (basePath) => {
    if (basePath === "/") {
      return currentPath === "/";
    }

    return (
      currentPath === basePath || currentPath.startsWith(`${basePath}/`)
    );
  };

  next();
});

const indexRouter = require("./routes/index");
const categoriesRouter = require("./routes/categories");
const authorsRouter = require("./routes/authors");
const booksRouter = require("./routes/books");

app.use("/", indexRouter);
app.use("/categories", categoriesRouter);
app.use("/authors", authorsRouter);
app.use("/books", booksRouter);

app.use((req, res) => {
  return renderNotFound(res);
});

app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  console.error(err);

  const isDevelopment = process.env.NODE_ENV !== "production";

  return renderErrorPage(res, {
    status: err.status || err.statusCode || 500,
    title: "Something went wrong",
    heading: "Something went wrong",
    message: isDevelopment
      ? err.message
      : "Something went wrong on the server.",
    stack: isDevelopment ? err.stack : null,
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, (error) => {
  if (error) {
    throw error;
  }
  console.log(`Express app listening on port ${PORT}`);
});
