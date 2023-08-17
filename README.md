# Family Money Tracker

## Description:

A back-end management system with RESTful api to keep track with every family's income and expense.

## Introduction:

Tracking personal income and expense seems trivial; however, through time money flow shows more unexpected outcomes than expected
if we do not record down how much money we have spent or earned. Many people in this world are classified as "moonlight clan", meaning
they spend nearly all money every month to pay debts, cars and fulfill personal needs at the same time. However, we can be more clever
than this. By setting up goals and using data to track a family's money flow, people could plan their future by minimizing their expense accordingly,
and Family Money Tracker comes into the rescue.

With Family Money Tracker, users can register accounts and have their unique family associated with them with just an activation code.
It is strongly encouraged to track money spent every day so that all the records from a family are visible to every member in this family.

**Major Technologies**: Python, Django, Djoser Authentication, Restful API, HTML, CSS, Bootstrap.

**Reasons for These Technologies**: Django comes with an admin page that serves as a purpose of service desk, which users could call and manage safety concerns
such as family member changes, safety-concerned deletion such as deleting a whole family's record that cannot be done
by a user. Also, Django's restful framework with Djoser url authentication ensures the safety of the webpage. Unauthorized users are not
permitted to view, change, or update any records and a user cannot view other family records other than theirs. Django also provides debug
toolbars which enabled developer to use ORM to reduce the SQL queries sent to the server to increase browser's running speed. A
longside with Python's performance test (Locust), its performance is ensured flawless when hundreds or thousands of people use it simultaneously.

## Usage:

_Note: It is designed mostly for front-end developers who wish to request for data from various API endpoints._
