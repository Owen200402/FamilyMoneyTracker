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
      const messages = Object.values(responseData).flat();

      messages.forEach((message) => {
        const messageElement = document.createElement("div");
        messageElement.textContent = message;
        user_validation_failed.appendChild(messageElement);
      });
    } else {
      user_validation_failed.innerHTML = "";
      user_validation_success.innerHTML = "";
      const messageElement = document.createElement("div");
      messageElement.textContent =
        "Successfully Created User! An email has sent to your mail inbox.";
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
      const messages = Object.values(responseData).flat();

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

      const messages = Object.values(responseData).flat();

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
      messageElement.textContent = "Your username or password is incorrect.";
      user_login_failed.appendChild(messageElement);
    } else {
      user_login_failed.innerHTML = "";
      let responseData = await response.json();
      localStorage.setItem("access_token", responseData.access);

      // Fetch access_token member_id, name and family_id
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
      localStorage.setItem("email", `${IDResponseData.email}`);
      localStorage.setItem("generation", `${IDResponseData.generation}`);

      if (family_id === null) {
        closeAllModals();
        family_linking_media.classList.add("show");
        family_linking_media.style = "display: block;";
        linkFamily();
      } else {
        localStorage.setItem("family_id", family_id);
        await setFamilyName(localStorage.getItem("family_id"));
        window.location.assign("../client/main");
      }

      await setFamilyName(localStorage.getItem("family_id"));
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
document.addEventListener("DOMContentLoaded", async function () {
  // Constants:
  const main_page = document.querySelector("#authenticated");
  const access_token = localStorage.getItem("access_token");
  const name_header = document.querySelector(".name");
  const family_header = document.querySelector(".subtitle");
  const formCollective = document.querySelector(".filtering-collective");
  const formIndividual = document.querySelector(".filtering-individual");
  const yearSelectCollective = document.getElementById("yearSelectCollective");
  const monthSelectCollective = document.getElementById(
    "monthSelectCollective"
  );
  const yearSelectIndividual = document.getElementById("yearSelectIndividual");
  const monthSelectIndividual = document.getElementById(
    "monthSelectIndividual"
  );

  // Global Variables:
  let yearCollective = "";
  let monthCollective = "";
  let yearIndividual = "";
  let monthIndividual = "";
  let chartList = [];

  let dataFamilyIncomeByProduct = [];
  let dataFamilyIncomeByProductValue = 0;
  let dataFamilyExpensesByProduct = [];
  let dataFamilyExpensesByProductValue = 0;

  let dataFamilyIncomeByPerson = [];
  let dataFamilyExpensesByPerson = [];
  let familyMembersForEarnings = [];
  let familyMembersForExpenses = [];

  let dataMemberIncomeByProduct = [];
  let dataMemberIncomeByProductValue = 0;
  let dataMemberExpensesByProduct = [];
  let dataMemberExpensesByProductValue = 0;

  let memberCount = {};

  let trendDates = [];
  let incomeTrend = [];
  let expensesTrend = [];
  let queryStringForIncomeTrend = [];
  let queryStringForExpensesTrend = [];

  let currentYearIncome = 0;
  let currentYearExpenses = 0;
  let queryStringForCurrentYearIncome = [];
  let queryStringForCurrentYearExpenses = [];

  // Button Affects for nav bar
  const family_button = document.querySelector(".family");
  const profile_button = document.querySelector(".profile");
  const collective_report_button = document.querySelector(".collective-report");
  const individual_report_button = document.querySelector(".individual-report");

  const activeSection = localStorage.getItem("activeSection");

  if (activeSection) {
    document.querySelectorAll("a").forEach((link) => {
      if (link.dataset.page === activeSection) {
        link.style.backgroundColor = "rgb(0, 170, 255)"; // Add a CSS class for active styling
      } else {
        link.style.backgroundColor = ""; // Remove the class for inactive styling
      }
    });
    showPage(activeSection);
  } else {
    collective_report_button.style.backgroundColor = "rgb(0, 170, 255)";
  }

  family_button.addEventListener("click", function () {
    this.style.backgroundColor = "rgb(0, 170, 255)";
    collective_report_button.style.backgroundColor = "";
    individual_report_button.style.backgroundColor = "";
    profile_button.style.backgroundColor = "";
  });

  profile_button.addEventListener("click", function () {
    this.style.backgroundColor = "rgb(0, 170, 255)";
    collective_report_button.style.backgroundColor = "";
    individual_report_button.style.backgroundColor = "";
    family_button.style.backgroundColor = "";
  });

  collective_report_button.addEventListener("click", function () {
    this.style.backgroundColor = "rgb(0, 170, 255)";
    individual_report_button.style.backgroundColor = "";
    family_button.style.backgroundColor = "";
    profile_button.style.backgroundColor = "";
  });

  individual_report_button.addEventListener("click", function () {
    this.style.backgroundColor = "rgb(0, 170, 255)";
    collective_report_button.style.backgroundColor = "";
    family_button.style.backgroundColor = "";
    profile_button.style.backgroundColor = "";
  });

  // Hide Page Content and Show Only Parts Necessary
  function showPage(page) {
    document.querySelectorAll(".right-screen").forEach((screen) => {
      screen.style.display = "none";
    });

    document.querySelector(`#${page}`).style.display = "flex";
    document.querySelector(`#${page}`).style.flexDirection = "row";
    document.querySelector(`#${page}`).style.flexWrap = "wrap";
    document.querySelector(`#${page}`).style.justifyContent = "center";
    document.querySelector(`#${page}`).style.alignItems = "center";
  }

  document.querySelectorAll("a").forEach((link) => {
    link.onclick = function () {
      showPage(this.dataset.page);
      localStorage.setItem("activeSection", this.dataset.page);
    };
  });

  // Page Rendering
  name_header.textContent = localStorage.getItem("name");
  family_header.textContent = `@${localStorage.getItem("family_name")}`;

  if (access_token === null) {
    main_page.style.display = "none";
  } else {
    main_page.style.display = "block";
  }

  await setForm();
  await setProfileInfo();
  await getImage();
  await makeMemberCards();

  await chartIncome();
  await chartExpenses();
  await chartIncomePerPerson();
  await chartExpensesPerPerson();
  await personChartIncome();
  await personChartExpenses();

  await graphEarningsTrend();
  await graphExpensesTrend();

  await formSubmit();
  await setSummary();

  // Functions and Helpers:

  // Main Page

  // Submit filtering affects
  async function formSubmit() {
    formCollective.addEventListener("submit", async (e) => {
      e.preventDefault();
      yearCollective = yearSelectCollective.value;
      monthCollective = monthSelectCollective.value;

      // Destory charts before redrawing them
      for (let item of chartList) {
        item.destroy();
      }

      // Also reset all the variables
      dataFamilyIncomeByProduct = [];
      dataFamilyIncomeByProductValue = 0;
      dataFamilyExpensesByProduct = [];
      dataFamilyExpensesByProductValue = 0;

      dataMemberIncomeByProduct = [];
      dataMemberIncomeByProductValue = 0;
      dataMemberExpensesByProduct = [];
      dataMemberExpensesByProductValue = 0;

      dataFamilyIncomeByPerson = [];
      dataFamilyExpensesByPerson = [];
      familyMembersForEarnings = [];
      familyMembersForExpenses = [];

      memberCount = [];

      trendDates = [];
      incomeTrend = [];
      expensesTrend = [];
      queryStringForIncomeTrend = [];
      queryStringForExpensesTrend = [];

      currentYearIncome = 0;
      currentYearExpenses = 0;
      queryStringForCurrentYearIncome = [];
      queryStringForCurrentYearExpenses = [];

      await setForm();
      await setProfileInfo();

      await getImage();
      await makeMemberCards();

      await chartIncome();
      await chartExpenses();
      await chartIncomePerPerson();
      await chartExpensesPerPerson();

      await personChartIncome();
      await personChartExpenses();
      await graphEarningsTrend();
      await graphExpensesTrend();

      await setSummary();
    });

    formIndividual.addEventListener("submit", async (e) => {
      e.preventDefault();
      yearIndividual = yearSelectIndividual.value;
      monthIndividual = monthSelectIndividual.value;

      // Destory charts before redrawing them
      for (let item of chartList) {
        item.destroy();
      }

      // Also reset all the variables
      dataFamilyIncomeByProduct = [];
      dataFamilyIncomeByProductValue = 0;
      dataFamilyExpensesByProduct = [];
      dataFamilyExpensesByProductValue = 0;

      dataMemberIncomeByProduct = [];
      dataMemberIncomeByProductValue = 0;
      dataMemberExpensesByProduct = [];
      dataMemberExpensesByProductValue = 0;

      dataFamilyIncomeByPerson = [];
      dataFamilyExpensesByPerson = [];
      familyMembersForEarnings = [];
      familyMembersForExpenses = [];

      memberCount = [];

      await chartIncome();
      await chartExpenses();
      await chartIncomePerPerson();
      await chartExpensesPerPerson();
      await personChartIncome();
      await personChartExpenses();

      await setSummary();
    });
  }

  // Graph Earnings per Categories Chart
  async function chartIncome() {
    await getFamilyIncomeByProduct();
    const ctx = document.getElementById("chart-income");
    const xlabels = [];
    const chart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: dataFamilyIncomeByProduct.map((item) => item.label),
        datasets: [
          {
            label: "Family Income",
            data: dataFamilyIncomeByProduct.map((item) => item.value),
            backgroundColor: "rgba(0, 244, 150, 0.5)",
            borderColor: "rgba(0, 244, 150, 1.3)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          y: {
            ticks: {
              callback: function (value, index, ticks) {
                return "$" + value;
              },
            },
          },
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function (context) {
                var label = context.dataset.label || "";

                if (label) {
                  label += ": ";
                }
                if (context.parsed.y !== null) {
                  label += "$" + context.parsed.y;
                }

                return label;
              },
            },
          },
        },
      },
    });
    document.querySelector(
      "#total-earnings"
    ).textContent = `Total Earnings: $${dataFamilyIncomeByProductValue.toFixed(
      2
    )}`;
    chartList.push(chart);
  }

  // Graph Expenses Per Categories Chart
  async function chartExpenses() {
    await getFamilyExpensesByProduct();
    const ctx = document.getElementById("chart-expenses");
    const xlabels = [];
    const chart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: dataFamilyExpensesByProduct.map((item) => item.label),
        datasets: [
          {
            label: "Family Expenses",
            data: dataFamilyExpensesByProduct.map((item) => item.value),
            backgroundColor: "rgba(255, 99, 132, 0.2)",
            borderColor: "rgba(255, 99, 132, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          y: {
            ticks: {
              callback: function (value, index, ticks) {
                return "$" + value;
              },
            },
          },
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function (context) {
                var label = context.dataset.label || "";

                if (label) {
                  label += ": ";
                }
                if (context.parsed.y !== null) {
                  label += "$" + context.parsed.y;
                }

                return label;
              },
            },
          },
        },
      },
    });
    document.querySelector(
      "#total-expenses"
    ).textContent = `Total Expenses: $${dataFamilyExpensesByProductValue.toFixed(
      2
    )}`;
    chartList.push(chart);
  }

  // Graph Earnings Per Person Chart
  async function chartIncomePerPerson() {
    await getFamilyIncomeByPerson();
    const ctx = document.getElementById("chart-income-per-person");
    const chart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: familyMembersForEarnings,
        datasets: [
          {
            label: "Family Income By Person",
            data: dataFamilyIncomeByPerson,
            backgroundColor: [
              "rgb(255, 99, 132)",
              "rgb(54, 162, 235)",
              "rgb(255, 205, 86)",
              "rgb(245, 40, 226)",
              "rgb(245, 226, 0)",
            ],
            hoverOffset: 4,
          },
        ],
      },
      options: {
        plugins: {
          tooltip: {
            callbacks: {
              label: function (context) {
                var label = context.dataset.label || "";

                if (label) {
                  label += ": ";
                }
                if (context.parsed.y !== null) {
                  label += "$" + context.parsed;
                }

                return label;
              },
            },
          },
        },
      },
    });
    chartList.push(chart);
  }

  // Graph Expense Per Person Chart
  async function chartExpensesPerPerson() {
    await getFamilyExpensesByPerson();
    const ctx = document.getElementById("chart-expenses-per-person");
    const chart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: familyMembersForExpenses,
        datasets: [
          {
            label: "Family Expenses By Person",
            data: dataFamilyExpensesByPerson,
            backgroundColor: [
              "rgb(255, 99, 132)",
              "rgb(54, 162, 235)",
              "rgb(255, 205, 86)",
              "rgb(245, 40, 226)",
              "rgb(245, 226, 0)",
            ],
            hoverOffset: 4,
          },
        ],
      },
      options: {
        plugins: {
          tooltip: {
            callbacks: {
              label: function (context) {
                var label = context.dataset.label || "";

                if (label) {
                  label += ": ";
                }
                if (context.parsed.y !== null) {
                  label += "$" + context.parsed;
                }

                return label;
              },
            },
          },
        },
      },
    });
    chartList.push(chart);
  }

  // Graph Earnings By Categories For Person
  async function personChartIncome() {
    await getMemberIncomeByProduct();
    const ctx = document.getElementById("individual-chart-income");
    const xlabels = [];
    const chart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: dataMemberIncomeByProduct.map((item) => item.label),
        datasets: [
          {
            label: "Member Income",
            data: dataMemberIncomeByProduct.map((item) => item.value),
            backgroundColor: "rgba(0, 244, 150, 0.5)",
            borderColor: "rgba(0, 244, 150, 1.3)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          y: {
            ticks: {
              callback: function (value, index, ticks) {
                return "$" + value;
              },
            },
          },
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function (context) {
                var label = context.dataset.label || "";

                if (label) {
                  label += ": ";
                }
                if (context.parsed.y !== null) {
                  label += "$" + context.parsed.y;
                }

                return label;
              },
            },
          },
        },
      },
    });
    document.querySelector(
      "#individual-total-earnings"
    ).textContent = `Total Earnings: $${dataMemberIncomeByProductValue.toFixed(
      2
    )}`;
    chartList.push(chart);
  }

  // Graph Expenses By Categories For Person
  async function personChartExpenses() {
    await getMemberExpensesByProduct();
    const ctx = document.getElementById("individual-chart-expenses");
    const xlabels = [];
    const chart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: dataMemberExpensesByProduct.map((item) => item.label),
        datasets: [
          {
            label: "Member Expenses",
            data: dataMemberExpensesByProduct.map((item) => item.value),
            backgroundColor: "rgba(255, 99, 132, 0.2)",
            borderColor: "rgba(255, 99, 132, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          y: {
            ticks: {
              callback: function (value, index, ticks) {
                return "$" + value;
              },
            },
          },
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function (context) {
                var label = context.dataset.label || "";

                if (label) {
                  label += ": ";
                }
                if (context.parsed.y !== null) {
                  label += "$" + context.parsed.y;
                }

                return label;
              },
            },
          },
        },
      },
    });
    document.querySelector(
      "#individual-total-expenses"
    ).textContent = `Total Earnings: $${dataMemberExpensesByProductValue.toFixed(
      2
    )}`;
    chartList.push(chart);
  }

  // Earnings Trend for Persons
  async function graphEarningsTrend() {
    await getYearlyTrendData();
    const ctx = document.getElementById("chart-earnings-trend");
    const xlabels = [];
    const chart = new Chart(ctx, {
      type: "line",
      data: {
        labels: trendDates,
        datasets: [
          {
            label: "Earnings Trend",
            data: incomeTrend,
            backgroundColor: "rgba(0, 244, 150, 0.5)",
            borderColor: "rgba(0, 244, 150, 1.3)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          y: {
            ticks: {
              callback: function (value, index, ticks) {
                return "$" + value;
              },
            },
          },
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function (context) {
                var label = context.dataset.label || "";

                if (label) {
                  label += ": ";
                }
                if (context.parsed.y !== null) {
                  label += "$" + context.parsed.y;
                }

                return label;
              },
            },
          },
        },
      },
    });
  }

  // Expenses Trend for Persons
  async function graphExpensesTrend() {
    const ctx = document.getElementById("chart-expenses-trend");
    const xlabels = [];
    const chart = new Chart(ctx, {
      type: "line",
      data: {
        labels: trendDates,
        datasets: [
          {
            label: "Expenses Trend",
            data: expensesTrend,
            backgroundColor: "rgba(255, 99, 132, 0.2)",
            borderColor: "rgba(255, 99, 132, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          y: {
            ticks: {
              callback: function (value, index, ticks) {
                return "$" + value;
              },
            },
          },
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function (context) {
                var label = context.dataset.label || "";

                if (label) {
                  label += ": ";
                }
                if (context.parsed.y !== null) {
                  label += "$" + context.parsed.y;
                }

                return label;
              },
            },
          },
        },
      },
    });
  }

  // Getters and Setters
  async function getFamilyIncomeByProduct() {
    let response = await fetch(
      `../../tracker/families/${localStorage.getItem(
        "family_id"
      )}/earnings/?year=${yearCollective}&month=${monthCollective}`,
      {
        method: "GET",
        headers: {
          Authorization: `JWT ${localStorage.getItem("access_token")}`,
        },
      }
    );
    const responseJson = await response.json();
    const responseData = responseJson.results;

    for (const item of responseData) {
      let result = { label: item.received_from, value: item.monetary_value };
      dataFamilyIncomeByProductValue += item.monetary_value;
      dataFamilyIncomeByProduct.push(result);
    }
  }

  async function getFamilyExpensesByProduct() {
    let response = await fetch(
      `../../tracker/families/${localStorage.getItem(
        "family_id"
      )}/expenses/?year=${yearCollective}&month=${monthCollective}`,
      {
        method: "GET",
        headers: {
          Authorization: `JWT ${localStorage.getItem("access_token")}`,
        },
      }
    );
    const responseJson = await response.json();
    const responseData = responseJson.results;

    for (const item of responseData) {
      let result = { label: item.paid_to, value: item.monetary_value };
      dataFamilyExpensesByProductValue += item.monetary_value;
      dataFamilyExpensesByProduct.push(result);
    }
  }

  async function getFamilyIncomeByPerson() {
    let response = await fetch(
      `../../tracker/families/${localStorage.getItem(
        "family_id"
      )}/earnings/?year=${yearCollective}&month=${monthCollective}`,
      {
        method: "GET",
        headers: {
          Authorization: `JWT ${localStorage.getItem("access_token")}`,
        },
      }
    );
    const responseJson = await response.json();
    const responseData = responseJson.results;
    let dictionary = {};

    for (const item of responseData) {
      if (item.receiver in dictionary) {
        dictionary[item.receiver] += item.monetary_value;
        memberCount[item.receiver] += 1;
      } else {
        dictionary[item.receiver] = item.monetary_value;
        memberCount[item.receiver] = 1;
      }
    }

    for (const item in dictionary) {
      familyMembersForEarnings.push(item);
      dataFamilyIncomeByPerson.push(dictionary[item]);
    }
  }

  async function getFamilyExpensesByPerson() {
    let response = await fetch(
      `../../tracker/families/${localStorage.getItem(
        "family_id"
      )}/expenses/?year=${yearCollective}&month=${monthCollective}`,
      {
        method: "GET",
        headers: {
          Authorization: `JWT ${localStorage.getItem("access_token")}`,
        },
      }
    );
    const responseJson = await response.json();
    const responseData = responseJson.results;
    let dictionary = {};

    for (const item of responseData) {
      if (item.sender in dictionary) {
        dictionary[item.sender] += item.monetary_value;
        memberCount[item.sender] += 1;
      } else {
        dictionary[item.sender] = item.monetary_value;
        memberCount[item.sender] = 1;
      }
    }

    for (const item in dictionary) {
      familyMembersForExpenses.push(item);
      dataFamilyExpensesByPerson.push(dictionary[item]);
    }
  }

  async function getMemberIncomeByProduct() {
    let response = await fetch(
      `../../tracker/families/${localStorage.getItem(
        "family_id"
      )}/members/${localStorage.getItem(
        "member_id"
      )}/earnings/?year=${yearIndividual}&month=${monthIndividual}`,
      {
        method: "GET",
        headers: {
          Authorization: `JWT ${localStorage.getItem("access_token")}`,
        },
      }
    );
    const responseJson = await response.json();
    const responseData = responseJson.results;

    for (const item of responseData) {
      let result = { label: item.received_from, value: item.monetary_value };
      dataMemberIncomeByProductValue += item.monetary_value;
      dataMemberIncomeByProduct.push(result);
    }
  }

  async function getMemberExpensesByProduct() {
    let response = await fetch(
      `../../tracker/families/${localStorage.getItem(
        "family_id"
      )}/members/${localStorage.getItem(
        "member_id"
      )}/expenses/?year=${yearIndividual}&month=${monthIndividual}`,
      {
        method: "GET",
        headers: {
          Authorization: `JWT ${localStorage.getItem("access_token")}`,
        },
      }
    );
    const responseJson = await response.json();
    const responseData = responseJson.results;

    for (const item of responseData) {
      let result = { label: item.paid_to, value: item.monetary_value };
      dataMemberExpensesByProductValue += item.monetary_value;
      dataMemberExpensesByProduct.push(result);
    }
  }

  function setSummary() {
    let net = dataFamilyIncomeByProductValue - dataFamilyExpensesByProductValue;
    let roundedNet = net.toFixed(2);
    document.querySelector(
      ".net-record"
    ).textContent = `Net Record: $${roundedNet}`;

    let member = null;
    let count = 0;
    let sum = 0;
    for (const m in memberCount) {
      if (memberCount[m] > count) {
        member = m;
        count = memberCount[m];
      }
      sum++;
    }

    document.querySelector(
      ".most-frequent-member"
    ).textContent = `Most Frequent Contributor: ${member}`;

    document.querySelector(
      ".number-of-commits"
    ).textContent = `Number of Members Contributed: ${sum}`;
  }

  async function getYearlyTrendData() {
    const date = new Date();
    let lastMonth = date.getMonth() + 2;
    let lastYear = date.getFullYear() - 1;

    for (let i = 0; i < 12; i++) {
      trendDates.push(`${lastYear}.${lastMonth}`);
      queryStringForIncomeTrend.push(
        `../../tracker/families/${localStorage.getItem(
          "family_id"
        )}/members/${localStorage.getItem(
          "member_id"
        )}/earnings/?year=${lastYear}&month=${lastMonth}`
      );
      queryStringForExpensesTrend.push(
        `../../tracker/families/${localStorage.getItem(
          "family_id"
        )}/members/${localStorage.getItem(
          "member_id"
        )}/expenses/?year=${lastYear}&month=${lastMonth}`
      );

      if (lastMonth === 12) {
        lastMonth = 1;
        lastYear++;
      } else {
        lastMonth++;
      }
    }

    for (const queryString of queryStringForIncomeTrend) {
      let response = await fetch(queryString, {
        method: "GET",
        headers: {
          Authorization: `JWT ${localStorage.getItem("access_token")}`,
        },
      });
      const responseJson = await response.json();
      const responseData = responseJson.results;

      if (responseData.length === 0) {
        incomeTrend.push(0);
      } else {
        let count = 0;

        for (const item of responseData) {
          count += item.monetary_value;
        }
        incomeTrend.push(count);
      }
    }

    for (const queryString of queryStringForExpensesTrend) {
      let response = await fetch(queryString, {
        method: "GET",
        headers: {
          Authorization: `JWT ${localStorage.getItem("access_token")}`,
        },
      });
      const responseJson = await response.json();
      const responseData = responseJson.results;

      if (responseData.length === 0) {
        expensesTrend.push(0);
      } else {
        let count = 0;

        for (const item of responseData) {
          count += item.monetary_value;
        }
        expensesTrend.push(count);
      }
    }
  }

  // Tracker Page Render:
  const image_uploading_form = document.querySelector("#form-image-modal");

  image_uploading_form.addEventListener("submit", uploadProfileImage);

  // Set up the form
  async function setForm() {
    const main_forms = document.querySelectorAll(".main-form");

    const earningsRadio = document.querySelector("#earningsRadio");
    const expensesRadio = document.querySelector("#expensesRadio");

    const add_earnings_form = document.querySelector("#add-earnings");
    const add_expenses_form = document.querySelector("#add-expenses");
    const addItemRadio = document.querySelector("#add-item-btn");

    const mod_earnings_form = document.querySelector("#mod-earnings");
    const mod_expenses_form = document.querySelector("#mod-expenses");
    const modItemRadio = document.querySelector("#mod-item-btn");

    const del_earnings_form = document.querySelector("#del-earnings");
    const del_expenses_form = document.querySelector("#del-expenses");
    const deleteItemRadio = document.querySelector("#delete-item-btn");

    const earnings_collection = document.querySelector(".earnings-collection");
    const expenses_collection = document.querySelector(".expenses-collection");
    const del_earnings_collection = document.querySelector(
      ".del-earnings-collection"
    );
    const del_expenses_collection = document.querySelector(
      ".del-expenses-collection"
    );

    // parallel arrays for keeping track of ids and corresponding titles
    const earningIds = [];
    const earningTitles = [];
    const expenseIds = [];
    const expenseTitles = [];

    // Listening to events to open the right form:
    const checkRadioButtonState = async function () {
      // add
      if (addItemRadio.checked) {
        hideForms();

        if (earningsRadio.checked) {
          add_earnings_form.hidden = false;
        } else if (expensesRadio.checked) {
          add_expenses_form.hidden = false;
        }
      } // mod
      else if (modItemRadio.checked) {
        hideForms();
        if (earningsRadio.checked) {
          mod_earnings_form.hidden = false;
        } else if (expensesRadio.checked) {
          mod_expenses_form.hidden = false;
        }
      } // delete
      else if (deleteItemRadio.checked) {
        hideForms();
        if (earningsRadio.checked) {
          del_earnings_form.hidden = false;
        } else if (expensesRadio.checked) {
          del_expenses_form.hidden = false;
        }
      }
    };
    setInterval(checkRadioButtonState, 10);

    await generatePersonalEarnings();
    await generatePersonalExpenses();

    // Event Listeners for submit buttons
    add_earnings_form.addEventListener("submit", postEarnings);
    add_expenses_form.addEventListener("submit", postExpenses);
    mod_earnings_form.addEventListener("submit", patchEarnings);
    mod_expenses_form.addEventListener("submit", patchExpenses);
    del_earnings_form.addEventListener("submit", delEarnings);
    del_expenses_form.addEventListener("submit", delExpenses);

    // Helpers:

    // hide all unrelated forms
    function hideForms() {
      main_forms.forEach((f) => {
        f.hidden = true;
      });
    }

    // post the earning entered by the user to the server
    async function postEarnings(event) {
      const succeeded = document.querySelector("#submit-earnings-succeeded");
      const failed = document.querySelector("#submit-earnings-failed");

      event.preventDefault();
      const form = event.target;
      const formData = new FormData(form);

      let response = await fetch(
        `../../tracker/families/${localStorage.getItem(
          "family_id"
        )}/members/${localStorage.getItem("member_id")}/earnings/`,
        {
          method: "POST",
          headers: {
            Authorization: `JWT ${localStorage.getItem("access_token")}`,
          },
          body: formData,
        }
      );
      const statusCode = response.status;

      let responseData = await response.json();

      if ((statusCode >= 400) & (statusCode <= 599)) {
        failed.innerHTML = "";
        succeeded.innerHTML = "";
        const messages = responseData.results;

        messages.forEach((message) => {
          const messageElement = document.createElement("div");
          messageElement.textContent = message;
          failed.appendChild(messageElement);
        });
      } else {
        failed.innerHTML = "";
        succeeded.innerHTML = "";
        const messageElement = document.createElement("div");
        messageElement.textContent = "Successfully Added to Record";
        succeeded.appendChild(messageElement);
        setTimeout(() => {
          location.reload();
        }, 1500);
      }
    }

    // post the earning entered by the user to the server
    async function postExpenses(event) {
      const succeeded = document.querySelector("#submit-expenses-succeeded");
      const failed = document.querySelector("#submit-expenses-failed");

      event.preventDefault();
      const form = event.target;
      const formData = new FormData(form);

      let response = await fetch(
        `../../tracker/families/${localStorage.getItem(
          "family_id"
        )}/members/${localStorage.getItem("member_id")}/expenses/`,
        {
          method: "POST",
          headers: {
            Authorization: `JWT ${localStorage.getItem("access_token")}`,
          },
          body: formData,
        }
      );
      const statusCode = response.status;

      let responseData = await response.json();
      console.log(responseData);

      if ((statusCode >= 400) & (statusCode <= 599)) {
        failed.innerHTML = "";
        succeeded.innerHTML = "";
        const messages = responseData.results;

        messages.forEach((message) => {
          const messageElement = document.createElement("div");
          messageElement.textContent = message;
          failed.appendChild(messageElement);
        });
      } else {
        failed.innerHTML = "";
        succeeded.innerHTML = "";
        const messageElement = document.createElement("div");
        messageElement.textContent = "Successfully Added to Record";
        succeeded.appendChild(messageElement);
        setTimeout(() => {
          location.reload();
        }, 1500);
      }
    }

    // put the earning entered by the user to the server
    async function patchEarnings(event) {
      const succeeded = document.querySelector("#mod-earnings-succeeded");
      const failed = document.querySelector("#mod-earnings-failed");
      const earnings = document.querySelectorAll(".form-check-earnings");
      let itemId = 0;

      event.preventDefault();
      const form = event.target;
      const formData = new FormData(form);

      earnings.forEach((e) => {
        if (e.checked) {
          itemId = e.getAttribute("data-id");
        }
      });

      if (itemId === 0) {
        const messageElement = document.createElement("div");
        messageElement.textContent = "Select an Item first!";
        failed.appendChild(messageElement);
        return;
      }

      let response = await fetch(
        `../../tracker/families/${localStorage.getItem(
          "family_id"
        )}/members/${localStorage.getItem("member_id")}/earnings/${itemId}/`,
        {
          method: "PATCH",
          headers: {
            Authorization: `JWT ${localStorage.getItem("access_token")}`,
          },
          body: formData,
        }
      );
      const statusCode = response.status;

      let responseData = await response.json();

      if ((statusCode >= 400) & (statusCode <= 599)) {
        failed.innerHTML = "";
        succeeded.innerHTML = "";
        const messages = Object.values(responseData).flat();

        messages.forEach((message) => {
          const messageElement = document.createElement("div");
          messageElement.textContent = message;
          failed.appendChild(messageElement);
        });
      } else {
        failed.innerHTML = "";
        succeeded.innerHTML = "";
        const messageElement = document.createElement("div");
        messageElement.textContent = "Successfully Modified the Record";
        succeeded.appendChild(messageElement);
        setTimeout(() => {
          location.reload();
        }, 1500);
      }
    }

    // put the expenses entered by the user to the server
    async function patchExpenses(event) {
      const succeeded = document.querySelector("#mod-expenses-succeeded");
      const failed = document.querySelector("#mod-expenses-failed");
      const expenses = document.querySelectorAll(".form-check-expenses");
      let itemId = 0;

      event.preventDefault();
      const form = event.target;
      const formData = new FormData(form);

      expenses.forEach((e) => {
        if (e.checked) {
          itemId = e.getAttribute("data-id");
        }
      });

      if (itemId === 0) {
        const messageElement = document.createElement("div");
        messageElement.textContent = "Select an Item first!";
        failed.appendChild(messageElement);
        return;
      }

      let response = await fetch(
        `../../tracker/families/${localStorage.getItem(
          "family_id"
        )}/members/${localStorage.getItem("member_id")}/expenses/${itemId}/`,
        {
          method: "PATCH",
          headers: {
            Authorization: `JWT ${localStorage.getItem("access_token")}`,
          },
          body: formData,
        }
      );
      const statusCode = response.status;

      let responseData = await response.json();

      if ((statusCode >= 400) & (statusCode <= 599)) {
        failed.innerHTML = "";
        succeeded.innerHTML = "";
        const messages = Object.values(responseData).flat();

        messages.forEach((message) => {
          const messageElement = document.createElement("div");
          messageElement.textContent = message;
          failed.appendChild(messageElement);
        });
      } else {
        failed.innerHTML = "";
        succeeded.innerHTML = "";
        const messageElement = document.createElement("div");
        messageElement.textContent = "Successfully Modified the Record";
        succeeded.appendChild(messageElement);
        setTimeout(() => {
          location.reload();
        }, 1500);
      }
    }

    // del the earnings
    async function delEarnings(event) {
      const succeeded = document.querySelector("#del-earnings-succeeded");
      const failed = document.querySelector("#del-earnings-failed");
      const earnings = document.querySelectorAll(".form-check-earnings");
      let itemId = 0;

      event.preventDefault();

      earnings.forEach((e) => {
        if (e.checked) {
          itemId = e.getAttribute("data-id");
        }
      });

      if (itemId === 0) {
        const messageElement = document.createElement("div");
        messageElement.textContent = "Select an Item first!";
        failed.appendChild(messageElement);
        return;
      }

      let response = await fetch(
        `../../tracker/families/${localStorage.getItem(
          "family_id"
        )}/members/${localStorage.getItem("member_id")}/earnings/${itemId}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `JWT ${localStorage.getItem("access_token")}`,
          },
        }
      );
      const statusCode = response.status;
      console.log(statusCode);

      if ((statusCode >= 400) & (statusCode <= 599)) {
        failed.innerHTML = "";
        succeeded.innerHTML = "";
        const messages = Object.values(responseData).flat();

        messages.forEach((message) => {
          const messageElement = document.createElement("div");
          messageElement.textContent = message;
          failed.appendChild(messageElement);
        });
      } else {
        failed.innerHTML = "";
        succeeded.innerHTML = "";
        const messageElement = document.createElement("div");
        messageElement.textContent = "Successfully Deleted from Record";
        succeeded.appendChild(messageElement);
        setTimeout(() => {
          location.reload();
        }, 1500);
      }
    }

    // del the expenses
    async function delExpenses(event) {
      const succeeded = document.querySelector("#del-expenses-succeeded");
      const failed = document.querySelector("#del-expenses-failed");
      const earnings = document.querySelectorAll(".form-check-expenses");
      let itemId = 0;

      event.preventDefault();

      earnings.forEach((e) => {
        if (e.checked) {
          itemId = e.getAttribute("data-id");
        }
      });

      if (itemId === 0) {
        const messageElement = document.createElement("div");
        messageElement.textContent = "Select an Item first!";
        failed.appendChild(messageElement);
        return;
      }

      let response = await fetch(
        `../../tracker/families/${localStorage.getItem(
          "family_id"
        )}/members/${localStorage.getItem("member_id")}/expenses/${itemId}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `JWT ${localStorage.getItem("access_token")}`,
          },
        }
      );
      const statusCode = response.status;

      if ((statusCode >= 400) & (statusCode <= 599)) {
        failed.innerHTML = "";
        succeeded.innerHTML = "";
        const messages = Object.values(responseData).flat();

        messages.forEach((message) => {
          const messageElement = document.createElement("div");
          messageElement.textContent = message;
          failed.appendChild(messageElement);
        });
      } else {
        failed.innerHTML = "";
        succeeded.innerHTML = "";
        const messageElement = document.createElement("div");
        messageElement.textContent = "Successfully Deleted from Record";
        succeeded.appendChild(messageElement);
        setTimeout(() => {
          location.reload();
        }, 1500);
      }
    }

    // generate the earnings on page as radio buttons
    async function generatePersonalEarnings() {
      await getEarnings();

      for (let i = 0; i < earningTitles.length; i++) {
        const div = document.createElement("div");
        div.classList.add("form-check");
        div.innerHTML = `
        <input
          class="form-check-input form-check-earnings"
          type="radio"
          name="flexRadioDefault"
          id="earnings${i}"
          data-id="${earningIds[i]}"
        />
        <label class="form-check-label" for="earnings${i}">
          <h5 style="color: rgb(23, 34, 164)">${earningTitles[i]}</h5>
        </label>
       `;

        const div2 = document.createElement("div");
        div2.classList.add("form-check");
        div2.innerHTML = `
        <input
          class="form-check-input form-check-earnings"
          type="radio"
          name="flexRadioDefault"
          id="earning${i}"
          data-id="${earningIds[i]}"
        />
        <label class="form-check-label" for="earning${i}">
          <h5 style="color: rgb(23, 34, 164)">${earningTitles[i]}</h5>
        </label>
       `;
        earnings_collection.appendChild(div);
        del_earnings_collection.appendChild(div2);
      }
    }

    // generate the expenses on page as radio buttons
    async function generatePersonalExpenses() {
      await getExpenses();

      for (let i = 0; i < expenseTitles.length; i++) {
        const div = document.createElement("div");
        div.classList.add("form-check");
        div.innerHTML = `
        <input
          class="form-check-input form-check-expenses"
          type="radio"
          name="flexRadioDefault"
          id="expenses${i}"
          data-id="${expenseIds[i]}"
        />
        <label class="form-check-label" for="expenses${i}">
          <h5 style="color: rgb(23, 34, 164)">${expenseTitles[i]}</h5>
        </label>
    `;
        const div2 = document.createElement("div");
        div2.classList.add("form-check");
        div2.innerHTML = `
        <input
          class="form-check-input form-check-expenses"
          type="radio"
          name="flexRadioDefault"
          id="expense${i}"
          data-id="${expenseIds[i]}"
        />
        <label class="form-check-label" for="expense${i}">
          <h5 style="color: rgb(23, 34, 164)">${expenseTitles[i]}</h5>
        </label>
    `;
        expenses_collection.appendChild(div);
        del_expenses_collection.appendChild(div2);
      }
    }

    // get current earnings
    async function getEarnings() {
      let response = await fetch(
        `../../tracker/families/${localStorage.getItem(
          "family_id"
        )}/members/${localStorage.getItem("member_id")}/earnings/`,
        {
          method: "GET",
          headers: {
            Authorization: `JWT ${localStorage.getItem("access_token")}`,
          },
        }
      );

      const responseJson = await response.json();
      const responseData = responseJson.results;

      for (let item of responseData) {
        earningIds.push(item.id);
        earningTitles.push(item.title);
      }
    }

    // get current expenses
    async function getExpenses() {
      let response = await fetch(
        `../../tracker/families/${localStorage.getItem(
          "family_id"
        )}/members/${localStorage.getItem("member_id")}/expenses/`,
        {
          method: "GET",
          headers: {
            Authorization: `JWT ${localStorage.getItem("access_token")}`,
          },
        }
      );

      const responseJson = await response.json();
      const responseData = responseJson.results;

      for (let item of responseData) {
        expenseIds.push(item.id);
        expenseTitles.push(item.title);
      }
    }
  }

  // Upload Profile Image Config with Amazon S3
  async function uploadProfileImage(event) {
    const failed = document.querySelector("#upload-failed");
    const succeeded = document.querySelector("#upload-succeeded");

    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);

    let responsePost = await fetch(
      `../../tracker/families/${localStorage.getItem(
        "family_id"
      )}/members/${localStorage.getItem("member_id")}/images/`,
      {
        method: "POST",
        headers: {},
        body: formData,
      }
    );

    const statusCode = responsePost.status;

    const responseData = await responsePost.json();

    if (statusCode >= 400 && statusCode <= 599) {
      failed.innerHTML = "";
      succeeded.innerHTML = "";
      const messages = Object.values(responseData).flat();

      messages.forEach((message) => {
        const messageElement = document.createElement("div");
        messageElement.textContent = message;
        failed.appendChild(messageElement);
      });
    } else {
      failed.innerHTML = "";
      succeeded.innerHTML = "";
      const messageElement = document.createElement("div");
      messageElement.textContent = "Successfully uploaded image";
      succeeded.appendChild(messageElement);

      getImage();
    }
  }

  // Getters and Setters
  async function getImage() {
    let imageResponse = await fetch(
      `../../tracker/families/${localStorage.getItem(
        "family_id"
      )}/members/${localStorage.getItem("member_id")}/images/`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    let imageResponseData = await imageResponse.json();
    let mostCurrentImage =
      imageResponseData[imageResponseData.length - 1].image;

    document
      .querySelector(".profile-image")
      .setAttribute("src", mostCurrentImage);
  }

  async function setProfileInfo() {
    let email = document.querySelector("#email");
    let name = document.querySelector("#name");
    let generation = document.querySelector("#generation");
    let total_earnings = document.querySelector("#total-earnings-current-year");
    let total_expenses = document.querySelector("#total-expenses-current-year");

    email.innerHTML += ` <b style="color: rgb(125, 34, 34)">${localStorage.getItem(
      "email"
    )}</b>`;
    name.innerHTML += ` <b style="color: rgb(125, 34, 34)">${localStorage.getItem(
      "name"
    )}</b>`;

    gen = localStorage.getItem("generation");
    if (gen === "G") {
      generation.innerHTML += ` <b style="color: rgb(125, 34, 34)">Grand Parent</b>`;
    } else if (gen === "C") {
      generation.innerHTML += ` <b style="color: rgb(125, 34, 34)">Child</b>`;
    } else {
      generation.innerHTML += ` <b style="color: rgb(125, 34, 34)">Parent</b>`;
    }
    await getCurrentYearOverallData();
    const date = new Date();
    let currentYear = date.getFullYear();
    total_earnings.innerHTML += ` ${currentYear} Total Earnings: <b style="color: rgb(125, 34, 34)">$${currentYearIncome}</b>`;
    total_expenses.innerHTML += ` ${currentYear} Total Expenses: <b style="color: rgb(125, 34, 34)">$${currentYearExpenses}</b>`;
  }

  async function getCurrentYearOverallData() {
    const date = new Date();
    let currentMonth = date.getMonth() + 1;
    let currentYear = date.getFullYear();

    for (let i = 1; i <= currentMonth; i++) {
      queryStringForCurrentYearIncome.push(
        `../../tracker/families/${localStorage.getItem(
          "family_id"
        )}/members/${localStorage.getItem(
          "member_id"
        )}/earnings/?year=${currentYear}&month=${i}`
      );
      queryStringForCurrentYearExpenses.push(
        `../../tracker/families/${localStorage.getItem(
          "family_id"
        )}/members/${localStorage.getItem(
          "member_id"
        )}/expenses/?year=${currentYear}&month=${i}`
      );
    }

    for (const queryString of queryStringForCurrentYearIncome) {
      let response = await fetch(queryString, {
        method: "GET",
        headers: {
          Authorization: `JWT ${localStorage.getItem("access_token")}`,
        },
      });
      const responseJson = await response.json();
      const responseData = responseJson.results;

      for (const item of responseData) {
        currentYearIncome += item.monetary_value;
      }
    }

    for (const queryString of queryStringForCurrentYearExpenses) {
      let response = await fetch(queryString, {
        method: "GET",
        headers: {
          Authorization: `JWT ${localStorage.getItem("access_token")}`,
        },
      });
      const responseJson = await response.json();
      const responseData = responseJson.results;

      for (const item of responseData) {
        currentYearExpenses += item.monetary_value;
      }
    }
  }

  // ------- Family Page --------
  unlink_btn = document.querySelectorAll(".unlink-btn");
  unlink_members();

  async function unlink_members() {
    unlink_btn.forEach((e) => {
      e.addEventListener("click", async function () {
        let response = await fetch(
          `../../tracker/families/${localStorage.getItem(
            "family_id"
          )}/members/${e.getAttribute("data-id")}/unlink-member/`,
          {
            method: "PUT",
            headers: {
              Authorization: `JWT ${localStorage.getItem("access_token")}`,
            },
          }
        );
        if (e.getAttribute("data-id") === localStorage.getItem("member_id")) {
          window.location.assign("../../client/");
        }
        if (response.status === 200) {
          await makeMemberCards();
          location.reload();
        }
      });
    });
  }

  async function makeMemberCards() {
    let nameArray = [];
    let generationArray = [];
    let imageUrlArray = [];
    let idArray = [];

    await retrieveMemberInfo(
      nameArray,
      generationArray,
      imageUrlArray,
      idArray
    );

    const cards_for_members = document.querySelector("#right-screen-members");

    for (let i = 0; i < nameArray.length; i++) {
      let message = "";
      if (String(idArray[i]) === localStorage.getItem("member_id")) {
        message =
          nameArray[i] + `<p style="color: green; display: inline"> (Me) </p>`;
        console.log(message);
      } else {
        message = nameArray[i];
      }

      let container = document.createElement("div");
      container.innerHTML = `<div class="card" style="width: 250px;">
            <img
              src=${imageUrlArray[i]}
              style="height: 250px; object-fit: cover;";
              class="card-image-top"
            />
            <div class="card-body">
              <h2 class="card-title member-name">${message}</h2>
              <h4 class="card-subtitle member-generation">${generationArray[i]}</h4>
              <div class="card-text">
                <div><button class="btn btn-sm btn-danger unlink-btn" data-id=${idArray[i]}>Unlink</button></div>
              </div>
            </div>
          </div>`;
      cards_for_members.appendChild(container);
    }
  }

  async function retrieveMemberInfo(
    nameArray,
    generationArray,
    imageUrlArray,
    idArray
  ) {
    let response = await fetch(
      `../../tracker/families/${localStorage.getItem("family_id")}/members/`,
      {
        method: "GET",
        headers: {
          Authorization: `JWT ${localStorage.getItem("access_token")}`,
        },
      }
    );

    const responseData = await response.json();
    const responseResult = responseData.results;

    for (let item of responseResult) {
      nameArray.push([`${item.first_name} ${item.last_name}`]);
      idArray.push(item.member_id);

      if (item.generation === "P") {
        generationArray.push("Parent");
      } else if (item.generation === "C") {
        generationArray.push("Child");
      } else {
        generationArray.push("Grand Parent");
      }

      if (item.images.length === 0) {
        imageUrlArray.push(
          "https://www.fluidsecure.com/wp-content/uploads/2023/02/Blank-Headshot.jpg"
        );
      } else {
        let lastImage = item.images[item.images.length - 1].image;
        imageUrlArray.push(lastImage);
      }
    }
  }
});
