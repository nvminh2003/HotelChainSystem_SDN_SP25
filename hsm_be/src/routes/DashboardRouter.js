const express = require('express');
const router = express.Router();
const DashboardController = require('../controllers/DashboardController');

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Dashboard data endpoints
 */

/**
 * @swagger
 * /api/dashboard/{employeeId}:
 *   get:
 *     summary: Get dashboard data for an employee
 *     tags: [Dashboard]
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the employee requesting dashboard data
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/DashboardData'
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Employee not found
 *       500:
 *         description: Server error
 */
router.get('/:employeeId', DashboardController.getDashboardData);

module.exports = router; 