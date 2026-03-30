function normalizeStatus(status) {
  return status >= 400 && status < 600 ? status : 500;
}

function renderErrorPage(
  res,
  { status = 500, title, heading, message, stack = null },
) {
  return res.status(normalizeStatus(status)).render("error", {
    title,
    heading,
    message,
    stack,
  });
}

function renderNotFound(res, message = "The page you requested does not exist.") {
  return renderErrorPage(res, {
    status: 404,
    title: "Page Not Found",
    heading: "Page not found",
    message,
  });
}

module.exports = {
  renderErrorPage,
  renderNotFound,
};
