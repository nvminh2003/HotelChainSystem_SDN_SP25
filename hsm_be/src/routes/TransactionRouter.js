const express = require("express");
const router = express.Router();
const TransactionController = require("../controllers/TransactionController");
const { authMiddleware } = require("../middleware/authMiddleware");
const { createPaymentLink } = require("../controllers/VNPaymentController");
const { verifyPayment } = require("../controllers/VerifyPaymentController");

/**
 * @swagger
 * tags:
 *   name: Transactions
 *   description: Transaction management endpoints
 */

/**
 * @swagger
 * /api/transactions:
 *   get:
 *     summary: Get all transactions
 *     tags: [Transactions]
 *     responses:
 *       200:
 *         description: List of all transactions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Transaction'
 */
router.get("/", TransactionController.getAllTransactions);

router.post('/verifypayment', verifyPayment);
// Get full transaction with everything in it

/**
 * @swagger
 * /api/transactions/{id}:
 *   get:
 *     summary: Get transaction by ID
 *     tags: [Transactions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Transaction details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Transaction'
 */
router.get("/:id", TransactionController.getTransactionById);

/**
 * @swagger
 * /api/transactions:
 *   post:
 *     summary: Create a new booking with transaction
 *     tags: [Transactions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bookingData:
 *                 type: object
 *                 required:
 *                   - customers
 *                   - rooms
 *                   - Time
 *               transactionData:
 *                 type: object
 *                 required:
 *                   - CreatedBy
 *     responses:
 *       200:
 *         description: Booking and transaction created successfully
 */
router.post("/", TransactionController.createBookingAndTransactionController);

// Update a transaction by ID
router.put("/:id"/*,authMiddleware*/, TransactionController.updateTransaction);

// Delete a transaction by ID
router.delete("/:id"/*,authMiddleware*/, TransactionController.deleteTransaction);

/**
 * @swagger
 * /api/transactions/{id}/add-services:
 *   post:
 *     summary: Add extra services to a transaction
 *     tags: [Transactions]
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
 *               services:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     serviceId:
 *                       type: string
 *                     quantity:
 *                       type: number
 *     responses:
 *       200:
 *         description: Services added successfully
 */
router.post("/:id/add-services", TransactionController.addExtraServices);

// Update booking status
router.put("/:id/status"/*,authMiddleware*/, TransactionController.updateBookingStatus);

// Update transaction information
router.put("/:id/information"/*,authMiddleware*/, TransactionController.updateTransactionInfo);

router.post('/create_payment_url', createPaymentLink);


module.exports = router;
