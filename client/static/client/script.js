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
      console.log("Success!");
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
      console.log(yearCollective);
      console.log(monthCollective);

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
});
