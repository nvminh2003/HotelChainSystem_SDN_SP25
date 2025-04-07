const express = require("express");
const router = express.Router();
// const productController = require("../controllers/ProductController");
const roomsController = require("../controllers/RoomController");
const {
    authMiddleware,
    authUserMiddleware,
} = require("../middleware/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Rooms
 *   description: Room management endpoints
 */

/**
 * @swagger
 * /api/rooms:
 *   get:
 *     summary: Get all rooms
 *     tags: [Rooms]
 *     responses:
 *       200:
 *         description: List of all rooms
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
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Room'
 */
router.get("/", roomsController.getAllRooms);

/**
 * @swagger
 * /api/rooms/availability:
 *   get:
 *     summary: Check room availability
 *     tags: [Rooms]
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: hotelId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Room availability status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Room'
 */
router.get("/availability", roomsController.checkRoomAvailability);

// Get available rooms (alternative)
router.get("/getavail_", roomsController.getAvailableRooms_);

/**
 * @swagger
 * /api/rooms/hotel/{hotelId}:
 *   get:
 *     summary: Get rooms by hotel
 *     tags: [Rooms]
 *     parameters:
 *       - in: path
 *         name: hotelId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of rooms for a specific hotel
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
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Room'
 */
router.get("/hotel/:hotelId", roomsController.getRoomsByHotel);

//tuan
router.get("/get-all-typeroom", roomsController.getAllTypeRooms);
//router get room by hotelid
router.get("/hotel/:id", roomsController.getAllRoomByHotelId);

/**
 * @swagger
 * /api/rooms:
 *   post:
 *     summary: Create a new room
 *     tags: [Rooms]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - RoomName
 *               - Price
 *               - Floor
 *               - hotel
 *             properties:
 *               RoomName:
 *                 type: string
 *               Price:
 *                 type: number
 *               Floor:
 *                 type: number
 *               hotel:
 *                 type: string
 *               Status:
 *                 type: string
 *               Description:
 *                 type: string
 *               Image:
 *                 type: string
 *     responses:
 *       200:
 *         description: Room created successfully
 *       400:
 *         description: Missing required fields
 */
router.post("/", roomsController.createRooms);

/**
 * @swagger
 * /api/rooms/{id}:
 *   put:
 *     summary: Update a room
 *     tags: [Rooms]
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
 *             $ref: '#/components/schemas/Room'
 *     responses:
 *       200:
 *         description: Room updated successfully
 *       404:
 *         description: Room not found
 */
router.put("/:id", roomsController.updateRoom);

/**
 * @swagger
 * /api/rooms/{id}:
 *   delete:
 *     summary: Delete a room
 *     tags: [Rooms]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Room deleted successfully
 *       404:
 *         description: Room not found
 */
router.delete("/:id", roomsController.deleteRoom);

/**
 * @swagger
 * /api/rooms/{id}:
 *   get:
 *     summary: Get room by ID
 *     tags: [Rooms]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Room details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Room'
 */
router.get("/:id", roomsController.getRoomByRoomId);

router.get("/account/:accountId", roomsController.getRoomsByAccountController);
module.exports = router;
