const EmployeeScheduleService = require("../services/EmployeeScheduler");

const createEmployeeSchedule = async (req, res) => {
    try {
        const {
            employees,
            hotels,
            employee_types,
            schedule


        } = req.body;

        // console.log("req.body", req.body);
        if (!employees || !hotels || !employee_types || !schedule) {
            return res
                .status(200)
                .json({ status: "ERR", message: "The input is required." });
        }

        const employeeSchedule = await EmployeeScheduleService.createEmployeeSchedule(req.body);
        return res.status(200).json(employeeSchedule);
    } catch (e) {
        return res.status(404).json({
            message: "Employee creation failed",
            error: e.message,
        });
    }
};


module.exports = {
    createEmployeeSchedule,
};