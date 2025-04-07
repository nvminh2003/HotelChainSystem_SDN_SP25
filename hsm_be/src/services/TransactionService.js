const Transaction = require("../models/TransactionModel");
const Booking = require("../models/BookingModelRFA");
const Customer = require("../models/CustomerModel");
const Service = require("../models/ServiceModel");
const Room = require("../models/RoomModel");
const mongoose = require("mongoose");
const moment = require("moment");
const { createPaymentLinkAD } = require("../utils");
// Get all transactions //Used to display partial information about transaction - I don't recommend getting the full spaghetti just for the all
const getAllTransactions = async () => {
    try {
        const allTransactions = await Transaction.find()
            .populate({
                path: "bookings",
                populate: {
                    path: "rooms", // Correctly referencing 'rooms'
                    model: "Room",
                }
            })
            .populate("services") // Populate service details
            .populate("customers"); // Populate customer details

        return {
            status: "OK",
            message: "All transactions retrieved successfully",
            data: allTransactions,
        };
    } catch (error) {
        console.error("Error in getAllTransactions:", error.message);
        return {
            status: "ERR",
            message: "Failed to retrieve transactions",
            error: error.message,
        };
    }
};

const getFullAllTransactions = async () => {
    try {
        const allTransactions = await Transaction.find()
            .populate({
                path: "bookings",
                populate: [
                    { path: "customers" }, // Populate customers inside bookings
                    { path: "rooms", select: "RoomName" },      // Populate rooms inside bookings

                ]
            })
            .populate("services.serviceId"); // Populate service details

        return {
            status: "OK",
            message: "All transactions retrieved successfully",
            data: allTransactions,
        };
    } catch (error) {
        console.error("Error in getAllTransactions:", error.message);
        return {
            status: "ERR",
            message: "Failed to retrieve transactions",
            error: error.message,
        };
    }
};



// Get a single transaction by ID
const getTransactionById = async (id) => {
    try {
        const transaction = await Transaction.findById(id)
            .populate("bookings") // Populate booking details
            .populate("services"); // Populate service details

        if (!transaction) {
            return {
                status: "ERR",
                message: "Transaction not found",
            };
        }

        return {
            status: "OK",
            message: "Transaction retrieved successfully",
            data: transaction,
        };
    } catch (error) {
        console.error("Error in getTransactionById:", error.message);
        return {
            status: "ERR",
            message: "Failed to retrieve transaction",
            error: error.message,
        };
    }
};


// Create a new transaction
const createTransaction = async (newTransaction) => {
    try {
        const { bookings, services, BuyTime, CreatedBy, PaidAmount = 0, PaymentReference } = newTransaction;

        if (!bookings || !bookings.length) {
            return {
                status: "ERR",
                message: "At least one booking is required to create a transaction",
            };
        }

        // Validate services and calculate total price
        let serviceTotal = 0;
        const formattedServices = services.map(service => {
            if (!service.serviceId || !service.quantity || !service.pricePerUnit) {
                throw new Error("Invalid service data. Each service must have serviceId, quantity, and pricePerUnit.");
            }
            const totalPrice = service.quantity * service.pricePerUnit;
            serviceTotal += totalPrice;
            return {
                serviceId: service.serviceId,
                quantity: service.quantity,
                pricePerUnit: service.pricePerUnit,
                totalPrice
            };
        });

        // Fetch bookings and calculate sum of booking prices
        const bookingDocs = await Booking.find({ _id: { $in: bookings } }, "SumPrice");
        const bookingTotal = bookingDocs.reduce((sum, booking) => sum + booking.SumPrice, 0);

        // Calculate FinalPrice
        const FinalPrice = bookingTotal + serviceTotal;

        // Determine payment status based on PaidAmount
        let PayStatus = "Unpaid";
        if (PaidAmount >= FinalPrice) {
            PayStatus = "Paid";
        } else if (PaidAmount > 0) {
            PayStatus = "Partial";
        }

        // Create transaction
        const transaction = new Transaction({
            bookings,
            services: formattedServices,
            BuyTime,
            FinalPrice,
            PaidAmount,  // New field to track how much has been paid
            Pay: PayStatus, // Updated payment status logic
            Status: "Pending", // Default status
            PaymentReference,
            CreatedBy
        });

        const savedTransaction = await transaction.save();
        return {
            status: "OK",
            message: "Transaction created successfully",
            data: savedTransaction,
        };
    } catch (error) {
        console.error("Error in createTransaction:", error.message);
        return {
            status: "ERR",
            message: "Failed to create transaction",
            error: error.message,
        };
    }
};



// Update a transaction by ID
const updateTransaction = async (id, data) => {
    try {
        const transaction = await Transaction.findById(id);
        if (!transaction) {
            return {
                status: "ERR",
                message: "Transaction not found",
            };
        }

        const updatedTransaction = await Transaction.findByIdAndUpdate(id, data, { new: true });
        return {
            status: "OK",
            message: "Transaction updated successfully",
            data: updatedTransaction,
        };
    } catch (error) {
        console.error("Error in updateTransaction:", error.message);
        return {
            status: "ERR",
            message: "Failed to update transaction",
            error: error.message,
        };
    }
};

// Delete a transaction by ID
const deleteTransaction = async (id) => {
    try {
        const transaction = await Transaction.findById(id);
        if (!transaction) {
            return {
                status: "ERR",
                message: "Transaction not found",
            };
        }

        await Transaction.findByIdAndDelete(id);
        return {
            status: "OK",
            message: "Transaction deleted successfully",
        };
    } catch (error) {
        console.error("Error in deleteTransaction:", error.message);
        return {
            status: "ERR",
            message: "Failed to delete transaction",
            error: error.message,
        };
    }
};

const createBookingAndTransaction = async (bookingData, transactionData) => {
    try {
        if (!bookingData.customer) {
            throw new Error('Customer data is missing');
        }

        const { rooms, SumPrice, Status, checkin, checkout, customer } = bookingData;
        const { full_name, phone, cccd } = customer;

        if (!rooms || rooms.length === 0) {
            throw new Error('At least one room must be selected');
        }

        // Find or create customer
        let existingCustomer = await Customer.findOne({ $or: [{ cccd }, { phone }] });
        if (existingCustomer) {
            if (existingCustomer.full_name !== full_name) {
                const newCustomer = new Customer({ full_name, phone, cccd });
                existingCustomer = await newCustomer.save();
            }
        } else {
            const newCustomer = new Customer({ full_name, phone, cccd });
            existingCustomer = await newCustomer.save();
        }

        // Create a booking for each room
        const bookingPromises = rooms.map(async (roomId) => {
            const room = await Room.findById(roomId);
            if (!room) {
                throw new Error(`Room ${roomId} not found`);
            }

            // Add 7 hours for Vietnam timezone
            const checkinDate = moment(checkin).add(7, 'hours');
            const checkoutDate = moment(checkout).add(7, 'hours');

            // Calculate number of nights
            const nights = Math.floor(moment.duration(checkoutDate.diff(checkinDate)).asDays());

            const booking = new Booking({
                customers: existingCustomer._id,
                rooms: roomId, // Single room per booking
                Time: {
                    Checkin: checkinDate.toDate(),
                    Checkout: checkoutDate.toDate(),
                },
                SumPrice: room.Price * nights, // Multiply room price by number of nights
                Status: Status || "Pending",
                hotel: room.hotel // Link to the hotel
            });

            return booking.save();
        });

        // Wait for all bookings to be created
        const savedBookings = await Promise.all(bookingPromises);
        console.log('Created bookings:', savedBookings.map(b => b._id));

        // Calculate total service price
        let totalServicePrice = 0;
        const transactionServices = [];

        for (const service of transactionData.services || []) {
            const serviceDetails = await Service.findById(service.serviceId);
            if (!serviceDetails) {
                throw new Error(`Service ${service.serviceId} not found`);
            }

            const pricePerUnit = serviceDetails.Price;
            const totalPrice = pricePerUnit * service.quantity;

            totalServicePrice += totalPrice;
            transactionServices.push({
                serviceId: service.serviceId,
                quantity: service.quantity,
                pricePerUnit,
                totalPrice,
            });
        }

        // Create transaction with all bookings
        const finalPrice = transactionData.FinalPrice || (SumPrice + totalServicePrice);
        const paidAmount = transactionData.PaidAmount || 0;
        let payStatus = "Unpaid";
        if (paidAmount >= finalPrice) payStatus = "Paid";
        else if (paidAmount > 0) payStatus = "Partial";

        const newTransaction = new Transaction({
            bookings: savedBookings.map(b => b._id), // Array of booking IDs
            services: transactionServices,
            BuyTime: new Date(),
            FinalPrice: finalPrice,
            PaidAmount: paidAmount,
            Pay: payStatus,
            Status: "Pending",
            PaymentMethod: transactionData.PaymentMethod || "Cash",
            CreatedBy: transactionData.CreatedBy,
        });

        const savedTransaction = await newTransaction.save();
        const transactionID = savedTransaction._id;

        // Generate payment link if credit card
        if (transactionData.PaymentMethod === "Credit Card") {
            let payAmount = finalPrice;
            if (transactionData.paymentType === "Partial Pay") {
                payAmount = Math.ceil(finalPrice * 0.3); // 30% of FinalPrice, rounded up
            }

            const paymentLink = createPaymentLinkAD(
                payAmount,
                `Thanh toán đơn ${transactionID}`,
                transactionData.ipAddr,
                transactionID
            );

            savedTransaction.PaymentReference = paymentLink;
            await savedTransaction.save();
        }

        return {
            status: "OK",
            message: "Booking and transaction created successfully",
            data: {
                bookings: savedBookings,
                transaction: savedTransaction,
                transactionID
            },
        };
    } catch (error) {
        console.error("Error in createBookingAndTransaction:", error);
        return {
            status: "ERR",
            message: "Failed to create booking and transaction",
            error: error.message,
        };
    }
};

const addExtraServices = async (transactionId, newServices) => {
    try {
        const transaction = await Transaction.findById(transactionId)
            .populate('services.serviceId');
        if (!transaction) {
            return {
                status: "ERR",
                message: "Transaction not found"
            };
        }

        // Fetch full service details for each new service
        const servicePromises = newServices.map(async (service) => {
            const fullService = await Service.findById(service.serviceId);
            if (!fullService) {
                throw new Error(`Service with ID ${service.serviceId} not found`);
            }
            return {
                serviceId: service.serviceId,
                quantity: service.quantity,
                pricePerUnit: fullService.Price,
                totalPrice: fullService.Price * service.quantity
            };
        });

        const formattedServices = await Promise.all(servicePromises);
        const additionalCost = formattedServices.reduce((sum, service) => sum + service.totalPrice, 0);

        // Update transaction with new services and price
        transaction.services.push(...formattedServices);
        transaction.FinalPrice = (transaction.FinalPrice || 0) + additionalCost;
        transaction.Status = "Pending"; // Set status to Pending when adding services

        // Update payment status if needed
        if (transaction.PaidAmount < transaction.FinalPrice) {
            transaction.Pay = transaction.PaidAmount > 0 ? "Partial" : "Unpaid";
        }

        await transaction.save();

        return {
            status: "OK",
            message: "Extra services added successfully",
            data: transaction
        };
    } catch (error) {
        console.error("Error in addExtraServices:", error.message);
        return {
            status: "ERR",
            message: "Failed to add extra services",
            error: error.message
        };
    }
};

const updateBookingStatus = async (transactionId, newStatus) => {
    try {
        const transaction = await Transaction.findById(transactionId);
        if (!transaction) {
            return {
                status: "ERR",
                message: "Transaction not found"
            };
        }

        // Validate status
        const validStatuses = ["Pending", "Completed", "Cancelled"];
        if (!validStatuses.includes(newStatus)) {
            return {
                status: "ERR",
                message: "Invalid status provided"
            };
        }

        transaction.Status = newStatus;
        await transaction.save();

        // If transaction is completed, update related bookings
        if (newStatus === "Completed") {
            await Booking.updateMany(
                { _id: { $in: transaction.bookings } },
                { $set: { Status: "Completed" } }
            );
        }

        return {
            status: "OK",
            message: "Status updated successfully",
            data: transaction
        };
    } catch (error) {
        console.error("Error in updateBookingStatus:", error.message);
        return {
            status: "ERR",
            message: "Failed to update status",
            error: error.message
        };
    }
};

const updateTransactionInfo = async (transactionId, updateData) => {
    try {
        const transaction = await Transaction.findById(transactionId);
        if (!transaction) {
            return {
                status: "ERR",
                message: "Transaction not found"
            };
        }

        // Update allowed fields
        const allowedUpdates = [
            "PaidAmount",
            "PaymentMethod",
            "PaymentReference",
            "UpdatedBy"
        ];

        Object.keys(updateData).forEach(key => {
            if (allowedUpdates.includes(key)) {
                transaction[key] = updateData[key];
            }
        });

        // Recalculate payment status if PaidAmount is updated
        if (updateData.PaidAmount !== undefined) {
            if (updateData.PaidAmount >= transaction.FinalPrice) {
                transaction.Pay = "Paid";
            } else if (updateData.PaidAmount > 0) {
                transaction.Pay = "Partial";
            } else {
                transaction.Pay = "Unpaid";
            }
        }

        await transaction.save();

        return {
            status: "OK",
            message: "Transaction information updated successfully",
            data: transaction
        };
    } catch (error) {
        console.error("Error in updateTransactionInfo:", error.message);
        return {
            status: "ERR",
            message: "Failed to update transaction information",
            error: error.message
        };
    }
};

module.exports = {
    getAllTransactions,
    getFullAllTransactions,
    getTransactionById,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    createBookingAndTransaction,
    addExtraServices,
    updateBookingStatus,
    updateTransactionInfo
};
