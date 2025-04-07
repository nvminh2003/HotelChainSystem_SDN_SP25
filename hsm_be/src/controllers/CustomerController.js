const CustomerService = require("../services/CustomerService");

// Get all customers
const getAllCustomers = async (req, res) => {
    try {
        const customers = await CustomerService.getAllCustomers();
        return res.status(200).json(customers);
    } catch (e) {
        return res.status(500).json({ message: "Error retrieving customers", error: e.message });
    }
};

// Get a customer by ID
const getCustomerById = async (req, res) => {
    try {
        const customer = await CustomerService.getCustomerById(req.params.id);
        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }
        return res.status(200).json(customer);
    } catch (e) {
        return res.status(500).json({ message: "Error retrieving customer", error: e.message });
    }
};

// Create a new customer
const createCustomer = async (req, res) => {
    try {
        const customer = await CustomerService.createCustomer(req.body);
        return res.status(201).json(customer);
    } catch (e) {
        return res.status(400).json({ message: "Customer creation failed", error: e.message });
    }
};

// Update a customer
const updateCustomer = async (req, res) => {
    try {
        const updatedCustomer = await CustomerService.updateCustomer(req.params.id, req.body);
        if (!updatedCustomer) {
            return res.status(404).json({ message: "Customer not found" });
        }
        return res.status(200).json(updatedCustomer);
    } catch (e) {
        return res.status(400).json({ message: "Customer update failed", error: e.message });
    }
};

// Delete a customer
const deleteCustomer = async (req, res) => {
    try {
        const deletedCustomer = await CustomerService.deleteCustomer(req.params.id);
        if (!deletedCustomer) {
            return res.status(404).json({ message: "Customer not found" });
        }
        return res.status(200).json({ message: "Customer deleted successfully" });
    } catch (e) {
        return res.status(500).json({ message: "Customer deletion failed", error: e.message });
    }
};

// Check if phone or CCCD exists
const checkCustomerExists = async (req, res) => {
    try {
        const { phone, cccd } = req.body;
        if (!phone && !cccd) {
            return res.status(400).json({ message: "Phone number or CCCD is required" });
        }

        const result = await CustomerService.checkCustomerExists(phone, cccd);
        return res.status(200).json(result);
    } catch (e) {
        return res.status(500).json({ message: "Error checking customer existence", error: e.message });
    }
};

module.exports = { checkCustomerExists };


module.exports = {
    getAllCustomers,
    getCustomerById,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    checkCustomerExists,
}
