document.addEventListener("DOMContentLoaded", function () {
  const arrow = document.querySelector("#arrow");

  arrow.addEventListener("click", function () {
    window.scrollTo({
      top: window.innerHeight,
      behavior: "smooth",
    });
  });
});
