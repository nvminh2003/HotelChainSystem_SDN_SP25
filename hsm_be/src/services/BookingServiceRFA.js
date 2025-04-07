const Booking = require("../models/BookingModelRFA");
const Customers = require("../models/CustomerModel");
const Room = require("../models/RoomModel");
const Hotel = require("../models/HotelModel");
// Get all bookings
const getAllBookings = async () => {
    try {
        const allBookings = await Booking.find()
            .populate({
                path: 'customers',
                select: 'full_name phone cccd'
            })
            .populate({
                path: 'rooms',
                select: 'RoomName Price'
            })
            .sort({ 'Time.Checkin': -1 });

        return {
            status: "OK",
            message: "All bookings retrieved successfully",
            data: allBookings,
        };
    } catch (error) {
        console.error("Error in getAllBookings:", error.message);
        return {
            status: "ERR",
            message: "Failed to retrieve bookings",
            error: error.message,
        };
    }
};

// Get a single booking by ID
const getBookingById = async (id) => {
    try {
        const booking = await Booking.findById(id)
            .populate("customers") // Populate customer details
            .populate("rooms"); // Populate room details

        if (!booking) {
            return {
                status: "ERR",
                message: "Booking not found",
            };
        }

        return {
            status: "OK",
            message: "Booking retrieved successfully",
            data: booking,
        };
    } catch (error) {
        console.error("Error in getBookingById:", error.message);
        return {
            status: "ERR",
            message: "Failed to retrieve booking",
            error: error.message,
        };
    }
};


// Create a new booking
const createBookingRaw = async (newBooking) => {
    try {
        const { customers, rooms, Time, GuestsNumber, SumPrice, Status } = newBooking;

        const booking = new Booking({
            customers,
            rooms,
            Time,
            GuestsNumber,
            SumPrice,
            Status,
        });

        const savedBooking = await booking.save();
        return {
            status: "OK",
            message: "Booking created successfully",
            data: savedBooking,
        };
    } catch (error) {
        console.error("Error in createBooking:", error.message);
        return {
            status: "ERR",
            message: "Failed to create booking",
            error: error.message,
        };
    }
};

const createBooking = async (bookingData) => {
    try {
        const { full_name, phone, cccd, room, Time, GuestsNumber } = bookingData;

        // Check if the customer exists by phone or CCCD
        let customer = await Customers.findOne({ $or: [{ phone }, { cccd }] });

        if (!customer) {
            // If customer doesn't exist, create a new one
            customer = new Customer({ full_name, phone, cccd });
            await customer.save();
        }

        // Find the selected room and calculate SumPrice
        const selectedRoom = await Room.findById(room);
        if (!selectedRoom) {
            return {
                status: "ERR",
                message: "Invalid room ID",
            };
        }

        const sumPrice = selectedRoom.price;

        // Create booking with customer reference
        const newBooking = new Booking({
            customers: customer._id,
            room, // Now only one room per booking
            Time,
            GuestsNumber,
            SumPrice: sumPrice,
            Status: "Pending", // Default status
        });

        const savedBooking = await newBooking.save();
        return {
            status: "OK",
            message: "Booking created successfully",
            data: savedBooking,
        };
    } catch (error) {
        console.error("Error in createBooking:", error.message);
        return {
            status: "ERR",
            message: "Failed to create booking",
            error: error.message,
        };
    }
};



// Update a booking by ID
const updateBooking = async (id, data) => {
    try {
        const booking = await Booking.findById(id);
        if (!booking) {
            return {
                status: "ERR",
                message: "Booking not found",
            };
        }

        const updatedBooking = await Booking.findByIdAndUpdate(id, data, { new: true });
        return {
            status: "OK",
            message: "Booking updated successfully",
            data: updatedBooking,
        };
    } catch (error) {
        console.error("Error in updateBooking:", error.message);
        return {
            status: "ERR",
            message: "Failed to update booking",
            error: error.message,
        };
    }
};

// Delete a booking by ID
const deleteBooking = async (id) => {
    try {
        const booking = await Booking.findById(id);
        if (!booking) {
            return {
                status: "ERR",
                message: "Booking not found",
            };
        }

        await Booking.findByIdAndDelete(id);
        return {
            status: "OK",
            message: "Booking deleted successfully",
        };
    } catch (error) {
        console.error("Error in deleteBooking:", error.message);
        return {
            status: "ERR",
            message: "Failed to delete booking",
            error: error.message,
        };
    }
};

// Get bookings by date range
const getBookingsByDateRange = async (startDate, endDate) => {
    try {
        const bookings = await Booking.find({
            'Time.Checkin': { $gte: new Date(startDate) },
            'Time.Checkout': { $lte: new Date(endDate) }
        })
            .populate({
                path: 'customers',
                select: 'full_name phone cccd'
            })
            .populate({
                path: 'rooms',
                select: 'RoomName Price',
                populate: {
                    path: 'hotel',
                    select: 'NameHotel'
                }
            })
            .sort({ 'Time.Checkin': 1 });

        return {
            status: "OK",
            message: "Bookings retrieved successfully",
            data: bookings
        };
    } catch (error) {
        console.error("Error in getBookingsByDateRange:", error.message);
        return {
            status: "ERR",
            message: "Failed to retrieve bookings",
            error: error.message
        };
    }
};
//
const getAllBookingsByHotelId = async (hotelId) => {
    console.log("Tìm phòng thuộc khách sạn:", hotelId);
    const rooms = await Room.find({ hotel: hotelId }).select("_id");
    console.log("Danh sách phòng:", rooms);

    const roomIds = rooms.map(room => room._id);
    console.log("Danh sách roomIds:", roomIds);

    const bookings = await Booking.find({ rooms: { $in: roomIds } })
        .populate({
            path: "rooms",
            select: "-Image"
        });

    console.log("Danh sách booking tìm thấy:", bookings);
    return bookings;
};
module.exports = {
    getAllBookings,
    getBookingById,
    createBooking,
    createBookingRaw,
    updateBooking,
    deleteBooking,
    getBookingsByDateRange,
    getAllBookingsByHotelId
};
