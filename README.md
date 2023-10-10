# Family Money Tracker

## Description:

A back-end management system with RESTful api to keep track with every family's earnings and expenses.

## Introduction:

Tracking personal earnings and expenses seems trivial; however, through time money flow shows more unexpected outcomes than expected
if we do not record down how much money we have spent or earned. Many people in this world are classified as "moonlight clan", meaning
they spend nearly all money every month to pay debts, cars and fulfill personal needs at the same time. However, we can be more clever
than this. By setting up goals and using data to track a family's money flow, people could plan their future by minimizing their expenses accordingly,
and Family Money Tracker comes into the rescue.

With Family Money Tracker, users can register accounts and have their unique family associated with them with just an activation code.
It is strongly encouraged to track money spent every day so that all the records from a family are visible to every member in this family.

**Major Technologies**: Python, Django, Djoser, Restful API, HTML, CSS, Bootstrap.

**Reasons for These Technologies**: Django comes with an admin page that serves as a purpose of service desk, which users could call and manage safety concerns
such as family member changes, safety-concerned deletion such as deleting a whole family's record that cannot be done
by a user. Also, Django's restful framework with Djoser url authentication ensures the safety of the webpage. Unauthorized users are not
permitted to view, change, or update any records and a user cannot view other family records other than theirs. Django also provides debug
toolbars which enabled developer to use ORM to reduce the SQL queries sent to the server to increase browser's running speed. A
longside with Python's performance test (Locust), its performance is ensured flawless when hundreds or thousands of people use it simultaneously.

## Usage:

_Note: It is designed mostly for front-end developers who wish to request for data from various API endpoints._

### URL:

https://moneytracker-prod-9941b1d428c3.herokuapp.com/client

### Base URL For Developers Accessing Endpoints

Ensure that when sending HTTP requests, you refer to the base URL. For reference, the base URL is the same as the home page's URL: https://moneytracker-prod-9941b1d428c3.herokuapp.com

### User Login and Authentication

1. Create a user through the authentication endpoint by providing first name, last name, password, and email. Append `/auth/users/` to the base URL.

2. After user creation, generate an access token through `/jwt/create/`. Remember to save the token locally using front-end techniques like LocalStorage in JavaScript.

   **IMPORTANT**: Unauthorized users cannot access certain endpoints. Authorized users can only access their own family and individual data.

### Family Creation

You can create a family by sending a request to the endpoint `/tracker/families/`. Provide the family name and a password. A family code will be generated for future secure access and management.

### Linking Members to Family

1. Extract the user's user ID by sending a request to `/tracker/my-profile/me/`.

2. Once a member is created, navigate to `/tracker/families/::family_id/` to view the family profile or rename it. Then go to `/tracker/families/::family_id/members/` and provide your member ID to link yourself to the family.

   **Note**: You can also unlink members by sending a POST request to `/tracker/families/::family_id/members/::member_id/unlink-member/`.

### Operating Family Member's Earnings & Expenses

1. To view earnings, expenses, and net income, navigate to `/tracker/families/::family_id/members/::member_id/earnings/`. Replace `earnings/` with `expenses/` or `records/` to view other data.

2. To post new earnings or expenses, follow the instructions and hit POST. You can update or delete earnings/expenses by navigating to `/tracker/families/::family_id/members/::member_id/earnings/::earning_id/`.

3. View an individual's net income by navigating to `/tracker/families/::family_id/members/::member_id/records/`. Sorting is possible using query strings.

### Viewing Family Records

To view all family member's earnings and expenses, navigate to `/tracker/families/::family_id/records/`. The family's net income is calculated and can be filtered by years and months.
