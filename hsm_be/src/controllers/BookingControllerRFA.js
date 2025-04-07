const BookingService = require("../services/BookingServiceRFA");

// Get all bookings
const getAllBookings = async (req, res) => {
    try {
        const bookings = await BookingService.getAllBookings();
        return res.status(200).json(bookings);
    } catch (e) {
        return res.status(500).json({
            message: "Failed to retrieve bookings",
            error: e.message,
        });
    }
};

// Get a single booking by ID
const getBookingById = async (req, res) => {
    try {
        const booking = await BookingService.getBookingById(req.params.id);
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }
        return res.status(200).json(booking);
    } catch (e) {
        return res.status(500).json({
            message: "Error retrieving booking",
            error: e.message,
        });
    }
};

// Create a new booking
const createBooking = async (req, res) => {
    try {
        const booking = await BookingService.createBooking(req.body);
        return res.status(201).json(booking);
    } catch (e) {
        return res.status(400).json({
            message: "Booking creation failed",
            error: e.message,
        });
    }
};

// Update a booking by ID
const updateBooking = async (req, res) => {
    try {
        const updatedBooking = await BookingService.updateBooking(req.params.id, req.body);
        if (!updatedBooking) {
            return res.status(404).json({ message: "Booking not found" });
        }
        return res.status(200).json(updatedBooking);
    } catch (e) {
        return res.status(400).json({
            message: "Booking update failed",
            error: e.message,
        });
    }
};

// Delete a booking by ID
const deleteBooking = async (req, res) => {
    try {
        const deletedBooking = await BookingService.deleteBooking(req.params.id);
        if (!deletedBooking) {
            return res.status(404).json({ message: "Booking not found" });
        }
        return res.status(200).json({ message: "Booking deleted successfully" });
    } catch (e) {
        return res.status(500).json({
            message: "Booking deletion failed",
            error: e.message,
        });
    }
};

// Get bookings by date range
const getBookingsByDateRange = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        if (!startDate || !endDate) {
            return res.status(400).json({
                status: "ERR",
                message: "Start date and end date are required"
            });
        }

        const bookings = await BookingService.getBookingsByDateRange(startDate, endDate);
        return res.status(200).json(bookings);
    } catch (e) {
        return res.status(500).json({
            message: "Failed to retrieve bookings",
            error: e.message
        });
    }
};

//
const getBookingsByHotel = async (req, res) => {
    try {
        const { hotelId } = req.params;

        if (!hotelId) {
            return res.status(400).json({ message: "Hotel ID is required" });
        }

        const bookings = await BookingService.getAllBookingsByHotelId(hotelId);
        return res.status(200).json(bookings);
    } catch (error) {
        console.error("Error fetching bookings:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports = {
    getAllBookings,
    getBookingById,
    createBooking,
    updateBooking,
    deleteBooking,
    getBookingsByDateRange,
    getBookingsByHotel
};
