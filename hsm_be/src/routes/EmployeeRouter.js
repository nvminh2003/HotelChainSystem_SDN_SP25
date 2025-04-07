const express = require("express");
const router = express.Router();
const employeeController = require("../controllers/EmployeeController");
const {
    checkAdminMiddleware,
    checkAuthMiddleware,
} = require("../middleware/authMiddleware");

/**
 * @swagger
 * components:
 *   schemas:
 *     Employee:
 *       type: object
 *       properties:
 *         hotels:
 *           type: array
 *           items:
 *             type: string
 *         FullName:
 *           type: string
 *         Phone:
 *           type: string
 *         Email:
 *           type: string
 *         Gender:
 *           type: string
 *         Image:
 *           type: string
 *         Address:
 *           type: string
 *         accountId:
 *           type: string
 *         permission:
 *           type: string
 */

/**
 * @swagger
 * /api/employee/create-employee:
 *   post:
 *     summary: Create a new employee
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - FullName
 *               - Phone
 *               - Email
 *               - Address
 *             properties:
 *               hotels:
 *                 type: array
 *                 items:
 *                   type: string
 *               FullName:
 *                 type: string
 *               Phone:
 *                 type: string
 *               Email:
 *                 type: string
 *               Gender:
 *                 type: string
 *               Image:
 *                 type: string
 *               Address:
 *                 type: string
 *               accountId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Employee created successfully
 *       400:
 *         description: Invalid input
 */
router.post("/create-employee", checkAdminMiddleware, employeeController.createEmployee);

/**
 * @swagger
 * /api/employee/get-details/{id}:
 *   get:
 *     summary: Get employee details by ID
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Employee details retrieved successfully
 *       404:
 *         description: Employee not found
 */
router.get("/get-details/:id", checkAuthMiddleware, employeeController.getDetailsEmployee);

/**
 * @swagger
 * /api/employee/edit-employee/{id}:
 *   put:
 *     summary: Update employee details
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               FullName:
 *                 type: string
 *               Phone:
 *                 type: string
 *               Email:
 *                 type: string
 *               Gender:
 *                 type: string
 *               Image:
 *                 type: string
 *               Address:
 *                 type: string
 *               account:
 *                 type: object
 *               schedule:
 *                 type: array
 *               hotels:
 *                 type: array
 *               employee_types:
 *                 type: array
 *     responses:
 *       200:
 *         description: Employee updated successfully
 *       400:
 *         description: Invalid input
 */
router.put("/edit-employee/:id", checkAdminMiddleware, employeeController.updateEmployeeController);

/**
 * @swagger
 * /api/employee/list-employees:
 *   get:
 *     summary: Get list of all employees
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of employees retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   fullname:
 *                     type: string
 *                   email:
 *                     type: string
 *                   phone:
 *                     type: string
 *                   position:
 *                     type: string
 *                   area:
 *                     type: string
 */
router.get("/list-employees", checkAuthMiddleware, employeeController.listEmployees);

/**
 * @swagger
 * /api/employee/account/{id}:
 *   get:
 *     summary: Get employee by account ID
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Employee found successfully
 *       404:
 *         description: Employee not found
 */
router.get("/account/:id", checkAuthMiddleware, employeeController.getEmployeeByAccountId);

module.exports = router;
