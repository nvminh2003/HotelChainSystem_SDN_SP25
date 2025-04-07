const RoomTypes = require("../models/RoomTypeModel");

//get all rooms type
const getAllRoomsTypeService = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const allRoomsTypes = await RoomTypes.find();
            resolve({
                status: "OK",
                message: " All roomtype successfully",
                data: allRoomsTypes,
            });
        } catch (e) {
            console.log("Error: ", e.message);
            reject(e);
        }
    });
};

module.exports = { getAllRoomsTypeService, }