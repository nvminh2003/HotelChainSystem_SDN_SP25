const DashboardService = require('../services/DashboardService');
const Employee = require('../models/EmployeeModel');
const Account = require('../models/AccountModel');

const getDashboardData = async (req, res) => {
    try {
        const employeeId = req.params.employeeId;
        console.log("Dashboard request for employee:", employeeId);

        const employee = await Employee.findById(employeeId)
            .populate('accountId')
            .populate('hotels');

        if (!employee) {
            console.log("Employee not found:", employeeId);
            return res.status(404).json({
                status: "ERR",
                message: "Employee not found"
            });
        }

        console.log("Found employee:", {
            id: employee._id,
            name: employee.FullName,
            accountId: employee.accountId?._id
        });

        // Get account permissions
        const account = await Account.findById(employee.accountId)
            .populate('permissions', 'PermissionName');

        console.log("Account data:", {
            id: account?._id,
            hasPermissions: !!account?.permissions,
            permissionCount: account?.permissions?.length,
            permissions: account?.permissions?.map(p => p.PermissionName)
        });

        if (!account || !account.permissions || account.permissions.length === 0) {
            console.log("No permissions found for account:", account?._id);
            return res.status(400).json({
                status: "ERR",
                message: "Employee has no assigned permissions"
            });
        }

        // Get the first permission name (assuming one permission per employee)
        const permission = account.permissions[0].PermissionName;
        console.log("Using permission:", permission);

        const dashboardData = await DashboardService.getDashboardData(employeeId, permission);
        console.log("Dashboard data response status:", dashboardData.status);

        return res.status(200).json(dashboardData);
    } catch (error) {
        console.error("Error in getDashboardData controller:", error);
        return res.status(500).json({
            status: "ERR",
            message: "Internal server error",
            error: error.message
        });
    }
};

module.exports = {
    getDashboardData
}; 