INSERT INTO department (name)
VALUES ("Sales"),
       ("Marketing"),
       ("Management"),
       ("Entry Level");

INSERT INTO role (title, salary, department_id)
VALUES ("Sales", 60000, 1),
       ("Marketing", 65000, 2),
       ("Management", 100000, 3),
       ("Senior Manager", 200000, 3),
       ("Entry Level", 40000, 4),
       ("Senior Entry Level", 50000, 4);

INSERT INTO employee (first_name, Last_name, role_id, manager_id)
VALUES ("John", "Wick", 19, 3),
       ("Michelle", "Rodriguez", 20, 2),
       ("Dwayne", "Johnson", 24, NULL);
       ("Kevin", "Hart", 20, 3),
       ("Christina", "Ricci", 23, null),
       ("Jackie", "Chan", 20, NULL),
       ("Mike", "Lowry", 21, 4)