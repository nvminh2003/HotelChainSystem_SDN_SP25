const mongoose = require("mongoose");
const RoomAmenity = require("../models/RoomAmenityModel");
const Room = require("../models/RoomModel");
const Amenity = require("../models/AmenityModel");

// Get all room amenities
const getAllRoomAmenities = async () => {
    try {
        const roomAmenities = await RoomAmenity.find()
            .populate({
                path: 'room',
                select: 'RoomName Floor Status'
            })
            .populate({
                path: 'amenity',
                select: 'AmenitiesName Note'
            })
            .lean(); // Convert to plain JavaScript object

        // Transform the data to match the expected format
        const formattedRoomAmenities = roomAmenities.map(ra => ({
            _id: ra._id,
            room: ra.room,
            amenity: ra.amenity,
            quantity: ra.quantity,
            status: ra.status,
            updatedAt: ra.updatedAt,
            createdAt: ra.createdAt
        }));

        return {
            status: "OK",
            message: "Room amenities retrieved successfully",
            data: formattedRoomAmenities
        };
    } catch (error) {
        throw new Error(error.message);
    }
};

// Get a single room amenity by ID
const getRoomAmenityById = async (id) => {
    try {
        const roomAmenity = await RoomAmenity.findById(id)
            .populate({
                path: "room", // Use 'room' instead of 'roomeID'
                select: "RoomName Status Floor", // Select RoomName, Status, and Floor fields
            })
            .populate({
                path: "amenity", // Populate the amenity field
                select: "AmenitiesName", // Select AmenitiesName from Amenity model
            });
        if (!roomAmenity) {
            return {
                status: "ERR",
                message: "Room amenity not found",
            };
        }
        return {
            status: "OK",
            message: "Room amenity retrieved successfully",
            data: roomAmenity,
        };
    } catch (error) {
        console.error("Error in getRoomAmenityById:", error.message);
        return {
            status: "ERR",
            message: "Failed to retrieve room amenity",
            error: error.message,
        };
    }
};

// Get all room amenities that are not functioning
const getAllNotFunctioningRoomAmenities = async () => {
    try {
        const notFunctioningRoomAmenities = await RoomAmenity.find({ status: { $ne: "Functioning" } })
            .populate({
                path: "room", // Use 'room' instead of 'roomID'
                select: "RoomName Status Floor", // Select RoomName, Status, and Floor fields
            })
            .populate({
                path: "amenity", // Populate the amenity field
                select: "AmenitiesName", // Select AmenitiesName from Amenity model
            });

        return {
            status: "OK",
            message: "All not functioning room amenities retrieved successfully",
            data: notFunctioningRoomAmenities,
        };
    } catch (error) {
        console.error("Error in getAllNotFunctioningRoomAmenities:", error.message);
        return {
            status: "ERR",
            message: "Failed to retrieve not functioning room amenities",
            error: error.message,
        };
    }
};

const getAmenitiesByRoomId = async (roomId) => {
    try {
        const amenities = await RoomAmenity.find({ room: roomId }).populate("amenity").select("-createdAt -updatedAt -__v")

        return {
            status: "OK",
            message: "Amenities in room retrieved successfully",
            data: amenities,
        }
    } catch (error) {
        return {
            status: "ERR",
            message: "Failed to retrieve amenities in room",
            error: error.message,
        }
    }
}

const updateRoomAmenitiesByRoomId = async (roomId, amenities) => {
    try {
        if (!roomId || !amenities || !Array.isArray(amenities)) {
            return {
                status: "ERR",
                message: "Invalid input. RoomId and amenities should be provided and amenities should be an array.",
            };
        }

        // Xóa amenities cũ của phòng
        await RoomAmenity.deleteMany({ room: roomId });

        // Thêm amenities mới
        const updatedAmenities = await RoomAmenity.insertMany(
            amenities.map((item) => ({
                room: roomId,
                amenity: item.amenityId,
                quantity: item.quantity,
                status: item.status,
            }))
        );

        const formattedAmenities = updatedAmenities.map((item) => {
            const obj = item.toObject();
            delete obj.__v;
            delete obj.createdAt;
            delete obj.updatedAt;
            return obj;
        });

        return {
            status: "OK",
            message: "Room amenities updated successfully",
            data: formattedAmenities,
        };
    } catch (error) {
        console.error("Failed to update room amenities:", error);
        return {
            status: "ERR",
            message: "Failed to update room amenities",
            error: error.message,
        };
    }
};

// Create a new room amenity
const createRoomAmenity = async (newRoomAmenity) => {
    try {
        const { room, amenity, quantity, status } = newRoomAmenity;
        const roomAmenity = new RoomAmenity({ room, amenity, quantity, status });
        const savedRoomAmenity = await roomAmenity.save();
        return {
            status: "OK",
            message: "Room amenity created successfully",
            data: savedRoomAmenity,
        };
    } catch (error) {
        console.error("Error in createRoomAmenity:", error.message);
        return {
            status: "ERR",
            message: "Failed to create room amenity",
            error: error.message,
        };
    }
};

// Update a room amenity by ID
const updateRoomAmenity = async (id, data) => {
    try {
        const updatedRoomAmenity = await RoomAmenity.findByIdAndUpdate(id, data, { new: true })
            .populate("room", "RoomName Status Floor")
            .populate("amenity", "AmenitiesName");
        if (!updatedRoomAmenity) {
            return {
                status: "ERR",
                message: "Room amenity not found",
            };
        }
        return {
            status: "OK",
            message: "Room amenity updated successfully",
            data: updatedRoomAmenity,
        };
    } catch (error) {
        console.error("Error in updateRoomAmenity:", error.message);
        return {
            status: "ERR",
            message: "Failed to update room amenity",
            error: error.message,
        };
    }
};

// Delete a room amenity by ID
const deleteRoomAmenity = async (id) => {
    try {
        const deletedRoomAmenity = await RoomAmenity.findByIdAndDelete(id);
        if (!deletedRoomAmenity) {
            return {
                status: "ERR",
                message: "Room amenity not found",
            };
        }
        return {
            status: "OK",
            message: "Room amenity deleted successfully",
        };
    } catch (error) {
        console.error("Error in deleteRoomAmenity:", error.message);
        return {
            status: "ERR",
            message: "Failed to delete room amenity",
            error: error.message,
        };
    }
};

// Get all amenities for a specific room by room ID
const getRoomAmenitiesByRoomId = async (roomId) => {
    try {
        const roomAmenities = await RoomAmenity.find({ room: roomId })
            .populate({
                path: "room",
                select: "RoomName Status Floor",
            })
            .populate({
                path: "amenity",
                select: "AmenitiesName",
            });

        if (!roomAmenities.length) {
            return {
                status: "ERR",
                message: "No amenities found for this room",
            };
        }

        return {
            status: "OK",
            message: "Room amenities retrieved successfully",
            data: roomAmenities,
        };
    } catch (error) {
        console.error("Error in getRoomAmenitiesByRoomId:", error.message);
        return {
            status: "ERR",
            message: "Failed to retrieve room amenities",
            error: error.message,
        };
    }
};

// Update room amenities dynamically
const updateRoomAmenities = async (roomId, updates) => {
    try {
        for (const update of updates) {
            const { amenityId, quantity, status, action } = update;

            if (action === "remove") {
                await RoomAmenity.findOneAndDelete({ room: roomId, amenity: amenityId });
            } else {
                const existingAmenity = await RoomAmenity.findOne({ room: roomId, amenity: amenityId });

                if (existingAmenity) {
                    existingAmenity.quantity = quantity !== undefined ? quantity : existingAmenity.quantity;
                    existingAmenity.status = status !== undefined ? status : existingAmenity.status;
                    await existingAmenity.save();
                } else {
                    const newAmenity = new RoomAmenity({ room: roomId, amenity: amenityId, quantity, status });
                    await newAmenity.save();
                }
            }
        }

        return {
            status: "OK",
            message: "Room amenities updated successfully",
        };
    } catch (error) {
        console.error("Error in updateRoomAmenities:", error.message);
        return {
            status: "ERR",
            message: "Failed to update room amenities",
            error: error.message,
        };
    }
};

const updateRoomAmenityStatus = async (id, updateData) => {
    try {
        const roomAmenity = await RoomAmenity.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        ).populate('room', 'RoomName')
            .populate('amenity', 'AmenitiesName');

        if (!roomAmenity) {
            throw new Error("Room amenity not found");
        }

        return {
            status: "OK",
            message: "Room amenity updated successfully",
            data: roomAmenity
        };
    } catch (error) {
        throw new Error(error.message);
    }
};

module.exports = {
    getAllRoomAmenities,
    getRoomAmenityById,
    createRoomAmenity,
    updateRoomAmenity,
    deleteRoomAmenity,
    getRoomAmenitiesByRoomId,
    updateRoomAmenities,
    getAllNotFunctioningRoomAmenities,
    getAmenitiesByRoomId,
    updateRoomAmenityStatus,
    updateRoomAmenitiesByRoomId,
};
