document.addEventListener("DOMContentLoaded", function () {
  // Constants
  const family_register = document.querySelectorAll(".btn-family-register");
  const user_register = document.querySelectorAll(".btn-user-register");
  const user_login = document.querySelectorAll(".btn-user-login");

  const user_login_btn = document.querySelector(".btn-user-login");
  const user_signup_btn = document.querySelector(".btn-user-signup");
  const family_signup_btn = document.querySelector(".btn-family-signup");

  const user_login_close = document.querySelector(".user-login-close");
  const user_signup_close = document.querySelector(".user-signup-close");
  const family_signup_close = document.querySelector(".family-signup-close");

  const username_register = document.querySelector("#username-register");
  const password_register = document.querySelector("#password-register");
  const email_register = document.querySelector("#email-register");
  const first_name_register = document.querySelector("#first-name-register");
  const last_name_register = document.querySelector("#last-name-register");

  const user_login_form = document.querySelector("#form-login-user");
  const user_signup_form = document.querySelector("#form-signup-user");
  const family_signup_form = document.querySelector("#form-signup-family");

  const user_validation = document.querySelector("#user-validation");

  // Cover Page Linking
  family_register.forEach((button) => {
    button.addEventListener("click", function (e) {
      closeAllModals();
      family_signup_btn.click();
    });
  });
  user_register.forEach((button) => {
    button.addEventListener("click", function (e) {
      closeAllModals();
      user_signup_btn.click();
    });
  });
  user_login.forEach((button) => {
    button.addEventListener("click", function (e) {
      closeAllModals();
      user_login_btn.click();
    });
  });

  // User Creation POST Request
  async function userCreationPOST(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);

    try {
      const response = await fetch("../auth/users/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(Object.fromEntries(formData)),
      });

      const responseData = await response.json();
      console.log("User created: ", responseData);
    } catch (error) {
      user_validation.textContent = Object.values(error).flat();
      console.error("Error: ", error);
    }
  }

  // Submit Event
  user_signup_form.addEventListener("submit", userCreationPOST);

  // Hide All Modals for Front page
  function closeAllModals() {
    user_login_close.click();
    user_signup_close.click();
    family_signup_close.click();
  }
});
