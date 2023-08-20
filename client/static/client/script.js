let isAuthenticated = true; // in the future, check to see if the token is set to render the page rather than boolean

document.addEventListener("DOMContentLoaded", function () {
  main_page = document.querySelector("#authenticated");

  if (!isAuthenticated) {
    main_page.style.display = "none";
    console.log("User is not authenticated. Hiding main content.");
  } else {
    main_page.style.display = "block";
    console.log("User is not authenticated. Hiding main content.");
  }
});
