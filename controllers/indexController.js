function getHomePage(req, res) {
  res.render("index", {
    title: "Bookstore Inventory",
  });
}

module.exports = {
  getHomePage,
};
