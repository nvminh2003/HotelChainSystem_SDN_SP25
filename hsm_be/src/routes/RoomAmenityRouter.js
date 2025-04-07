const express = require("express");
const router = express.Router();
const RoomAmenityController = require("../controllers/RoomAmenityController");
const { authMiddleware } = require("../middleware/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Room Amenities
 *   description: Room amenity management endpoints
 */

/**
 * @swagger
 * /api/roomamenities:
 *   get:
 *     summary: Get all room amenities
 *     tags: [Room Amenities]
 *     responses:
 *       200:
 *         description: List of all room amenities
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/RoomAmenity'
 */
router.get("/", RoomAmenityController.getAllRoomAmenities);

/**
 * @swagger
 * /api/roomamenities/not-functioning:
 *   get:
 *     summary: Get all non-functioning room amenities
 *     tags: [Room Amenities]
 *     responses:
 *       200:
 *         description: List of non-functioning amenities
 */
router.get("/not-functioning", RoomAmenityController.getNotFunctioningRoomAmenities);

// Get a single room amenity by ID
router.get("/:id", RoomAmenityController.getRoomAmenityById);

// Create a new room amenity
router.post("/", RoomAmenityController.createRoomAmenity);

// Update a room amenity by ID
router.put("/:id", RoomAmenityController.updateRoomAmenity);

// Delete a room amenity by ID
router.delete("/:id", RoomAmenityController.deleteRoomAmenity);

router.get("/:roomId/amenities", RoomAmenityController.getAmenitiesByRoomIdController);
router.put("/:roomId/amenities", RoomAmenityController.updateRoomAmenitiesByRoomIdController);
router.get("/room/:roomId", RoomAmenityController.getRoomAmenitiesByRoomId);
// router.get("/amenity/:amenityId", RoomAmenityController.getRoomAmenitiesByAmenity);
// router.put("/:id", RoomAmenityController.updateRoomAmenityStatus);




/**
 * @swagger
 * /api/roomamenities/{roomId}/amenities:
 *   get:
 *     summary: Get amenities for a specific room
 *     tags: [Room Amenities]
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of amenities in the room
 *   put:
 *     summary: Update amenities for a specific room
 *     tags: [Room Amenities]
 *     parameters:
 *       - in: path
 *         name: roomId
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
 *               amenities:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     amenityId:
 *                       type: string
 *                     quantity:
 *                       type: number
 *                     status:
 *                       type: string
 *                       enum: [Functioning, Broken, Missing, Other]
 *     responses:
 *       200:
 *         description: Amenities updated successfully
 */

module.exports = router;
