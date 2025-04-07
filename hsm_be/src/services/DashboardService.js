const Transaction = require("../models/TransactionModel");
const Room = require("../models/RoomModel");
const Employee = require("../models/EmployeeModel");
const Hotel = require("../models/HotelModel");
const Booking = require("../models/BookingModelRFA");
const moment = require('moment');

const getDashboardData = async (employeeId, permission) => {
    try {
        console.log("Getting dashboard data for:", { employeeId, permission });

        const employee = await Employee.findById(employeeId).populate('hotels');
        if (!employee) {
            console.log("Employee not found:", employeeId);
            return {
                status: "ERR",
                message: "Employee not found"
            };
        }

        const hotelIds = employee.hotels.map(hotel => hotel._id);
        const today = moment().startOf('day');
        const thisMonth = moment().startOf('month');

        // Base metrics object
        let dashboardData = {
            metrics: {},
            recentActivity: [],
            statistics: {},
            charts: {}
        };

        // Admin Dashboard - Focus on overall business performance
        if (permission === "Admin") {
            const allHotels = await Hotel.find();
            const allRooms = await Room.find();
            const allEmployees = await Employee.find()
                .populate('hotels')
                .populate({
                    path: 'accountId',
                    populate: {
                        path: 'permissions',
                        select: 'PermissionName'
                    }
                });

            // Get monthly revenue data
            const monthlyRevenue = await Transaction.aggregate([
                {
                    $match: {
                        Status: "Completed",
                        createdAt: { $gte: moment().subtract(6, 'months').toDate() }
                    }
                },
                {
                    $group: {
                        _id: { $month: "$createdAt" },
                        revenue: { $sum: "$FinalPrice" }
                    }
                }
            ]);

            // Get hotel performance metrics
            const hotelPerformance = await Promise.all(allHotels.map(async hotel => {
                const hotelRooms = await Room.countDocuments({ hotel: hotel._id });
                const occupiedRooms = await Booking.countDocuments({
                    'rooms.hotel': hotel._id,
                    Status: "Confirmed",
                    'Time.Checkin': { $lte: new Date() },
                    'Time.Checkout': { $gte: new Date() }
                });

                return {
                    hotelId: hotel._id,
                    name: hotel.NameHotel,
                    totalRooms: hotelRooms,
                    occupancyRate: (occupiedRooms / hotelRooms * 100).toFixed(2),
                    revenue: await Transaction.aggregate([
                        {
                            $match: {
                                Status: "Completed",
                                'bookings.rooms.hotel': hotel._id,
                                createdAt: { $gte: thisMonth.toDate() }
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                total: { $sum: "$FinalPrice" }
                            }
                        }
                    ]).then(result => result[0]?.total || 0)
                };
            }));

            dashboardData = {
                metrics: {
                    totalHotels: allHotels.length,
                    totalRooms: allRooms.length,
                    totalEmployees: allEmployees.length,
                    totalBookings: await Booking.countDocuments(),
                    monthlyRevenue: await Transaction.aggregate([
                        {
                            $match: {
                                Status: "Completed",
                                createdAt: { $gte: thisMonth.toDate() }
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                total: { $sum: "$FinalPrice" }
                            }
                        }
                    ]).then(result => result[0]?.total || 0),
                    averageOccupancyRate: (await Booking.countDocuments({
                        Status: "Confirmed",
                        'Time.Checkin': { $lte: new Date() },
                        'Time.Checkout': { $gte: new Date() }
                    }) / allRooms.length * 100).toFixed(2)
                },
                statistics: {
                    hotelPerformance,
                    employeeStats: {
                        managers: allEmployees.filter(emp => emp.accountId?.permissions?.some(p => p.PermissionName === "Hotel-Manager")).length,
                        receptionists: allEmployees.filter(emp => emp.accountId?.permissions?.some(p => p.PermissionName === "Receptionist")).length,
                        janitors: allEmployees.filter(emp => emp.accountId?.permissions?.some(p => p.PermissionName === "Janitor")).length
                    },
                    revenueByMonth: monthlyRevenue
                },
                recentActivity: await Transaction.find()
                    .sort({ createdAt: -1 })
                    .limit(10)
                    .populate('bookings'),
                charts: {
                    occupancyTrend: await Booking.aggregate([
                        {
                            $match: {
                                Status: "Confirmed",
                                'Time.Checkin': { $gte: moment().subtract(30, 'days').toDate() }
                            }
                        },
                        {
                            $group: {
                                _id: { $dateToString: { format: "%Y-%m-%d", date: "$Time.Checkin" } },
                                count: { $sum: 1 }
                            }
                        }
                    ])
                }
            };
        }
        // Hotel Manager or Hotel Admin Dashboard - Focus on specific hotel performance
        else if (permission === "Hotel-Manager" || permission === "Hotel-Admin") {
            const hotelRooms = await Room.find({ hotel: { $in: hotelIds } });
            const hotelEmployees = await Employee.find()
                .populate('hotels')
                .populate({
                    path: 'accountId',
                    populate: {
                        path: 'permissions',
                        select: 'PermissionName'
                    }
                });

            // Filter employees to only those assigned to the specific hotels
            const filteredEmployees = hotelEmployees.filter(emp =>
                emp.hotels.some(hotel => hotelIds.includes(hotel._id.toString()))
            );

            // Get today's check-ins and check-outs
            const todayActivity = {
                checkIns: await Booking.countDocuments({
                    'rooms.hotel': { $in: hotelIds },
                    Status: "Confirmed",
                    'Time.Checkin': {
                        $gte: today.toDate(),
                        $lt: moment(today).endOf('day').toDate()
                    }
                }),
                checkOuts: await Booking.countDocuments({
                    'rooms.hotel': { $in: hotelIds },
                    Status: "Confirmed",
                    'Time.Checkout': {
                        $gte: today.toDate(),
                        $lt: moment(today).endOf('day').toDate()
                    }
                })
            };

            dashboardData = {
                metrics: {
                    totalRooms: hotelRooms.length,
                    occupiedRooms: await Booking.countDocuments({
                        'rooms.hotel': { $in: hotelIds },
                        Status: "Confirmed",
                        'Time.Checkin': { $lte: new Date() },
                        'Time.Checkout': { $gte: new Date() }
                    }),
                    totalEmployees: filteredEmployees.length,
                    monthlyRevenue: await Transaction.aggregate([
                        {
                            $match: {
                                Status: "Completed",
                                'bookings.rooms.hotel': { $in: hotelIds },
                                createdAt: { $gte: thisMonth.toDate() }
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                total: { $sum: "$FinalPrice" }
                            }
                        }
                    ]).then(result => result[0]?.total || 0)
                },
                statistics: {
                    todayActivity,
                    roomStatus: {
                        available: await Room.countDocuments({ hotel: { $in: hotelIds }, Status: "Available" }),
                        needCleaning: await Room.countDocuments({ hotel: { $in: hotelIds }, Status: "Available - Need Cleaning" }),
                        cleaning: await Room.countDocuments({ hotel: { $in: hotelIds }, Status: "Available - Cleaning" })
                    },
                    employeeStats: {
                        receptionists: filteredEmployees.filter(emp => emp.accountId?.permissions?.some(p => p.PermissionName === "Receptionist")).length,
                        janitors: filteredEmployees.filter(emp => emp.accountId?.permissions?.some(p => p.PermissionName === "Janitor")).length
                    },
                    upcomingCheckouts: await Booking.find({
                        'rooms.hotel': { $in: hotelIds },
                        Status: "Confirmed",
                        'Time.Checkout': {
                            $gte: today.toDate(),
                            $lt: moment(today).add(3, 'days').toDate()
                        }
                    }).populate('rooms customers').limit(5)
                },
                recentActivity: await Transaction.find({
                    'bookings.rooms.hotel': { $in: hotelIds }
                })
                    .sort({ createdAt: -1 })
                    .limit(10)
                    .populate('bookings'),
                charts: {
                    dailyRevenue: await Transaction.aggregate([
                        {
                            $match: {
                                Status: "Completed",
                                'bookings.rooms.hotel': { $in: hotelIds },
                                createdAt: { $gte: moment().subtract(7, 'days').toDate() }
                            }
                        },
                        {
                            $group: {
                                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                                revenue: { $sum: "$FinalPrice" }
                            }
                        }
                    ])
                }
            };
        }
        // Receptionist Dashboard - Focus on daily operations
        else if (permission === "Receptionist") {
            const todayCheckIns = await Booking.find({
                'rooms.hotel': { $in: hotelIds },
                Status: "Confirmed",
                'Time.Checkin': {
                    $gte: today.toDate(),
                    $lt: moment(today).endOf('day').toDate()
                }
            }).populate('rooms customers');

            const todayCheckOuts = await Booking.find({
                'rooms.hotel': { $in: hotelIds },
                Status: "Confirmed",
                'Time.Checkout': {
                    $gte: today.toDate(),
                    $lt: moment(today).endOf('day').toDate()
                }
            }).populate('rooms customers');

            dashboardData = {
                metrics: {
                    todayCheckIns: todayCheckIns.length,
                    todayCheckOuts: todayCheckOuts.length,
                    availableRooms: await Room.countDocuments({
                        hotel: { $in: hotelIds },
                        Status: "Available"
                    }),
                    pendingBookings: await Booking.countDocuments({
                        'rooms.hotel': { $in: hotelIds },
                        Status: "Pending"
                    })
                },
                statistics: {
                    todayActivity: {
                        checkIns: todayCheckIns,
                        checkOuts: todayCheckOuts
                    },
                    roomStatus: {
                        available: await Room.countDocuments({ hotel: { $in: hotelIds }, Status: "Available" }),
                        needCleaning: await Room.countDocuments({ hotel: { $in: hotelIds }, Status: "Available - Need Cleaning" }),
                        cleaning: await Room.countDocuments({ hotel: { $in: hotelIds }, Status: "Available - Cleaning" })
                    },
                    upcomingArrivals: await Booking.find({
                        'rooms.hotel': { $in: hotelIds },
                        Status: "Confirmed",
                        'Time.Checkin': {
                            $gt: today.toDate(),
                            $lt: moment(today).add(24, 'hours').toDate()
                        }
                    }).populate('rooms customers').limit(5)
                },
                recentActivity: await Booking.find({
                    'rooms.hotel': { $in: hotelIds }
                })
                    .sort({ createdAt: -1 })
                    .limit(10)
                    .populate('rooms customers')
            };
        }
        // Janitor Dashboard - Focus on room maintenance
        else if (permission === "Janitor") {
            const roomsToClean = await Room.find({
                hotel: { $in: hotelIds },
                Status: "Available - Need Cleaning"
            }).populate('hotel');

            const upcomingCheckouts = await Booking.find({
                'rooms.hotel': { $in: hotelIds },
                Status: "Confirmed",
                'Time.Checkout': {
                    $gte: today.toDate(),
                    $lt: moment(today).add(24, 'hours').toDate()
                }
            }).populate('rooms');

            dashboardData = {
                metrics: {
                    totalRoomsToClean: roomsToClean.length,
                    roomsCleaning: await Room.countDocuments({
                        hotel: { $in: hotelIds },
                        Status: "Available - Cleaning"
                    }),
                    upcomingCheckouts: upcomingCheckouts.length,
                    completedToday: await Room.countDocuments({
                        hotel: { $in: hotelIds },
                        Status: "Available",
                        updatedAt: {
                            $gte: today.toDate(),
                            $lt: moment(today).endOf('day').toDate()
                        }
                    })
                },
                statistics: {
                    roomsNeedingCleaning: roomsToClean.map(room => ({
                        roomId: room._id,
                        roomName: room.RoomName,
                        floor: room.Floor,
                        hotel: room.hotel.NameHotel
                    })),
                    upcomingCheckouts: upcomingCheckouts.map(booking => ({
                        roomName: booking.rooms.RoomName,
                        checkoutTime: booking.Time.Checkout
                    }))
                },
                recentActivity: await Room.find({
                    hotel: { $in: hotelIds },
                    Status: { $in: ["Available", "Available - Need Cleaning", "Available - Cleaning"] }
                })
                    .sort({ updatedAt: -1 })
                    .limit(10)
                    .populate('hotel')
            };
        }

        return {
            status: "OK",
            message: "Dashboard data retrieved successfully",
            data: dashboardData
        };
    } catch (error) {
        console.error("Error in getDashboardData:", error);
        return {
            status: "ERR",
            message: "Failed to retrieve dashboard data",
            error: error.message
        };
    }
};

module.exports = {
    getDashboardData
}; 