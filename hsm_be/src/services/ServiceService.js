const Service = require("../models/ServiceModel");

// Get all services
const getAllServices = async () => {
    try {
        const allServices = await Service.find();
        return {
            status: "OK",
            message: "All services retrieved successfully",
            data: allServices,
        };
    } catch (error) {
        console.error("Error in getAllServices:", error.message);
        return {
            status: "ERR",
            message: "Failed to retrieve services",
            error: error.message,
        };
    }
};

// Get a single service by ID
const getServiceById = async (id) => {
    try {
        const service = await Service.findById(id);
        if (!service) {
            return {
                status: "ERR",
                message: "Service not found",
            };
        }
        return {
            status: "OK",
            message: "Service retrieved successfully",
            data: service,
        };
    } catch (error) {
        console.error("Error in getServiceById:", error.message);
        return {
            status: "ERR",
            message: "Failed to retrieve service",
            error: error.message,
        };
    }
};

// Create a new service
const createService = async (newService) => {
    try {
        const { ServiceName, Price, Note, Active, Quantity, IsDelete } = newService;

        // Check if service name already exists
        const existingService = await Service.findOne({ ServiceName });
        if (existingService) {
            return {
                status: "ERR",
                message: "Service name already exists",
            };
        }

        if (!ServiceName || !Price) {
            return {
                status: "ERR",
                message: "Service name and price are required",
            }
        }

        const service = new Service({
            ServiceName,
            Price,
            Note,
            Active,
            Quantity,
            IsDelete,
        });

        const savedService = await service.save();
        return {
            status: "OK",
            message: "Service created successfully",
            data: savedService,
        };
    } catch (error) {
        console.error("Error in createService:", error.message);
        return {
            status: "ERR",
            message: "Failed to create service",
            error: error.message,
        };
    }
};

// Update a service by ID
const updateService = async (id, data) => {
    try {
        const service = await Service.findById(id);
        if (!service) {
            return {
                status: "ERR",
                message: "Service not found",
            };
        }

        const updatedService = await Service.findByIdAndUpdate(id, data, { new: true });
        return {
            status: "OK",
            message: "Service updated successfully",
            data: updatedService,
        };
    } catch (error) {
        console.error("Error in updateService:", error.message);
        return {
            status: "ERR",
            message: "Failed to update service",
            error: error.message,
        };
    }
};

// Delete a service by ID
const deleteService = async (id) => {
    try {
        const service = await Service.findById(id);
        if (!service) {
            return {
                status: "ERR",
                message: "Service not found",
            };
        }

        await Service.findByIdAndDelete(id);
        return {
            status: "OK",
            message: "Service deleted successfully",
        };
    } catch (error) {
        console.error("Error in deleteService:", error.message);
        return {
            status: "ERR",
            message: "Failed to delete service",
            error: error.message,
        };
    }
};

module.exports = {
    getAllServices,
    getServiceById,
    createService,
    updateService,
    deleteService,
};
