const express = require("express");
const router = express.Router();
const housekeepingController = require("../controllers/HouseKeepingController");

/**
 * @swagger
 * tags:
 *   name: Housekeeping
 *   description: Housekeeping task management endpoints
 */

/**
 * @swagger
 * /api/housekeeping/create:
 *   post:
 *     summary: Create a new housekeeping task
 *     tags: [Housekeeping]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - roomId
 *               - assignedTo
 *               - taskType
 *             properties:
 *               roomId:
 *                 type: string
 *               assignedTo:
 *                 type: string
 *               taskType:
 *                 type: string
 *                 enum: [Cleaning, Maintenance]
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Task created successfully
 *       500:
 *         description: Server error
 */
router.post("/create", housekeepingController.createHousekeepingTask);

/**
 * @swagger
 * /api/housekeeping/edit/{taskId}:
 *   put:
 *     summary: Update a housekeeping task
 *     tags: [Housekeeping]
 *     parameters:
 *       - in: path
 *         name: taskId
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
 *               status:
 *                 type: string
 *                 enum: [In Progress, Completed, Cancelled]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Task updated successfully
 *       404:
 *         description: Task not found
 */
router.put("/edit/:taskId", housekeepingController.updateHousekeepingTask);

// /**
//  * @swagger
//  * /api/housekeeping/cancel/{taskId}:
//  *   put:
//  *     summary: Cancel a housekeeping task
//  *     tags: [Housekeeping]
//  *     parameters:
//  *       - in: path
//  *         name: taskId
//  *         required: true
//  *         schema:
//  *           type: string
//  *     responses:
//  *       200:
//  *         description: Task cancelled successfully
//  *       404:
//  *         description: Task not found
//  */
// router.put("/cancel/:taskId", housekeepingController.cancelHousekeepingTask);

/**
 * @swagger
 * /api/housekeeping/list:
 *   get:
 *     summary: Get list of housekeeping tasks
 *     tags: [Housekeeping]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [In Progress, Completed, Cancelled]
 *       - in: query
 *         name: roomId
 *         schema:
 *           type: string
 *       - in: query
 *         name: assignedTo
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of housekeeping tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/HousekeepingTask'
 */
router.get("/list", housekeepingController.getHousekeepingTasks);

router.get("/localhotels", housekeepingController.getLocalHotels);
router.get("/hotels/by-location", housekeepingController.getHotelsByLocation);

module.exports = router;