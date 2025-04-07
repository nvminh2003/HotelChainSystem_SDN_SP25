const express = require("express");
const router = express.Router();
const AmenityController = require("../controllers/AmenityController");
const { checkAdminMiddleware } = require("../middleware/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Amenities
 *   description: Amenity management endpoints
 */

/**
 * @swagger
 * /api/amenities:
 *   get:
 *     summary: Get all amenities
 *     tags: [Amenities]
 *     responses:
 *       200:
 *         description: List of amenities
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
 *                     $ref: '#/components/schemas/Amenity'
 */
router.get("/", AmenityController.getAllAmenities);

/**
 * @swagger
 * /api/amenities:
 *   post:
 *     summary: Create a new amenity
 *     tags: [Amenities]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - AmenitiesName
 *             properties:
 *               AmenitiesName:
 *                 type: string
 *               Note:
 *                 type: string
 *     responses:
 *       201:
 *         description: Amenity created successfully
 *       400:
 *         description: Invalid input
 */
router.post("/", AmenityController.createAmenity);

/**
 * @swagger
 * /api/amenities/{id}:
 *   put:
 *     summary: Update an amenity
 *     tags: [Amenities]
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
 *               AmenitiesName:
 *                 type: string
 *               Note:
 *                 type: string
 *     responses:
 *       200:
 *         description: Amenity updated successfully
 *       404:
 *         description: Amenity not found
 */
router.put("/:id", AmenityController.updateAmenity);

/**
 * @swagger
 * /api/amenities/{id}:
 *   delete:
 *     summary: Delete an amenity
 *     tags: [Amenities]
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
 *         description: Amenity deleted successfully
 *       400:
 *         description: Cannot delete amenity that is in use
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin privileges required
 *       404:
 *         description: Amenity not found
 */
router.delete("/:id", checkAdminMiddleware, AmenityController.deleteAmenity);

/**
 * @swagger
 * /api/amenities/{id}/soft:
 *   delete:
 *     summary: Soft delete an amenity
 *     tags: [Amenities]
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
 *         description: Amenity marked as deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin privileges required
 *       404:
 *         description: Amenity not found
 */
router.delete("/:id/soft", checkAdminMiddleware, AmenityController.softDeleteAmenity);

module.exports = router;
