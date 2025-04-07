const express = require("express");
const router = express.Router();
const RoomDashboardController = require("../controllers/RoomDashboardController");

router.get("/dashboard", RoomDashboardController.getDashboardData);
router.get("/:roomId/status", RoomDashboardController.getRoomStatus);

module.exports = router; 