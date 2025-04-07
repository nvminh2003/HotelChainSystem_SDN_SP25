const RoomTypeService = require("../services/RoomTypeService");

//get all rooms
const getAllRoomsType = async (req, res) => {
    try {
        const roomType = await RoomTypeService.getAllRoomsTypeService();
        return res.status(200).json(roomType);
    } catch (e) {
        return res.status(404).json({
            error: e.message,
        });
    }
};

module.exports = {
    getAllRoomsType,
}