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
  const family_linking_close = document.querySelector(".family-linking-close");

  const user_login_form = document.querySelector("#form-login-user");
  const user_signup_form = document.querySelector("#form-signup-user");
  const family_signup_form = document.querySelector("#form-signup-family");
  const family_linking_form = document.querySelector("#form-linking-family");

  const family_linking_media = document.querySelector("#family-linking");

  const user_validation_failed = document.querySelector(
    "#user-validation-failed"
  );
  const user_validation_success = document.querySelector(
    "#user-validation-success"
  );

  const family_validation_failed = document.querySelector(
    "#family-validation-failed"
  );
  const family_validation_success = document.querySelector(
    "#family-validation-success"
  );

  const user_login_failed = document.querySelector("#user-login-failed");

  const family_linking_failed = document.querySelector(
    "#family-linking-failed"
  );

  // Code Flow:
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

  user_signup_form.addEventListener("submit", userCreationPOST);
  family_signup_form.addEventListener("submit", familyCreationPOST);
  user_login_form.addEventListener("submit", userLoginPOST);

  setFamilyName(localStorage.getItem("family_id"));

  // Functions:
  // User Creation POST Request
  async function userCreationPOST(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);

    const response = await fetch("../auth/users/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(Object.fromEntries(formData)),
    });

    const statusCode = response.status;

    if (statusCode >= 400 && statusCode <= 599) {
      const responseData = await response.json();
      user_validation_success.innerHTML = "";
      user_validation_failed.innerHTML = "";
      messages = Object.values(responseData).flat();

      messages.forEach((message) => {
        const messageElement = document.createElement("div");
        messageElement.textContent = message;
        user_validation_failed.appendChild(messageElement);
      });
    } else {
      user_validation_failed.innerHTML = "";
      user_validation_success.innerHTML = "";
      const messageElement = document.createElement("div");
      messageElement.textContent = "Successfully Created User!";
      user_validation_success.appendChild(messageElement);
    }
  }

  // Family Creation POST Request
  async function familyCreationPOST(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);

    const response = await fetch("../tracker/families/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(Object.fromEntries(formData)),
    });

    const statusCode = response.status;

    if (statusCode >= 400 && statusCode <= 599) {
      const responseData = await response.json();
      family_validation_success.innerHTML = "";
      family_validation_failed.innerHTML = "";
      messages = Object.values(responseData).flat();

      messages.forEach((message) => {
        const messageElement = document.createElement("div");
        messageElement.textContent = message;
        family_validation_failed.appendChild(messageElement);
      });
    } else {
      const responseData = await response.json();
      family_validation_success.innerHTML = "";
      family_validation_failed.innerHTML = "";

      const messageElement = document.createElement("div");
      messageElement.textContent =
        "Succcessful! Please Notes down your family id for future reference:";
      family_validation_success.appendChild(messageElement);

      messages = Object.values(responseData).flat();

      const messageElementId = document.createElement("div");
      messageElementId.textContent = responseData.id;
      family_validation_success.appendChild(messageElementId);
    }
  }

  // User Login POST Request
  async function userLoginPOST(event) {
    event.preventDefault();
    let form = event.target;
    let formData = new FormData(form);

    let response = await fetch("../auth/jwt/create/?_cache=${cacheBuster}", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(Object.fromEntries(formData)),
    });

    let statusCode = response.status;

    if (statusCode >= 400 && statusCode <= 599) {
      user_login_failed.innerHTML = "";
      let messageElement = document.createElement("div");
      messageElement.textContent = "Username or password incorrect.";
      user_login_failed.appendChild(messageElement);
    } else {
      user_login_failed.innerHTML = "";
      let responseData = await response.json();
      localStorage.setItem("access_token", responseData.access);

      let IDResponse = await fetch("../tracker/my-profile/me/", {
        method: "GET",
        headers: {
          Authorization: `JWT ${localStorage.getItem("access_token")}`,
        },
      });

      let IDResponseData = await IDResponse.json();

      let family_id = IDResponseData.family_id;
      localStorage.setItem(
        "name",
        `${IDResponseData.first_name} ${IDResponseData.last_name}`
      );
      localStorage.setItem("member_id", `${IDResponseData.member_id}`);

      if (family_id === null) {
        closeAllModals();
        family_linking_media.classList.add("show");
        family_linking_media.style = "display: block;";
        linkFamily();
      } else {
        localStorage.setItem("family_id", family_id);
        window.location.assign("../client/main");
      }
    }
  }

  // Helpers:

  // Hide All Modals for Front page
  function closeAllModals() {
    user_login_close.click();
    user_signup_close.click();
    family_signup_close.click();
    family_linking_close.click();
    family_linking_media.classList.remove("show");
    family_linking_media.style = "display: none;";
  }

  // Send Post request to link member to a family
  async function linkFamily() {
    family_linking_form.addEventListener("submit", async function (event) {
      event.preventDefault();
      const form = event.target;
      const formData = new FormData(form);

      const family_id = document.querySelector("#family-id").value;
      let response = await fetch(`../tracker/families/${family_id}/members/`, {
        method: "GET",
        headers: {
          Authorization: `JWT ${localStorage.getItem("access_token")}`,
        },
      });

      let responsePost = await fetch(
        `../tracker/families/${family_id}/members/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            member_id: localStorage.getItem("member_id"),
          }),
        }
      );

      if (responsePost.status === 201) {
        localStorage.setItem("family_id", family_id);
        window.location.assign("../client/main");
      } else {
        family_linking_failed.innerHTML = "";
        const messageElement = document.createElement("div");
        messageElement.textContent =
          "Family ID entered incorrectly, or the user has already linked to a family.";
        family_linking_failed.appendChild(messageElement);
      }
    });
  }

  async function setFamilyName(family_id) {
    let response = await fetch(`../tracker/families/${family_id}/`, {
      method: "GET",
      headers: {
        Authorization: `JWT ${localStorage.getItem("access_token")}`,
      },
    });

    const responseData = await response.json();
    localStorage.setItem("family_name", responseData.name);
  }
});

// --------------------------------- Main Page ---------------------------------
// Authorization Check for Main Page
document.addEventListener("DOMContentLoaded", function () {
  const main_page = document.querySelector("#authenticated");
  const access_token = localStorage.getItem("access_token");
  const name_header = document.querySelector(".name");
  const family_header = document.querySelector(".subtitle");

  name_header.textContent = localStorage.getItem("name");
  family_header.textContent = `@${localStorage.getItem("family_name")}`;

  if (access_token === null) {
    main_page.style.display = "none";
  } else {
    main_page.style.display = "block";
  }
});
