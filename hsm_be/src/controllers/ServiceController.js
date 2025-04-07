const ServiceService = require("../services/ServiceService");

// Get all services
const getAllServices = async (req, res) => {
    try {
        const services = await ServiceService.getAllServices();
        return res.status(200).json(services);
    } catch (e) {
        return res.status(404).json({
            message: "Services not found",
            error: e.message,
        });
    }
};

// Get a single service by ID
const getServiceById = async (req, res) => {
    try {
        const service = await ServiceService.getServiceById(req.params.id);
        if (!service) {
            return res.status(404).json({ message: "Service not found" });
        }
        return res.status(200).json(service);
    } catch (e) {
        return res.status(500).json({
            message: "Error retrieving service",
            error: e.message,
        });
    }
};

// Create a new service
const createService = async (req, res) => {
    try {
        const service = await ServiceService.createService(req.body);
        return res.status(201).json(service);
    } catch (e) {
        return res.status(400).json({
            message: "Service creation failed",
            error: e.message,
        });
    }
};

// Update a service by ID
const updateService = async (req, res) => {
    try {
        const updatedService = await ServiceService.updateService(req.params.id, req.body);
        if (!updatedService) {
            return res.status(404).json({ message: "Service not found" });
        }
        return res.status(200).json(updatedService);
    } catch (e) {
        return res.status(400).json({
            message: "Service update failed",
            error: e.message,
        });
    }
};

// Delete a service by ID
const deleteService = async (req, res) => {
    try {
        const deletedService = await ServiceService.deleteService(req.params.id);
        if (!deletedService) {
            return res.status(404).json({ status: "ERR", message: "Service not found" });
        }
        return res.status(200).json({ status: "OK", message: "Service deleted successfully" });
    } catch (e) {
        return res.status(500).json({
            message: "Service deletion failed",
            error: e.message,
        });
    }
};

module.exports = {
    getAllServices,
    getServiceById,
    createService,
    updateService,
    deleteService,
};
