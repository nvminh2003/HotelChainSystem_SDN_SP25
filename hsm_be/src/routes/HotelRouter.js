const express = require("express");
const router = express.Router();
const HotelController = require("../controllers/HotelController");
const {
    authMiddleware,
    authUserMiddleware,
} = require("../middleware/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Hotels
 *   description: Hotel management endpoints
 */

/**
 * @swagger
 * /api/hotel:
 *   get:
 *     summary: Get all hotels
 *     tags: [Hotels]
 *     responses:
 *       200:
 *         description: List of all hotels
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
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Hotel'
 *       404:
 *         description: Hotels not found
 */
router.get("/", HotelController.getAllHotel);

/**
 * @swagger
 * /api/hotel/{id}:
 *   get:
 *     summary: Get hotel by ID
 *     tags: [Hotels]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Hotel ID
 *     responses:
 *       200:
 *         description: Hotel details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Hotel'
 *       404:
 *         description: Hotel not found
 */
router.get("/:id", HotelController.getHotelById);

/**
 * @swagger
 * /api/hotel:
 *   post:
 *     summary: Create a new hotel
 *     tags: [Hotels]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - CodeHotel
 *               - NameHotel
 *               - Introduce
 *               - LocationHotel
 *             properties:
 *               CodeHotel:
 *                 type: string
 *               NameHotel:
 *                 type: string
 *               Introduce:
 *                 type: string
 *               LocationHotel:
 *                 type: string
 *               image:
 *                 type: string
 *               Active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Hotel created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Hotel'
 *       400:
 *         description: Invalid input or duplicate hotel code/name
 */
router.post("/", HotelController.createHotel);

/**
 * @swagger
 * /api/hotel/{id}:
 *   put:
 *     summary: Update a hotel
 *     tags: [Hotels]
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
 *               CodeHotel:
 *                 type: string
 *               NameHotel:
 *                 type: string
 *               Introduce:
 *                 type: string
 *               LocationHotel:
 *                 type: string
 *               image:
 *                 type: string
 *               Active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Hotel updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Hotel'
 *       404:
 *         description: Hotel not found
 */
router.put("/:id", HotelController.updateHotel);

/**
 * @swagger
 * /api/hotel/{id}:
 *   delete:
 *     summary: Delete a hotel
 *     tags: [Hotels]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Hotel deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *       404:
 *         description: Hotel not found
 */
router.delete("/:id", HotelController.deleteHotel);

module.exports = router;