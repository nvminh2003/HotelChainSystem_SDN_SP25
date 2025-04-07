const express = require('express');
const router = express.Router();
const RevenueController = require('../controllers/RevenueController');
const { authMiddleware } = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Revenue
 *   description: Revenue data endpoints
 */

/**
 * @swagger
 * /api/revenue/{employeeId}:
 *   get:
 *     summary: Get revenue data for an employee
 *     tags: [Revenue]
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the employee requesting revenue data
 *       - in: query
 *         name: timeRange
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly, yearly, custom]
 *         description: Time range for revenue data
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for custom range (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for custom range (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Revenue data retrieved successfully
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
 *                   $ref: '#/components/schemas/RevenueData'
 *       403:
 *         description: Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ERR
 *                 message:
 *                   type: string
 *       404:
 *         description: Employee not found
 *       500:
 *         description: Server error
 */
router.get('/:employeeId', RevenueController.getRevenueData);

module.exports = router; 