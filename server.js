const express = require('express');
const inquirer = require('inquirer');
const mysql = require('mysql2');

const PORT = process.env.PORT || 3001;
const app = express();

const db = mysql.createConnection(
   {
      host: 'localhost',
      user: 'root',
      password: 'rootroot'
      database: 'employee_db'
   },
   console.log(`Connected to the employee_db database.`)
);
inquirer
.prompt([
   {
      type: 'list',
      messages: 'What would you like to do?',
      choices: ["View all departments", "View all roles", "View all employees", "Add a department", "Add a role", "Add an employee", "Update an employee role"],
      name: 'questions',
   }
])
.then((answers) => {
   displayTables(answers.questions);
});

const displayTables = (questions) => {
   if (questions === "View all departments") {
      return db.query('SELECT * FROM department', function (err, results) {
         console.log(results);
      });
   }
   else if (questions === "View all roles") {
      return db.query('SELECT * FROM role JOIN department ON role.department_id = department.id', function (err, results) {
         console.log(results);
      });
   }
   else if (questions === "View all employees") {
      return db.query(`
      SELECT
      employee.id,
      employee.first_name,
      employee.last_name,
      role.title,
      department.name AS department,
      role.salary,
      CONCAT(manager.first_name, ' ', manager.last_name) AS manager
      FROM employee
      JOIN role ON employee.role_id = role.id
      JOIN department ON role.department_id = department.id
      LEFT JOIN employee AS manager ON  employee.manager_id = manager.id;
      `, function (err, results) {
         console.log(results);
      });
   }
   else if (questions === "Add a department") {
      inquirer
      .prompt([
         {
            type: 'input',
            message: 'What is the name of the new department?',
            name: 'departmentName',
         },
      ])
      .then((answers) => {
         const sql = `INSERT INTO department (name) VALUES (?)`;
         const params = [answers.departmentName];

         db.query(sql, params, function (err, results) {
            if (err) {
               console.error(err);
            } else {
               console.log(`Added ${answers.departmentName} to departments.`);
            }
         });
      });
   }
   else if (questions === "Add a role") {
      Promise.all([
         db.promise().query(`SELECT * FROM department`)
      ])
      .then(([rows]) => {
         const departments = rows[0];
         const departmentChoices = departments.map(({ id, name }) =>({
            name: name,
            value: id
         }));

         return inquirer.prompt([
            {
               type: 'input',
               message: 'What is the name of the new role?',
               name: 'roleName',
            },
            {
               type: 'input',
               message: 'What is the salary for the new role?',
               name: 'roleSalary',
            },
            {
               type: 'list',
               message: 'Which department does the new role belong to?',
               choices: departmentChoices,
               name: 'departmentId',
            },
         ]);
      })
      .then((answers) => {
         const sql = `INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)`;
         const params = [answers.roleName, answers.roleSalary, answers.departmentId];

         db.query(sql, params, function (err, results) {
            if (err) {
               console.error(err);
            } else {
               console.log(`Added ${answers.roleName} to roles.`);
            }
         });
      });
   }
   else if 