const Customer = require("../models/CustomerModel");

// Get all customers
const getAllCustomers = async () => {
    try {
        const customers = await Customer.find();
        return {
            status: "OK",
            message: "All customers retrieved successfully",
            data: customers,
        };
    } catch (error) {
        console.error("Error in getAllCustomers:", error.message);
        return {
            status: "ERR",
            message: "Failed to retrieve customers",
            error: error.message,
        };
    }
};

// Get a single customer by ID
const getCustomerById = async (id) => {
    try {
        const customer = await Customer.findById(id);
        if (!customer) {
            return {
                status: "ERR",
                message: "Customer not found",
            };
        }
        return {
            status: "OK",
            message: "Customer retrieved successfully",
            data: customer,
        };
    } catch (error) {
        console.error("Error in getCustomerById:", error.message);
        return {
            status: "ERR",
            message: "Failed to retrieve customer",
            error: error.message,
        };
    }
};

// Create a new customer
const createCustomer = async (customerData) => {
    try {
        const { full_name, phone, cccd } = customerData;

        if (!full_name || !phone || !cccd) {
            return {
                status: "ERR",
                message: "Missing required fields",
            };
        }

        const customer = new Customer({ full_name, phone, cccd });
        const savedCustomer = await customer.save();

        return {
            status: "OK",
            message: "Customer created successfully",
            data: savedCustomer,
        };
    } catch (error) {
        console.error("Error in createCustomer:", error.message);
        return {
            status: "ERR",
            message: "Failed to create customer",
            error: error.message,
        };
    }
};

// Update a customer by ID
const updateCustomer = async (id, data) => {
    try {
        const customer = await Customer.findById(id);
        if (!customer) {
            return {
                status: "ERR",
                message: "Customer not found",
            };
        }

        const updatedCustomer = await Customer.findByIdAndUpdate(id, data, { new: true });
        return {
            status: "OK",
            message: "Customer updated successfully",
            data: updatedCustomer,
        };
    } catch (error) {
        console.error("Error in updateCustomer:", error.message);
        return {
            status: "ERR",
            message: "Failed to update customer",
            error: error.message,
        };
    }
};

// Delete a customer by ID
const deleteCustomer = async (id) => {
    try {
        const customer = await Customer.findById(id);
        if (!customer) {
            return {
                status: "ERR",
                message: "Customer not found",
            };
        }

        await Customer.findByIdAndDelete(id);
        return {
            status: "OK",
            message: "Customer deleted successfully",
        };
    } catch (error) {
        console.error("Error in deleteCustomer:", error.message);
        return {
            status: "ERR",
            message: "Failed to delete customer",
            error: error.message,
        };
    }
};

const checkCustomerExists = async (phone, cccd) => {
    try {
        const existingCustomer = await Customer.findOne({
            $or: [{ phone }, { cccd }]
        });

        if (existingCustomer) {
            return {
                status: "ERR",
                message: "Phone number or CCCD already exists",
                data: existingCustomer,
            };
        }

        return {
            status: "OK",
            message: "Phone number and CCCD are available",
        };
    } catch (error) {
        console.error("Error in checkCustomerExists:", error.message);
        return {
            status: "ERR",
            message: "Failed to check customer existence",
            error: error.message,
        };
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
};
