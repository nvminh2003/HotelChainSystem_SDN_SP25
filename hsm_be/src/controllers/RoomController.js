// const ProductService = require("../services/ProductService");
const RoomService = require("../services/RoomService");
const Room = require("../models/RoomModel");
const Booking = require("../models/BookingModelRFA");
const Hotel = require("../models/HotelModel");


//get all rooms
const getAllRooms = async (req, res) => {
    try {
        const rooms = await RoomService.getAllRoomsService();
        return res.status(200).json(rooms);
    } catch (e) {
        return res.status(404).json({
            error: e.message,
        });
    }
};

const getAvailableRooms = async (req, res) => {
    try {
        const { startDate, endDate, hotelId } = req.query;

        if (!startDate || !endDate || !hotelId) {
            return res.status(400).json({
                status: "ERR",
                message: "Missing required parameters"
            });
        }

        // Get all rooms for the specified hotel
        const rooms = await Room.find({ HotelId: hotelId });

        // Get all bookings that overlap with the specified date range
        const bookings = await Booking.find({
            $or: [
                {
                    $and: [
                        { "Time.Checkin": { $lte: new Date(startDate) } },
                        { "Time.Checkout": { $gte: new Date(startDate) } }
                    ]
                },
                {
                    $and: [
                        { "Time.Checkin": { $lte: new Date(endDate) } },
                        { "Time.Checkout": { $gte: new Date(endDate) } }
                    ]
                }
            ]
        }).populate('rooms');

        // Get all room IDs that are booked during the specified period
        const bookedRoomIds = new Set();
        bookings.forEach(booking => {
            booking.rooms.forEach(room => {
                bookedRoomIds.add(room._id.toString());
            });
        });

        // Filter out booked rooms
        const availableRooms = rooms.map(room => {
            const isBooked = bookedRoomIds.has(room._id.toString());
            return {
                ...room.toObject(),
                Status: isBooked ? "Unavailable" : "Available"
            };
        });

        return res.status(200).json({
            status: "OK",
            data: availableRooms
        });
    } catch (error) {
        console.error("Error in getAvailableRooms:", error);
        return res.status(500).json({
            status: "ERR",
            message: "Error while checking room availability"
        });
    }
};

//get room by id
const getRoomByRoomId = async (req, res) => {
    try {
        const roomId = req.params.id;
        if (!roomId) {
            return res.status(200).json({
                status: "ERR",
                message: "The roomId is required",
            });
        }

        const room = await RoomService.getRoomByRoomIdService(roomId);
        return res.status(200).json(room);
    } catch (error) {
        return res.status(404).json({
            error: error.message,
        });
    }
};

//create a room
const createRooms = async (req, res) => {
    try {
        const {
            RoomName, Price, Status, Floor, hotel,
            roomtype, room_amenities, Description, Image
        } = req.body;
        // console.log("req.body", req.body);
        const requiredFields = ["RoomName", "Price", "Floor", "hotel"];
        const missingFields = requiredFields.filter(field => !req.body[field]);

        if (
            !RoomName || !Price || !Floor || !hotel
        ) {
            return res
                .status(200)
                .json({ status: "ERR", message: "The input is required." });
        }

        if (missingFields.length > 0) {
            return res.status(400).json({
                status: "ERR",
                message: `The following fields are required: ${missingFields.join(", ")}`,
            });
        }

        const room = await RoomService.createRoomService(req.body);
        return res.status(200).json(room);
    } catch (e) {
        return res.status(500).json({
            status: "ERROR",
            message: "Internal Server Error",
            error: e.message,
        });
    }
};

//update room by id
const updateRoom = async (req, res) => {
    try {
        const roomId = req.params.id;
        const data = req.body;
        if (!roomId) {
            return res.status(200).json({
                status: "ERR",
                message: "The roomId is required",
            });
        }
        // console.log("roomId", roomId);
        const room = await RoomService.updateRoomService(roomId, data);
        return res.status(200).json(room);
    } catch (e) {
        return res.status(500).json({
            status: "ERROR",
            message: "Internal Server Error",
            error: e.message,
        });
    }
};

//delete room by id
const deleteRoom = async (req, res) => {
    try {
        const roomId = req.params.id;
        if (!roomId) {
            return res.status(200).json({
                status: "ERR",
                message: "The roomId is required",
            });
        }
        const room = await RoomService.deleteRoomService(roomId);

        return res.status(200).json(room);
    } catch (e) {
        return res.status(404).json({
            message: "! Delete Product failed !",
            error: e.message,
        });
    }
};


const getAvailableRooms_ = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        if (!startDate || !endDate) {
            return res.status(400).json({
                status: "ERR",
                message: "Start date and end date are required",
            });
        }

        const rooms = await RoomService.getAvailableRooms(startDate, endDate);
        return res.status(200).json(rooms);
    } catch (e) {
        return res.status(500).json({
            status: "ERROR",
            message: "Failed to retrieve available rooms",
            error: e.message,
        });
    }
};

const getRoomsByHotel = async (req, res) => {
    try {
        const hotelId = req.params.hotelId;
        if (!hotelId) {
            return res.status(400).json({
                status: "ERR",
                message: "Hotel ID is required"
            });
        }

        const response = await RoomService.getRoomsByHotelService(hotelId);
        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({
            status: "ERR",
            message: "Internal server error",
            error: error.message
        });
    }
};

const checkRoomAvailability = async (req, res) => {
    try {
        const { startDate, endDate, hotelId } = req.query;

        if (!startDate || !endDate || !hotelId) {
            return res.status(400).json({
                status: "ERR",
                message: "Start date, end date, and hotel ID are required"
            });
        }

        const result = await RoomService.getAvailableRooms_(startDate, endDate, hotelId);
        return res.status(200).json(result);
    } catch (error) {
        console.error("Error in checkRoomAvailability:", error);
        return res.status(500).json({
            status: "ERR",
            message: "Failed to check room availability",
            error: error.message
        });
    }
};

const getRoomsByAccountController = async (req, res) => {
    try {
        const { accountId } = req.params; // Lấy accountId từ URL
        const result = await RoomService.getRoomsByAccount(accountId);
        return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
        return res.status(500).json({ success: false, message: "Lỗi server" });
    }
};

//tuan
const getAllTypeRooms = async (req, res) => {
    try {
        const typerooms = await RoomService.getAllTypeRoomService();
        return res.status(200).json(typerooms);
    } catch (e) {
        return res.status(404).json({
            error: e.message,
        });
    }
};
const getAllRoomByHotelId = async (req, res) => {
    try {
        const hotelId = req.params.id;
        console.log("Received Hotel ID:", hotelId); // Debug

        if (!hotelId) {
            return res.status(400).json({
                status: "ERR",
                message: "Hotel ID is required",
            });
        }

        const room = await RoomService.getAllRoomByHotelIdService(hotelId);
        return res.status(200).json(room);
    } catch (error) {
        return res.status(500).json({
            error: error.message,
        });
    }
};
module.exports = {
    getAllRooms,
    createRooms,
    updateRoom,
    deleteRoom,
    getRoomByRoomId,
    getAvailableRooms,
    getAvailableRooms_,
    getRoomsByHotel,
    checkRoomAvailability,
    getRoomsByAccountController,
    getAllTypeRooms,
    getAllRoomByHotelId
};
