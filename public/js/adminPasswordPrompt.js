document.querySelectorAll(".protected-action-form").forEach((form) => {
  form.addEventListener("submit", (event) => {
    const password = window.prompt("Enter the admin password to continue.", "");

    if (password === null) {
      event.preventDefault();
      return;
    }

    const adminPasswordInput = form.querySelector(
      'input[name="admin_password"]',
    );

    if (!adminPasswordInput) {
      event.preventDefault();
      return;
    }

    adminPasswordInput.value = password;
  });
});
