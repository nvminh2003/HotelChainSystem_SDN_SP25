const Amenity = require("../models/AmenityModel");
const RoomAmenity = require("../models/RoomAmenityModel");

// Get all amenities
const getAllAmenities = async () => {
    try {
        const amenities = await Amenity.find();
        return {
            status: "OK",
            message: "Amenities retrieved successfully",
            data: amenities
        };
    } catch (error) {
        throw new Error(error.message);
    }
};

// Get a single amenity by ID
const getAmenityById = async (id) => {
    try {
        const amenity = await Amenity.findById(id);
        if (!amenity) {
            return {
                status: "ERR",
                message: "Amenity not found",
            };
        }
        return {
            status: "OK",
            message: "Amenity retrieved successfully",
            data: amenity,
        };
    } catch (error) {
        console.error("Error in getAmenityById:", error.message);
        return {
            status: "ERR",
            message: "Failed to retrieve amenity",
            error: error.message,
        };
    }
};

// Create a new amenity
const createAmenity = async (amenityData) => {
    try {
        const newAmenity = new Amenity(amenityData);
        await newAmenity.save();

        return {
            status: "OK",
            message: "Amenity created successfully",
            data: newAmenity
        };
    } catch (error) {
        throw new Error(error.message);
    }
};

// Update an amenity by ID
const updateAmenity = async (id, updateData) => {
    try {
        const amenity = await Amenity.findByIdAndUpdate(
            id,
            { ...updateData },
            { new: true }
        );

        if (!amenity) {
            throw new Error("Amenity not found");
        }

        return {
            status: "OK",
            message: "Amenity updated successfully",
            data: amenity
        };
    } catch (error) {
        throw new Error(error.message);
    }
};

// Delete an amenity by ID (soft delete)
const deleteAmenity = async (id) => {
    try {
        // First check if amenity exists
        const amenity = await Amenity.findById(id);
        if (!amenity) {
            return {
                status: "ERR",
                message: "Amenity not found"
            };
        }

        // Check if amenity is being used in any rooms
        const roomAmenities = await RoomAmenity.find({ amenity: id });
        if (roomAmenities.length > 0) {
            return {
                status: "ERR",
                message: "Cannot delete amenity as it is currently assigned to one or more rooms",
                affectedRooms: roomAmenities.length
            };
        }

        // If not being used, proceed with deletion
        await Amenity.findByIdAndDelete(id);

        return {
            status: "OK",
            message: "Amenity deleted successfully"
        };
    } catch (error) {
        throw new Error(error.message);
    }
};

// Alternative: Soft delete if you prefer
const softDeleteAmenity = async (id) => {
    try {
        // First check if amenity exists
        const amenity = await Amenity.findById(id);
        if (!amenity) {
            return {
                status: "ERR",
                message: "Amenity not found"
            };
        }

        // Update amenity to mark as deleted
        await Amenity.findByIdAndUpdate(id, { IsDelete: true });

        // Optionally, update all related room amenities to "Missing" status
        await RoomAmenity.updateMany(
            { amenity: id },
            { status: 'Missing' }
        );

        return {
            status: "OK",
            message: "Amenity marked as deleted successfully"
        };
    } catch (error) {
        throw new Error(error.message);
    }
};

module.exports = {
    getAllAmenities,
    getAmenityById,
    createAmenity,
    updateAmenity,
    deleteAmenity,
    softDeleteAmenity,
};
