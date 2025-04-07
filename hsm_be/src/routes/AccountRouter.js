const express = require("express");
const router = express.Router();
const accountController = require("../controllers/AccountController");
const {
    checkAdminMiddleware,
    checkAuthMiddleware,
} = require("../middleware/authMiddleware");

/**
 * @swagger
 * components:
 *   schemas:
 *     Account:
 *       type: object
 *       properties:
 *         FullName:
 *           type: string
 *         Email:
 *           type: string
 *         Username:
 *           type: string
 *         Password:
 *           type: string
 *         IsDelete:
 *           type: boolean
 *         permissions:
 *           type: array
 *           items:
 *             type: string
 *         refreshToken:
 *           type: string
 */

/**
 * @swagger
 * /api/account/create:
 *   post:
 *     summary: Create a new account
 *     tags: [Accounts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               FullName:
 *                 type: string
 *               Email:
 *                 type: string
 *               Username:
 *                 type: string
 *               Password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Account created successfully
 *       400:
 *         description: Invalid input
 */
router.post("/create", checkAdminMiddleware, accountController.createAcount);

/**
 * @swagger
 * /api/account:
 *   get:
 *     summary: Get all accounts
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all accounts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Account'
 *       401:
 *         description: Unauthorized - No token provided
 *       403:
 *         description: Forbidden - Invalid token or insufficient privileges
 */
router.get("/", checkAuthMiddleware, accountController.getAllAccounts);

/**
 * @swagger
 * /api/account/{id}:
 *   get:
 *     summary: Get account details by ID
 *     tags: [Accounts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Account details
 *       404:
 *         description: Account not found
 */
router.get("/:id", accountController.getDetailsAccount);

/**
 * @swagger
 * /api/account/login:
 *   post:
 *     summary: Login to account
 *     tags: [Accounts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", accountController.loginAccount);

/**
 * @swagger
 * /api/account/logout:
 *   post:
 *     summary: Logout from account
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *       401:
 *         description: Unauthorized
 */
router.post("/logout", checkAuthMiddleware, accountController.logout);

router.post("/refresh-token", accountController.refreshToken);

module.exports = router;
