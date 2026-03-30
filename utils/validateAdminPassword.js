const { body } = require("express-validator");

function validateAdminPassword() {
  return body("admin_password")
    .trim()
    .notEmpty()
    .withMessage("Admin password is required.")
    .bail()
    .custom((value) => {
      const adminPassword = process.env.ADMIN_PASSWORD;

      if (!adminPassword) {
        throw new Error("Admin password is not configured.");
      }

      if (value !== adminPassword) {
        throw new Error("Incorrect admin password.");
      }

      return true;
    });
}

module.exports = {
  validateAdminPassword,
};
