const express = require("express");
const router = express.Router();
// const productController = require("../controllers/ProductController");
const roomsTypeController = require("../controllers/RoomTypeController");
const {
    authMiddleware,
    authUserMiddleware,
} = require("../middleware/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: RoomTypes
 *   description: Room type management endpoints
 */

/**
 * @swagger
 * /api/roomtype:
 *   get:
 *     summary: Get all room types
 *     tags: [RoomTypes]
 *     responses:
 *       200:
 *         description: List of all room types
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
 *                     $ref: '#/components/schemas/RoomType'
 *       404:
 *         description: Room types not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.get("", roomsTypeController.getAllRoomsType);
//router create new room
// router.post("", roomsTypeController.createRooms);
// //router update by id
// router.put("/:id", roomsTypeController.updateRoom);
// //delete room
// router.delete("/:id", roomsTypeController.deleteRoom);
// //router get room by id
// router.get("/:id", roomsTypeController.getRoomByRoomId);

module.exports = router;