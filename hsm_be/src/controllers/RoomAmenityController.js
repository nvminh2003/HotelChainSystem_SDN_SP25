const RoomAmenityService = require("../services/RoomAmenityService");
const RoomAmenity = require("../models/RoomAmenityModel");
const Amenity = require("../models/AmenityModel");

// Get all room amenities
const getAllRoomAmenities = async (req, res) => {
    try {
        const response = await RoomAmenityService.getAllRoomAmenities();
        // Return the data directly without modification
        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({
            status: "ERR",
            message: "Failed to retrieve room amenities",
            error: error.message,
        });
    }
};

// Get a single room amenity by ID
const getRoomAmenityById = async (req, res) => {
    try {
        const roomAmenity = await RoomAmenityService.getRoomAmenityById(req.params.id);
        if (!roomAmenity) {
            return res.status(404).json({ message: "Room amenity not found" });
        }
        return res.status(200).json(roomAmenity);
    } catch (error) {
        return res.status(500).json({
            message: "Failed to retrieve room amenity",
            error: error.message,
        });
    }
};

const getAmenitiesByRoomIdController = async (req, res) => {
    try {
        const { roomId } = req.params;
        console.log('Searching for amenities with roomId:', roomId); // Debug log

        // Find all amenities for the room and populate the amenity reference
        const roomAmenities = await RoomAmenity.find({
            room: roomId,
            // Add IsDelete check if you have it
        })
            .populate('amenity')
            .lean();  // Convert to plain JavaScript object

        console.log('Raw room amenities found:', roomAmenities); // Debug log

        if (!roomAmenities || roomAmenities.length === 0) {
            console.log('No amenities found for room:', roomId); // Debug log
            return res.status(200).json({
                status: "OK",
                message: "No amenities found for this room",
                data: []
            });
        }

        // Transform the data to match your frontend expectations
        const formattedAmenities = roomAmenities.map(item => {
            console.log('Processing item:', item); // Debug log
            return {
                _id: item.amenity._id,
                AmenitiesName: item.amenity.AmenitiesName,
                Note: item.amenity.Note,
                quantity: item.quantity,
                status: item.status
            };
        });

        console.log('Formatted amenities:', formattedAmenities); // Debug log

        return res.status(200).json({
            status: "OK",
            message: "Amenities in room retrieved successfully",
            data: formattedAmenities
        });
    } catch (error) {
        console.error("Error in getAmenitiesByRoomIdController:", error);
        return res.status(500).json({
            status: "ERR",
            message: "Failed to retrieve amenities in room",
            error: error.message
        });
    }
};

const updateRoomAmenitiesByRoomIdController = async (req, res) => {
    try {
        const { roomId } = req.params;
        const { amenities } = req.body; // Lấy danh sách amenities từ body

        const updatedAmenities = await RoomAmenityService.updateRoomAmenitiesByRoomId(roomId, amenities);

        if (!updatedAmenities || updatedAmenities.status === "ERR") {
            return res.status(400).json(updatedAmenities);
        }

        return res.status(200).json(updatedAmenities);
    } catch (error) {
        return res.status(500).json({
            message: "Failed to update room amenities",
            error: error.message,
        });
    }
};


// Create a new room amenity
const createRoomAmenity = async (req, res) => {
    try {
        const roomAmenity = await RoomAmenityService.createRoomAmenity(req.body);
        return res.status(201).json(roomAmenity);
    } catch (error) {
        return res.status(400).json({
            message: "Failed to create room amenity",
            error: error.message,
        });
    }
};

// Update a room amenity by ID
const updateRoomAmenity = async (req, res) => {
    try {
        const updatedRoomAmenity = await RoomAmenityService.updateRoomAmenity(req.params.id, req.body);
        if (!updatedRoomAmenity) {
            return res.status(404).json({ message: "Room amenity not found" });
        }
        return res.status(200).json(updatedRoomAmenity);
    } catch (error) {
        return res.status(400).json({
            message: "Failed to update room amenity",
            error: error.message,
        });
    }
};

// Delete a room amenity by ID
const deleteRoomAmenity = async (req, res) => {
    try {
        const deletedRoomAmenity = await RoomAmenityService.deleteRoomAmenity(req.params.id);
        if (!deletedRoomAmenity) {
            return res.status(404).json({ message: "Room amenity not found" });
        }
        return res.status(200).json({ message: "Room amenity deleted successfully" });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to delete room amenity",
            error: error.message,
        });
    }
};

// Get all room amenities that are not functioning
const getNotFunctioningRoomAmenities = async (req, res) => {
    try {
        const notFunctioningRoomAmenities = await RoomAmenityService.getAllNotFunctioningRoomAmenities();
        return res.status(200).json(notFunctioningRoomAmenities);
    } catch (error) {
        return res.status(500).json({
            message: "Failed to retrieve not functioning room amenities",
            error: error.message,
        });
    }
};

const getRoomAmenitiesByRoomId = async (req, res) => {
    try {
        const roomAmenities = await RoomAmenityService.getRoomAmenitiesByRoomId(req.params.roomId);
        if (!roomAmenities.data || roomAmenities.data.length === 0) {
            return res.status(404).json({ message: "No amenities found for this room" });
        }
        return res.status(200).json(roomAmenities);
    } catch (error) {
        return res.status(500).json({
            message: "Failed to retrieve room amenities",
            error: error.message,
        });
    }
};

// Get all amenities for a room
const getRoomAmenities = async (req, res) => {
    try {
        const { roomId } = req.params;
        const amenities = await RoomAmenity.find({ room: roomId })
            .populate('amenity')
            .lean();

        return res.status(200).json({
            status: "OK",
            message: "Room amenities retrieved successfully",
            data: amenities
        });
    } catch (error) {
        console.error("Error in getRoomAmenities:", error);
        return res.status(500).json({
            status: "ERR",
            message: "Failed to retrieve room amenities",
            error: error.message
        });
    }
};

// Update amenities for a room
const updateRoomAmenities = async (req, res) => {
    try {
        const { roomId } = req.params;
        const { amenities } = req.body;

        // Remove all existing amenities for this room
        await RoomAmenity.deleteMany({ room: roomId });

        // Create new amenities
        const amenityPromises = amenities.map(async (amenity) => {
            return await RoomAmenity.create({
                room: roomId,
                amenity: amenity.amenityId,
                quantity: amenity.quantity,
                status: amenity.status
            });
        });

        await Promise.all(amenityPromises);

        // Fetch and return updated amenities
        const updatedAmenities = await RoomAmenity.find({ room: roomId })
            .populate('amenity')
            .lean();

        return res.status(200).json({
            status: "OK",
            message: "Room amenities updated successfully",
            data: updatedAmenities
        });
    } catch (error) {
        console.error("Error in updateRoomAmenities:", error);
        return res.status(500).json({
            status: "ERR",
            message: "Failed to update room amenities",
            error: error.message
        });
    }
};

module.exports = {
    getAllRoomAmenities,
    getRoomAmenityById,
    createRoomAmenity,
    updateRoomAmenity,
    deleteRoomAmenity,
    getNotFunctioningRoomAmenities,
    getRoomAmenitiesByRoomId,
    getRoomAmenities,
    updateRoomAmenities,
    getAmenitiesByRoomIdController,
    updateRoomAmenitiesByRoomIdController
};
