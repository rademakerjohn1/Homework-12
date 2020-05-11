const connection = require("./connection");

class DB {

  // Keeping a reference to the connection on the class in case we need it later
  constructor(connection) {
    this.connection = connection;
  }

  // Find all employees, join with roles and departments to display their roles, salaries, departments, and managers
  findAllEmployees() {
    return this.connection.query(
      "SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager FROM employee LEFT JOIN role on employee.role_id = role.id LEFT JOIN department on role.department_id = department.id LEFT JOIN employee manager on manager.id = employee.manager_id;"
    );
  }

  // Find all roles, join with departments to display the department name
  findAllRoles() {
    return this.connection.query(
      "SELECT role.title, role.salary, role.id, department.name AS department FROM role INNER JOIN department ON role.department_id = department.id;"
    );
  }

  // Find all departments
  findAllDepartments() {
      return this.connection.query(
        "SELECT department.id, department.name from department ORDER BY department.id;"
      );
    }

  // Create a new employee
  createEmployee(employee) {
    return this.connection.query("INSERT INTO employee SET ?", employee);
  }

  // Remove an employee with the given id
  removeEmployee(employeeId) {
    return this.connection.query(
      "DELETE FROM employee WHERE id = ?",
      employeeId
    );
  }

  // Update the given employee's role
  updateEmployeeRole(employeeId, roleId) {
    return this.connection.query(
      "UPDATE employee SET role_id = ? WHERE id = ?",
      [roleId, employeeId]
    );
  }  
  
  // Find all employees except the given employee id // Update the given employee's manager
  updateEmployeeManager(managerId, employeeId) {
    return this.connection.query(
      "UPDATE employee SET manager_id = ? WHERE id = ?",
      [managerId, employeeId]
    );
  }  

  // Create a new role
  createRole(role) {
    return this.connection.query("INSERT INTO role SET ?", role);
  }

  // Remove a role from the db
  removeRole(roleId) {
    return this.connection.query("DELETE FROM role WHERE id = ?", roleId);
  }

  // Create a new department
  createDepartment(department) {
    return this.connection.query("INSERT INTO department SET ?", department);
  }

  // Remove a department
  removeDepartment(departmentId) {
    return this.connection.query("DELETE FROM department WHERE id = ?", departmentId);
  }

  // Find all employees in a given department, join with roles to display role titles
  findByDepartment(departmentId) {
    return this.connection.query("SELECT department.name AS department, employee.first_name, employee.last_name, role.title FROM department INNER JOIN role on department.id = role.department_id INNER JOIN employee on role.id = employee.role_id WHERE role.department_id = ?;", departmentId);
  }

  // Find all employees by manager, join with departments and roles to display titles and department names
  findAllManagers() {
    return this.connection.query("SELECT employee.id, employee.first_name, employee.last_name FROM employee WHERE manager_id IS NULL;")
  }

  findByManager(managerId)  {
    return this.connection.query("SELECT department.name AS department, employee.first_name, employee.last_name, role.title FROM department INNER JOIN role on department.id = role.department_id INNER JOIN employee on role.id = employee.role_id WHERE employee.manager_id = ?;", managerId);
  }

  // Find all departments, join with employees and roles and sum up utilized department budget
  utilizedBudget() {
    return this.connection.query("SELECT department.id, department.name, SUM(role.salary) AS utilized_budget FROM employee LEFT JOIN role on employee.role_id = role.id LEFT JOIN department on role.department_id = department.id GROUP BY department.id, department.name;")
  }
}
module.exports = new DB(connection);
