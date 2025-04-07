const express = require("express");
const router = express.Router();
const userController = require("../controllers/UserController");
const {
    authMiddleware,
    authUserMiddleware,
} = require("../middleware/authMiddleware");

router.post("/sign-up", userController.createUser);
router.post("/sign-in", userController.loginUser);
router.post("/log-out", userController.logoutUser);
router.put("/update-user/:id", authUserMiddleware, userController.updateUser);
router.delete("/delete-user/:id", authMiddleware, userController.deleteUser);
router.get("/get-all-user", authMiddleware, userController.getAllUsers);
router.get(
    "/get-details/:id",
    authUserMiddleware,
    userController.getDetailsUser
);
router.post("/refresh-token", userController.refreshToken);
router.post("/delete-many-user", authMiddleware, userController.deleteMany);

module.exports = router;
