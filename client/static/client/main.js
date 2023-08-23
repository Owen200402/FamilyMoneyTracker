// in the future, check to see whether the token is set to determine if rendering the page
let isAuthenticated = true;

// Authorization Check for Main Page
document.addEventListener("DOMContentLoaded", function () {
  const main_page = document.querySelector("#authenticated");

  if (!isAuthenticated) {
    main_page.style.display = "none";
  } else {
    main_page.style.display = "block";
  }
});
