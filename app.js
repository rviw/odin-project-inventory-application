require("dotenv").config();

const express = require("express");
const app = express();

const path = require("node:path");

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

const assetsPath = path.join(__dirname, "public");
app.use(express.static(assetsPath));

app.use(express.urlencoded({ extended: true }));

const indexRouter = require("./routes/index");

app.use("/", indexRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, (error) => {
  if (error) {
    throw error;
  }
  console.log(`Express app listening on port ${PORT}`);
});
