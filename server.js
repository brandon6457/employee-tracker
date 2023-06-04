const express = require('express');
const inquirer = require('inquirer');
const mysql = require('mysql2');

const PORT = process.env.PORT || 3001;
const app = express();

const db = mysql.createConnection(
   {
      host: 'localhost',
      user: 'root',
      password: 'rootroot',
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
   else if (questions === "Add an employee") {
      Promise.all([
         db.promise().query(`SELECT * FROM role`),
         db.promise().query(`SELECT* FROM employee WHERE manager_id IS NULL`)
      ])
      .then(([roleRows, employeeRows]) => {
         const roles = roleRows[0];
         const roleChoices = roles.map(({ id, title }) => ({
            name: title,
            value: id
         }));
         managerChoices.push({ name: 'None', value: null });
         
         return inquirer.prompt([
            {
               type: 'input',
               message: "What is the new employee's first name?",
               name: 'firstName',
            },
            {
               type: 'input',
               message: "What is the new employee's last name?",
               name: 'lastName',
            },
            {
               type: 'list',
               message: "What is the new employee's role?",
               choices: roleChoices,
               name: 'roleId',
            },
            {
               type: 'list',
               message: "Who is the new employee's manager?",
               choices: managerChoices,
               name: 'managerId',
            },
         ]);
      })
      .then ((answers) => {
         const sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)`;
         const params = [answers.firstName, answers.lastName, answers.roleId, answers.managerId];

         db.query(sql, params, function (err, results) {
            if (err) {
               console.error(err);
            } else {
               console.log(`Added ${answers.firstName} ${answers.lastName} to employees.`);
            }
         });
      });
   }
   else if (questions === "Update an employee role") {
      Promise.all([
         db.promise().query(`SELECT * FROM employee`),
         db.promise().query(`SELECT *FROM role`)
      ])
      .then(([employeeRows, rolesRows]) => {
         const employees = employeeRows[0];
         const employeeChoices = employees.map(({ id, first_name, last_name }) => ({
            name: `${first_name} ${last_name}`,
            value: id
         }));

         const roles = rolesRows[0];
         const roleChoices = roles.map(({ id, title }) => ({
            name: title,
            value: id
         }));

         return inquirer.prompt([
            {
               type: 'list',
               message: "Which employee's role do you want to update?",
               choices: employeeChoices,
               name: 'employeeId',
            },
            {
               type: 'list',
               message: "What is the employee's new role?",
               choices: roleChoices,
               name: 'roleId',
            },
         ]);
      })
      .then((answers) => {
         const sql = `UPDATE employee SET role_id = ? WHERE id = ?`;
         const params = [answers.roleId, answers.employeeId];

         db.query(sql, params, function (err, results) {
            if (err) {
               console.error(err);
            } else {
               console.log(`Updated employee ${answers.employeeId} with new role ${answers.roleId}.`);
            }
         });
      });
   }
}

app.listen(PORT, () => {
   console.log(`Server running on port ${PORT}`);
});