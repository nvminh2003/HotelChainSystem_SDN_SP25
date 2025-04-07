const express = require("express");
const router = express.Router();
const employeeScheduleController = require("../controllers/EmployeeScheduleController");
const {
    authMiddleware,
    authUserMiddleware,
} = require("../middleware/authMiddleware");

router.post("/create-employee-schedule", employeeScheduleController.createEmployeeSchedule);

module.exports = router;