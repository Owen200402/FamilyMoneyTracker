let isAuthenticated = true; // in the future, check to see if the token is set to render the page rather than boolean
const family_register = document.querySelectorAll(".btn-family-register");
const user_register = document.querySelectorAll(".btn-user-register");
const user_login = document.querySelectorAll(".btn-user-login");

const user_login_btn = document.querySelector(".btn-user-login");
const user_signup_btn = document.querySelector(".btn-user-signup");
const family_signup_btn = document.querySelector(".btn-family-signup");

const user_login_close = document.querySelector(".user-login-close");
const user_signup_close = document.querySelector(".user-signup-close");
const family_signup_close = document.querySelector(".family-signup-close");

document.addEventListener("DOMContentLoaded", function () {
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
});

// Authorization Check for Main Page
document.addEventListener("DOMContentLoaded", function () {
  const main_page = document.querySelector("#authenticated");

  if (!isAuthenticated) {
    main_page.style.display = "none";
    console.log("User is not authenticated. Hiding main content.");
  } else {
    main_page.style.display = "block";
    console.log("User is not authenticated. Hiding main content.");
  }
});

function closeAllModals() {
  user_login_close.click();
  user_signup_close.click();
  family_signup_close.click();
}
