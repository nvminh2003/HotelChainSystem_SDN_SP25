const express = require("express");
const router = express.Router();
const BookingController = require("../controllers/BookingControllerRFA");
const { authMiddleware } = require("../middleware/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Bookings
 *   description: Booking management endpoints
 */

/**
 * @swagger
 * /api/bookings:
 *   get:
 *     summary: Get all bookings
 *     tags: [Bookings]
 *     responses:
 *       200:
 *         description: List of all bookings
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Booking'
 */
router.get("/", BookingController.getAllBookings);

/**
 * @swagger
 * /api/bookings/date-range:
 *   get:
 *     summary: Get bookings by date range
 *     tags: [Bookings]
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
 *     responses:
 *       200:
 *         description: List of bookings within date range
 *       400:
 *         description: Invalid date range provided
 */
router.get("/date-range", BookingController.getBookingsByDateRange);

/**
 * @swagger
 * /api/bookings/{id}:
 *   get:
 *     summary: Get booking by ID
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booking details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Booking'
 */
router.get("/:id", BookingController.getBookingById);
//tuan
router.get("/hotel/:hotelId", BookingController.getBookingsByHotel);


/**
 * @swagger
 * /api/bookings:
 *   post:
 *     summary: Create a new booking
 *     tags: [Bookings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - full_name
 *               - phone
 *               - room
 *               - Time
 *             properties:
 *               full_name:
 *                 type: string
 *               phone:
 *                 type: string
 *               cccd:
 *                 type: string
 *               room:
 *                 type: string
 *               Time:
 *                 type: object
 *                 properties:
 *                   Checkin:
 *                     type: string
 *                     format: date-time
 *                   Checkout:
 *                     type: string
 *                     format: date-time
 *     responses:
 *       201:
 *         description: Booking created successfully
 */
router.post("/", BookingController.createBooking);

// Update a booking by ID
router.put("/:id"/*,authMiddleware*/, BookingController.updateBooking);

// Delete a booking by ID
router.delete("/:id"/*,authMiddleware*/, BookingController.deleteBooking);

module.exports = router;
