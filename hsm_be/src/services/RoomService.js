const Employee = require("../models/EmployeeModel");
const Rooms = require("../models/RoomModel");
const RoomType = require("../models/RoomTypeModel");
const Booking = require("../models/BookingModelRFA");
//get all rooms

const getAllRoomsService = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const allRooms = await Rooms.find({},)//"-Image"
                .populate("roomtype")
                .populate("hotel", "CodeHotel NameHotel Introduce LocationHotel ")
            // Format lại dữ liệu
            const formatData = allRooms.map((room) => {
                // console.log("room_amenities:", room.room_amenities); 

                return {
                    id: room._id,
                    RoomName: room.RoomName,
                    Price: room.Price,
                    Status: room.Status,
                    Floor: room.Floor,
                    Active: room.Active,
                    IsDelete: room.IsDelete,
                    Description: room.Description,
                    typerooms: room.typerooms
                        ? { TypeName: room.typerooms.TypeName, Note: room.typerooms.Note }
                        : null,
                    // room_amenities: Array.isArray(room.room_amenities)
                    //     ? room.room_amenities.map((amenity) => ({
                    //         id: amenity.room_amenitiesID?._id,
                    //         name: amenity.room_amenitiesID?.AmenitiesName,
                    //         note: amenity.room_amenitiesID?.Note,
                    //         quantity: amenity.quantity,
                    //         status: amenity.status,
                    //     }))
                    //     : [], // Nếu room_amenities không phải mảng, trả về mảng rỗng
                    Image: Array.isArray(room.Image)
                        ? room.Image.map((img) => ({
                            url: img.url,
                            alt: img.alt || "Room Image",
                        }))
                        : [], // Kiểm tra Image có phải mảng không
                };
            });
            resolve({
                status: "OK",
                message: "All rooms successfully",
                data: allRooms,
            });
        } catch (e) {
            console.log("Error: ", e.message);
            reject(e);
        }
    });
};


//get room by id
const getRoomByRoomIdService = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const room = await Rooms.findById(id); // ,"-Image"
            if (!room) {
                resolve({
                    status: "ERR",
                    message: "The Room is not defined",
                });
            }
            resolve({
                status: "OK",
                message: "Room successfully",
                data: room,
            });
        } catch (e) {
            console.log("Error: ", e.message);
            reject(e);
        }
    });
};

//creat a room
const createRoomService = async (newRoom) => {
    try {
        const {
            RoomName, Price, Status, Floor, Active, hotel,
            roomtype, Description, Image, IsDelete,
        } = newRoom;

        const checkRoomName = await Rooms.findOne({
            RoomName: { $regex: `^${RoomName.trim()}$`, $options: "i" },
        });
        // if (checkRoomName) {
        //     return {
        //         status: "ERR",
        //         message: "The room name already exists",
        //     };
        // }
        //create room
        const newedRoomData = new Rooms({
            RoomName, Price, Status, Floor, Active, hotel,
            roomtype, Description, Image, IsDelete,
        });
        //save database
        const savedRoom = await newedRoomData.save();

        return {
            status: "OK",
            message: "Create room successfully",
            data: savedRoom,
        };
    } catch (error) {
        console.error("Error in createRoomService:", error.message);
        return {
            status: "ERR",
            message: "Create room failed",
            error: error.message,
        };
    }
};

//update room by id
const updateRoomService = async (id, data) => {
    try {
        const checkRoom = await Rooms.findById(id);
        console.log("checkRoom: ", checkRoom);
        if (!checkRoom) {
            return {
                status: "ERR",
                message: "The room is not defined",
            };
        }
        const updatedRoom = await Rooms.findByIdAndUpdate(id, data, {
            new: true,
        });
        return {
            status: "OK",
            message: "Update room successfully",
            data: updatedRoom,
        };
    } catch (error) {
        console.log("Error in UpdateRoom", error.message);
        return {
            status: "ERR",
            message: "Update room failed",
            error: error.message,
        };
    }
};

// delete room
const deleteRoomService = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const checkRoom = await Rooms.findOne({ _id: id }); //_id
            console.log("checkRoom: ", checkRoom);
            if (!checkRoom) {
                resolve({
                    status: "ERR",
                    message: "The Room is not defined",
                });
            }

            await Rooms.findByIdAndDelete(id);
            resolve({
                status: "OK",
                message: "Delete room successfully",
            });
        } catch (e) {
            reject(e);
        }
    });
};
const getAvailableRooms = async () => {
    try {
        const availableRooms = await Rooms.find({
            Status: "Available",
            IsDelete: false
        }).select("RoomName Price roomtype Description Status");

        return {
            status: "OK",
            message: "Available rooms retrieved successfully",
            data: availableRooms,
        };
    } catch (error) {
        console.error("Error in getAvailableRooms:", error.message);
        return {
            status: "ERR",
            message: "Failed to retrieve available rooms",
            error: error.message,
        };
    }
};


const getAvailableRooms_ = async (startDate, endDate, hotelId) => {
    try {
        // Convert dates to Date objects
        const checkIn = new Date(startDate);
        const checkOut = new Date(endDate);

        // Find rooms that have conflicting bookings
        const bookedRooms = await Booking.find({
            'Time.Checkin': { $lt: checkOut },
            'Time.Checkout': { $gt: checkIn },
            Status: { $ne: 'Cancelled' }  // Exclude cancelled bookings
        }).distinct('rooms');

        // Get all rooms from the specified hotel that are not in bookedRooms
        const availableRooms = await Rooms.find({
            _id: { $nin: bookedRooms },
            hotel: hotelId,
            IsDelete: false  // Only exclude deleted rooms
        }).populate('roomtype')
            .populate('hotel', 'CodeHotel NameHotel');

        // Map rooms to include availability status
        const roomsWithStatus = availableRooms.map(room => ({
            ...room.toObject(),
            Status: 'Available'  // These rooms are available since they're not in bookedRooms
        }));

        return {
            status: "OK",
            message: "Available rooms retrieved successfully",
            data: roomsWithStatus,
        };
    } catch (error) {
        console.error("Error in getAvailableRooms:", error.message);
        return {
            status: "ERR",
            message: "Failed to retrieve available rooms",
            error: error.message,
        };
    }
};

const getRoomsByHotelService = async (hotelId) => {
    try {
        const rooms = await Rooms.find({
            hotel: hotelId,
            IsDelete: false
        })
            .populate("roomtype")
            .populate("hotel", "CodeHotel NameHotel");

        return {
            status: "OK",
            message: "Rooms retrieved successfully",
            data: rooms
        };
    } catch (error) {
        console.error("Error in getRoomsByHotelService:", error.message);
        return {
            status: "ERR",
            message: "Failed to retrieve rooms",
            error: error.message
        };
    }
};

const getRoomsByAccount = async (accountId) => {
    try {
        console.time("fetchData");

        const employee = await Employee.findOne({ accountId });
        if (!employee) {
            return { success: false, message: "Không tìm thấy nhân viên với tài khoản này" };
        }

        const hotelIds = employee.hotels.map(hotel => hotel._id);

        // Sử dụng aggregation pipeline thay vì populate
        const hotelsWithRooms = await Rooms.aggregate([
            { $match: { hotel: { $in: hotelIds }, IsDelete: false } },
            {
                $lookup: {
                    from: "hotels", // Tên collection
                    localField: "hotel",
                    foreignField: "_id",
                    as: "hotelData",
                },
            },
            { $unwind: "$hotelData" },
            {
                $group: {
                    _id: "$hotel",
                    NameHotel: { $first: "$hotelData.NameHotel" },
                    LocationHotel: { $first: "$hotelData.LocationHotel" },
                    rooms: {
                        $push: {
                            id: "$_id",
                            name: "$RoomName",
                            status: "$Status",
                            floor: "$Floor",
                            price: "$Price",
                            description: "$Description",
                            roomType: "$roomtype.TypeName"
                        }
                    }
                }
            }
        ]);

        console.timeEnd("fetchData");
        return { success: true, data: hotelsWithRooms };

    } catch (error) {
        return { success: false, message: error.message };
    }
};


const getAllTypeRoomService = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const allTypeRooms = await RoomType.find({});
            resolve({
                status: "OK",
                message: " All typerooms successfully",
                data: allTypeRooms,
            });
        } catch (e) {
            console.log("Error: ", e.message);
            reject(e);
        }
    });
};
const getAllRoomByHotelIdService = (hotelId) => {
    return new Promise(async (resolve, reject) => {
        try {
            const allRooms = await Rooms.find({ hotel: hotelId }).select("-Image"); // Loại bỏ trường image
            resolve({
                status: "OK",
                message: "All rooms successfully",
                data: allRooms,
            });
        } catch (e) {
            console.log("Error: ", e.message);
            reject(e);
        }
    });
};


module.exports = {
    getAllRoomsService,
    createRoomService,
    updateRoomService,
    deleteRoomService,
    getRoomByRoomIdService,
    getAvailableRooms_,
    getAvailableRooms,
    getRoomsByHotelService,
    getRoomsByAccount,
    getAllTypeRoomService,
    getAllRoomByHotelIdService
};
