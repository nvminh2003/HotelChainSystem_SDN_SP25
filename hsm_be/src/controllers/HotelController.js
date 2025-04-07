const HotelService = require("../services/HotelService");

//get all hotel 
const getAllHotel = async (req, res) => {
    try {
        const hotel = await HotelService.getAllHotel();
        return res.status(200).json(hotel);
    } catch (e) {
        return res.status(404).json({
            message: "Hotel not found",
            error: e.message,
        });
    }
};

//get hotel by id
const getHotelById = async (req, res) => {
    try {
        const hotelId = req.params.id;

        if (!hotelId) {
            return res.status(400).json({
                status: "ERR",
                message: "The hotel ID is required.",
            });
        }

        const hotel = await HotelService.getHotelByIdService(hotelId);

        if (!hotel) {
            return res.status(404).json({
                status: "ERR",
                message: "Hotel not found.",
            });
        }

        return res.status(200).json(hotel);
    } catch (e) {
        return res.status(500).json({
            status: "ERROR",
            message: "Internal Server Error",
            error: e.message,
        });
    }
};

//create a hotel
const createHotel = async (req, res) => {
    try {
        const {
            CodeHotel, NameHotel, Introduce, LocationHotel,
            images, Active, IsDelete
        } = req.body;
        console.log("req.body.hotel: ", req.body);

        if (
            !CodeHotel || !NameHotel || !Introduce || !LocationHotel
        ) {
            return res
                .status(200)
                .json({ status: "ERR", message: "The input is required." });
        }

        const hotel = await HotelService.createHotelService(req.body);
        return res.status(200).json(hotel);
    } catch (e) {
        return res.status(500).json({
            status: "ERROR",
            message: "Internal Server Error",
            error: e.message,
        });
    }
};

//update a hotel
const updateHotel = async (req, res) => {
    try {
        const hotelId = req.params.id;
        const data = req.body;

        if (!hotelId) {
            return res.status(200).json({
                status: "ERR",
                message: "The hotelId is required",
            });
        }
        console.log("hotelId: ", hotelId);

        const hotel = await HotelService.updateHotelService(hotelId, data);
        return res.status(200).json(hotel);
    } catch (error) {
        return res.status(500).json({
            status: "ERROR",
            message: "Internal Server Error",
            error: error.message,
        })
    }
}

//delete a hotel
const deleteHotel = async (req, res) => {
    try {
        const hotelId = req.params.id;

        if (!hotelId) {
            return res.status(200).json({
                status: "ERR",
                message: "The hotelId is required",
            });
        }

        const hotel = await HotelService.deleteHotelService(hotelId);
        return res.status(200).json(hotel);
    } catch (error) {
        return res.status(500).json({
            status: "ERROR",
            message: "Internal Server Error",
            error: error.message,
        });
    }
}

module.exports = {
    getAllHotel, createHotel, getHotelById, updateHotel, deleteHotel
}