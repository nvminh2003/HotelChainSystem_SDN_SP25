const Transaction = require("../models/TransactionModel");
const Booking = require("../models/BookingModelRFA");
const Service = require("../models/ServiceModel");
const Room = require("../models/RoomModel");
const mongoose = require("mongoose");

const { createBookingAndTransaction } = require("../services/TransactionService");
const TransactionService = require("../services/TransactionService");

// Create a new transaction with a booking
const createBookingAndTransactionController = async (req, res) => {
    try {
        const { bookingData, transactionData } = req.body;

        // Validate input data (optional but recommended)
        if (!bookingData || !transactionData) {
            return res.status(400).json({
                status: 'ERR',
                message: 'Missing required data for booking or transaction.',
            });
        }

        // Call the service function to create booking and transaction
        const result = await createBookingAndTransaction(bookingData, transactionData);

        if (result.status === 'OK') {
            return res.status(200).json(result);
        } else {
            return res.status(500).json(result); // Internal Server Error
        }
    } catch (error) {
        console.error("Error in createBookingAndTransactionController:", error.message);
        return res.status(500).json({
            status: 'ERR',
            message: 'An unexpected error occurred while creating booking and transaction.',
            error: error.message,
        });
    }
};

// Get all transactions
const getAllTransactions = async (req, res) => {
    try {
        const transactions = await TransactionService.getFullAllTransactions();
        return res.status(200).json({
            status: "OK",
            message: "All transactions retrieved successfully",
            data: transactions.data,
        });
    } catch (error) {
        console.error("Error in getAllTransactions:", error.message);
        return res.status(500).json({
            status: "ERR",
            message: "Failed to retrieve transactions",
            error: error.message,
        });
    }
};

// Get a single transaction by ID
const getTransactionById = async (req, res) => {
    try {
        const { id } = req.params;
        const transaction = await Transaction.findById(id).populate("bookings services.serviceId");

        if (!transaction) {
            return res.status(404).json({
                status: "ERR",
                message: "Transaction not found",
            });
        }

        return res.status(200).json({
            status: "OK",
            message: "Transaction retrieved successfully",
            data: transaction,
        });
    } catch (error) {
        console.error("Error in getTransactionById:", error.message);
        return res.status(500).json({
            status: "ERR",
            message: "Failed to retrieve transaction",
            error: error.message,
        });
    }
};

// Update transaction (payment, status, etc.)
const updateTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const transaction = await Transaction.findById(id);
        if (!transaction) {
            return res.status(404).json({
                status: "ERR",
                message: "Transaction not found",
            });
        }

        // If updating payment, adjust the "Pay" status dynamically
        if (updateData.PaidAmount !== undefined) {
            transaction.PaidAmount += updateData.PaidAmount;

            if (transaction.PaidAmount >= transaction.FinalPrice) {
                transaction.Pay = "Paid";
            } else if (transaction.PaidAmount > 0) {
                transaction.Pay = "Partial";
            }
        }

        // Update other fields
        Object.assign(transaction, updateData);

        const updatedTransaction = await transaction.save();
        return res.status(200).json({
            status: "OK",
            message: "Transaction updated successfully",
            data: updatedTransaction,
        });
    } catch (error) {
        console.error("Error in updateTransaction:", error.message);
        return res.status(500).json({
            status: "ERR",
            message: "Failed to update transaction",
            error: error.message,
        });
    }
};

// Delete transaction
const deleteTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        const transaction = await Transaction.findById(id);

        if (!transaction) {
            return res.status(404).json({
                status: "ERR",
                message: "Transaction not found",
            });
        }

        await Transaction.findByIdAndDelete(id);
        return res.status(200).json({
            status: "OK",
            message: "Transaction deleted successfully",
        });
    } catch (error) {
        console.error("Error in deleteTransaction:", error.message);
        return res.status(500).json({
            status: "ERR",
            message: "Failed to delete transaction",
            error: error.message,
        });
    }
};

const addExtraServices = async (req, res) => {
    try {
        const { id } = req.params;
        const { services } = req.body;
        const result = await TransactionService.addExtraServices(id, services);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({
            status: "ERR",
            message: error.message
        });
    }
};

const updateBookingStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const result = await TransactionService.updateBookingStatus(id, status);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({
            status: "ERR",
            message: error.message
        });
    }
};

const updateTransactionInfo = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const result = await TransactionService.updateTransactionInfo(id, updateData);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({
            status: "ERR",
            message: error.message
        });
    }
};

module.exports = {
    createBookingAndTransactionController,
    getAllTransactions,
    getTransactionById,
    updateTransaction,
    deleteTransaction,
    addExtraServices,
    updateBookingStatus,
    updateTransactionInfo
};
