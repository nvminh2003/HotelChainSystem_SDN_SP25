const Room = require("../models/RoomModel");
const Booking = require("../models/BookingModelRFA");

const getDashboardData = async (req, res) => {
    try {
        const { hotelId, startDate, endDate } = req.query;

        if (!hotelId || !startDate || !endDate) {
            return res.status(400).json({
                status: "ERR",
                message: "Missing required parameters"
            });
        }

        // Get all rooms for the hotel
        const rooms = await Room.find({ hotel: hotelId, IsDelete: false })
            .populate('roomtype', 'TypeName')
            .lean();

        // Get bookings that overlap with the date range
        const bookings = await Booking.find({
            $and: [
                { hotel: hotelId },
                {
                    $or: [
                        {
                            "Time.Checkin": { $lte: new Date(endDate) },
                            "Time.Checkout": { $gte: new Date(startDate) }
                        }
                    ]
                }
            ]
        }).populate('rooms').lean();

        // Create a map of room IDs to their booking status
        const roomStatusMap = new Map();
        bookings.forEach(booking => {
            booking.rooms.forEach(room => {
                roomStatusMap.set(room._id.toString(), "Occupied");
            });
        });

        // Update room statuses based on bookings
        const roomsWithStatus = rooms.map(room => ({
            ...room,
            status: roomStatusMap.get(room._id.toString()) || "Available"
        }));

        return res.status(200).json({
            status: "OK",
            data: roomsWithStatus
        });
    } catch (error) {
        console.error("Error in getDashboardData:", error);
        return res.status(500).json({
            status: "ERR",
            message: "Internal server error"
        });
    }
};

const getRoomStatus = async (req, res) => {
    try {
        const { roomId } = req.params;
        const { startDate, endDate } = req.query;

        if (!roomId || !startDate || !endDate) {
            return res.status(400).json({
                status: "ERR",
                message: "Missing required parameters"
            });
        }

        // Get bookings for the specific room in the date range
        const bookings = await Booking.find({
            rooms: roomId,
            $or: [
                {
                    "Time.Checkin": { $lte: new Date(endDate) },
                    "Time.Checkout": { $gte: new Date(startDate) }
                }
            ]
        })
            .populate('guest', 'FirstName LastName')
            .lean();

        // Format booking data
        const formattedBookings = bookings.map(booking => ({
            checkIn: booking.Time.Checkin,
            checkOut: booking.Time.Checkout,
            guestName: `${booking.guest.FirstName} ${booking.guest.LastName}`,
            status: booking.Status
        }));

        return res.status(200).json({
            status: "OK",
            data: formattedBookings
        });
    } catch (error) {
        console.error("Error in getRoomStatus:", error);
        return res.status(500).json({
            status: "ERR",
            message: "Internal server error"
        });
    }
};

module.exports = {
    getDashboardData,
    getRoomStatus
}; 