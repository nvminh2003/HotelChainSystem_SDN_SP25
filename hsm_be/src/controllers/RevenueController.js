const RevenueService = require('../services/RevenueService');
const Employee = require('../models/EmployeeModel');
const Account = require('../models/AccountModel');

const getRevenueData = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const { timeRange, startDate, endDate } = req.query;

        // Verify employee and permissions
        const employee = await Employee.findById(employeeId)
            .populate('accountId')
            .populate('hotels');

        if (!employee) {
            return res.status(404).json({
                status: "ERR",
                message: "Employee not found"
            });
        }

        // Get account permissions
        const account = await Account.findById(employee.accountId)
            .populate('permissions', 'PermissionName');

        if (!account || !account.permissions || account.permissions.length === 0) {
            return res.status(403).json({
                status: "ERR",
                message: "Employee has no assigned permissions"
            });
        }

        // Check if user has permission to view revenue data
        const allowedRoles = ["Admin", "Hotel-Manager", "Hotel-Admin"];
        const hasPermission = account.permissions.some(p =>
            allowedRoles.includes(p.PermissionName)
        );

        if (!hasPermission) {
            return res.status(403).json({
                status: "ERR",
                message: "Insufficient permissions to view revenue data"
            });
        }

        // Get the permission name for proper data filtering
        const permission = account.permissions[0].PermissionName;

        const revenueData = await RevenueService.getRevenueData(
            employeeId,
            timeRange,
            startDate,
            endDate
        );

        return res.status(200).json(revenueData);
    } catch (error) {
        console.error("Error in getRevenueData controller:", error);
        return res.status(500).json({
            status: "ERR",
            message: "Internal server error",
            error: error.message
        });
    }
};

module.exports = {
    getRevenueData
}; 