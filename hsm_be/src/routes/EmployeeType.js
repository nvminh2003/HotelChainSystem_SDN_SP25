const express = require("express");
const router = express.Router();
const employeeController = require("../controllers/EmployeeController");
const {
    authMiddleware,
    authUserMiddleware,
} = require("../middleware/authMiddleware");

router.get("/get-all-employeeType", employeeController.getAllEmployeeType);
router.get("/get-all-permission", employeeController.getAllPermission);

module.exports = router;
