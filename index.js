const { prompt } = require("inquirer");
const logo = require("asciiart-logo");
const db = require("./db");
require("console.table");

init();

// Display logo text, load main prompts
function init() {
  const logoText = logo({ name: "Employee Manager" }).render();

  console.log(logoText);

  loadMainPrompts();
}

// The code will wait (see "await") until prompt is finished running before doing the switch statement
async function loadMainPrompts() {
  const { choice } = await prompt([
    {
      type: "list",
      name: "choice",
      message: "What would you like to do?",
      choices: [
        {
          name: "View All Employees",
          value: "VIEW_EMPLOYEES"
        },
        {
          name: "View All Departments",
          value: "VIEW_DEPARTMENTS"
        },
        {
          name: "View All Roles",
          value: "VIEW_ROLES"
        },
        {
          name: "View Employees By Department",
          value: "VIEW_BY_DEPARTMENT"
        },
        {
          name: "View Employees By Manager",
          value: "VIEW_BY_MANAGER"
        },
        {
          name: "Add Employee",
          value: "ADD_EMPLOYEE"
        },
        {
          name: "Remove Employee",
          value: "REMOVE_EMPLOYEE"
        },
        {
          name: "Update Employee Manager",
          value: "UPDATE_EMPLOYEE_MANAGER"
        },
        {
          name: "Update Employee Role",
          value: "UPDATE_EMPLOYEE_ROLE"
        },
        {
          name: "Add Role",
          value: "ADD_ROLE"
        },
        {
          name: "Remove Role",
          value: "REMOVE_ROLE"
        },
        {
          name: "Add Department",
          value: "ADD_DEPARTMENT"
        },
        {
          name: "Remove Department",
          value: "REMOVE_DEPARTMENT"
        },
        {
          name: "View Utilized Budget",
          value: "VIEW_BUDGET"
        },
        {
          name: "Quit",
          value: "QUIT"
        }
      ]
    }
  ]);

  // Call the appropriate function depending on what the user chose
  switch (choice) {
    case "VIEW_EMPLOYEES":
      return viewEmployees();
    case "VIEW_DEPARTMENTS":
      return viewDepartments();
    case "VIEW_ROLES":
      return viewRoles();
    case "VIEW_BY_DEPARTMENT":
      return viewByDepartment();
    case "VIEW_BY_MANAGER":
      return viewByManager();
    case "ADD_EMPLOYEE":
      return addEmployee();
    case "REMOVE_EMPLOYEE":
      return removeEmployee();
    case "UPDATE_EMPLOYEE_MANAGER":
      return updateEmployeeManager();
    case "UPDATE_EMPLOYEE_ROLE":
      return updateEmployeeRole();
    case "ADD_ROLE":
      return addRole();
    case "REMOVE_ROLE":
      return removeRole();
    case "ADD_DEPARTMENT":
        return addDepartment();
    case "REMOVE_DEPARTMENT":
        return removeDepartment();
    case "VIEW_BUDGET":
          return viewUtilizedBudget();
    default:
      return quit();
  }
}
// Lists employee name, id, title, department, salary and manager
async function viewEmployees() {
  const employees = await db.findAllEmployees();

  console.log("\n");
  console.table(employees);

  loadMainPrompts();
}

// Stores all departments, prompts list of departments
// Lists all roles for selected department
async function viewDepartments() {
  const departments = await db.findAllDepartments();

  const departmentChoices = departments.map(({ id, name }) => ({
    name: name,
    id: id
  }));

  console.log("\n")
  console.table(departmentChoices);

  loadMainPrompts();
}

// Stores and lists all roles
async function viewRoles() {
  const roles = await db.findAllRoles();
  console.log("\n");
  console.table(roles);

  loadMainPrompts();
}

// Stores all departments, prompts list of departments
// Lists all roles for selected department
async function viewByDepartment() {
  const departments = await db.findAllDepartments();

  const departmentChoices = departments.map(({ id, name }) => ({
    name: name,
    value: id
  }));

  const { departmentId } = await prompt([
    {
      type: "list",
      name: "departmentId",
      message: "Which department would you like to view?",
      choices: departmentChoices
    }
  ]);
  const departmentView = await db.findByDepartment(departmentId);
  console.log("\n")
  console.table(departmentView);

  loadMainPrompts();
}

// Stores all managers, prompts list of managers
// Lists all employees for selected manager
async function viewByManager() {
  const managers = await db.findAllManagers();
  const managerChoices = managers.map(({ id, first_name }) => ({
    name: first_name,
    value: id
  }));

  const { managerId } = await prompt([
    {
      type: "list",
      name: "managerId",
      message: "Which manager would you like to choose",
      choices: managerChoices
    }
  ]);
  const managerView = await db.findByManager(managerId);
  console.log("\n")
  console.table(managerView);

  loadMainPrompts();
}

// Prompts for and stores employee information, adds to database
async function addEmployee() {
  const roles = await db.findAllRoles();
  const employees = await db.findAllEmployees();

  const employee = await prompt([
    {
      name: "first_name",
      message: "What is the employee's first name?"
    },
    {
      name: "last_name",
      message: "What is the employee's last name?"
    }
  ]);

  const roleChoices = roles.map(({ id, title }) => ({
    name: title,
    value: id
  }));

  const { roleId } = await prompt({
    type: "list",
    name: "roleId",
    message: "What is the employee's role?",
    choices: roleChoices
  });

  employee.role_id = roleId;

  const managerChoices = employees.map(({ id, first_name, last_name }) => ({
    name: `${first_name} ${last_name}`,
    value: id
  }));
  managerChoices.unshift({ name: "None", value: null });

  const { managerId } = await prompt({
    type: "list",
    name: "managerId",
    message: "Who is the employee's manager?",
    choices: managerChoices
  });

  employee.manager_id = managerId;

  await db.createEmployee(employee);

  console.log(
    `Added ${employee.first_name} ${employee.last_name} to the database`
  );

  loadMainPrompts();
}

// Prompts list of all employees
// Saves selected id value and removes corresponding employee
async function removeEmployee() {
  const employees = await db.findAllEmployees();

  const employeeChoices = employees.map(({ id, first_name, last_name }) => ({
    name: `${first_name} ${last_name}`,
    value: id
  }));

  const { employeeId } = await prompt([
    {
      type: "list",
      name: "employeeId",
      message: "Which employee do you want to remove?",
      choices: employeeChoices
    }
  ]);

  await db.removeEmployee(employeeId);

  console.log("Removed employee from the database");

  loadMainPrompts();
}

// Prompts list of employees
// Filters out selected employee to prompt manager choices
// Updates employee's manager in databae
async function updateEmployeeManager() {
  const employees = await db.findAllEmployees();

  const employeeChoices = employees.map(({ id, first_name, last_name }) => ({
    name: `${first_name} ${last_name}`,
    value: id
  }));

  const { employeeId } = await prompt([
    {
      type: "list",
      name: "employeeId",
      message: "For which employee do you want to update the manager?",
      choices: employeeChoices
    }
  ]);

 const filteredEmployeeChoices = [];
 
 for (var i = 0; i < employeeChoices.length; i++) {
    if (employeeChoices[i].value !== employeeId) {
      filteredEmployeeChoices.push(employeeChoices[i]);
    }
 };

 filteredEmployeeChoices.unshift({ name: "None", value: null })

  const { managerId } = await prompt([
    {
      type: "list",
      name: "managerId",
      message: `Which employee do you want to assign as the new manager?`,
      choices: filteredEmployeeChoices
    }
  ]);

  await db.updateEmployeeManager(managerId, employeeId);

  console.log("Updated employee's manager");

  loadMainPrompts();
}

// Prompts employee list, stores selected id value
// Prompts list of roles, stores selected id value
// Updates employee role using stored values
async function updateEmployeeRole() {
  const employees = await db.findAllEmployees();

  const employeeChoices = employees.map(({ id, first_name, last_name }) => ({
    name: `${first_name} ${last_name}`,
    value: id
  }));

  const { employeeId } = await prompt([
    {
      type: "list",
      name: "employeeId",
      message: "Which employee's role do you want to update?",
      choices: employeeChoices
    }
  ]);

  const roles = await db.findAllRoles();

  const roleChoices = roles.map(({ id, title }) => ({
    name: title,
    value: id
  }));

  const { roleId } = await prompt([
    {
      type: "list",
      name: "roleId",
      message: "Which role do you want to assign the selected employee?",
      choices: roleChoices
    }
  ]);

  await db.updateEmployeeRole(employeeId, roleId);

  console.log("Updated employee's role");

  loadMainPrompts();
}

// Stores all departments for role assignment
// Prompts for role information, stores to database
async function addRole() {
  const departments = await db.findAllDepartments();
  const departmentChoices = departments.map(({ id, name }) => ({
    name: name,
    value: id
  }));

  const role = await prompt([
    {
      name: "title",
      message: "What is the role title?"
    },
    {
      name: "salary",
      message: "What is the role salary?"
    },
    {
      name: "department_id",
      type: "list",
      message: "What is the role department?",
      choices: departmentChoices
    },
  ]);

  await db.createRole(role);

  console.log(
    `Added ${role.title} to the database`
  );

  loadMainPrompts();
}

// Prompts list of roles, removes selected role from database
async function removeRole() {
  const roles = await db.findAllRoles();

  const roleChoices = roles.map(({ id, title }) => ({
    name: title,
    value: id
  }));

  const { roleId } = await prompt([
    {
      type: "list",
      name: "roleId",
      message: "Which role do you want to remove?",
      choices: roleChoices
    }
  ]);

  await db.removeRole(roleId);

  console.log("Removed role from the database");

  loadMainPrompts();
}

// Prompts for department info, adds to database
async function addDepartment() {

  const department = await prompt([
    {
      name: "name",
      message: "What is the department name?"
    }
  ]);

  await db.createDepartment(department);

  console.log(
    `Added ${department.name} to the database`
  );

  loadMainPrompts();
}

// Stores all departments
// Prompts list of deparments, removes selected department from database
async function removeDepartment() {
  const departments = await db.findAllDepartments();

  const departmentChoices = departments.map(({ id, name }) => ({
    name: name,
    value: id
  }));

  const { departmentId } = await prompt([
    {
      type: "list",
      name: "departmentId",
      message: "Which department do you want to remove?",
      choices: departmentChoices
    }
  ]);

  await db.removeDepartment(departmentId);

  console.log(`Removed department from the database`);

  loadMainPrompts();
}

// Stores and lists utilized budget
async function viewUtilizedBudget() {
  const budget = await db.utilizedBudget();
  console.log("\n");
  console.table(budget);

  loadMainPrompts();
}

// Exits process
function quit() {
  console.log("Goodbye!");
  process.exit();
}
