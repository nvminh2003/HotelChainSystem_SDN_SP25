const Transaction = require("../models/TransactionModel");
const Employee = require("../models/EmployeeModel");
const Hotel = require("../models/HotelModel");
const Booking = require("../models/BookingModelRFA");

const getRevenueData = async (employeeId, timeRange, startDate, endDate) => {
    try {

        // First, let's check if we can find any transactions at all
        const allTransactions = await Transaction.find({});

        const employee = await Employee.findById(employeeId)
            .populate('hotels')
            .populate('permission');

        if (!employee) {
            console.log('Employee not found:', employeeId);
            return {
                status: "ERR",
                message: "Employee not found"
            };
        }

        // Build date range filter
        const startDateTime = new Date(startDate);
        const endDateTime = new Date(endDate);

        // Basic query to find completed transactions within date range
        const query = {
            Status: "Completed",
            BuyTime: {
                $gte: startDateTime,
                $lte: endDateTime
            }
        };

        // Get hotel IDs for the employee
        const hotelIds = employee.hotels.map(hotel => hotel._id);

        // Check permissions for data filtering
        const isAdmin = employee.permission?.PermissionName === "Admin";
        const isHotelAdmin = employee.permission?.PermissionName === "Hotel-Admin";
        const isHotelManager = employee.permission?.PermissionName === "Hotel-Manager";

        // Filter by hotel for Hotel-Admin and Hotel-Manager
        if (hotelIds.length > 0 && (isHotelAdmin || isHotelManager)) {
            // Look up bookings for these hotels
            const hotelBookings = await Booking.find({
                'hotel': { $in: hotelIds }
            }).distinct('_id');

            console.log('Found bookings for hotels:', {
                hotelIds,
                bookingIds: hotelBookings
            });

            // Only add the booking filter if we found bookings
            if (hotelBookings.length > 0) {
                query.bookings = { $in: hotelBookings };
            } else {
                // If no bookings found, let's check if there are any transactions with these hotels
                console.log('No bookings found for hotels, checking transactions directly...');
                const transactions = await Transaction.find({
                    Status: "Completed",
                    'bookings.hotel': { $in: hotelIds }
                });
                console.log('Found transactions for hotels:', transactions.length);
            }
        }

        console.log('Final query to be executed:', JSON.stringify(query, null, 2));

        // Get transactions
        const transactions = await Transaction.find(query)
            .populate({
                path: 'bookings',
                populate: {
                    path: 'rooms',
                    populate: {
                        path: 'hotel'
                    }
                }
            })
            .populate('services.serviceId');

        console.log('Found transactions:', transactions.map(t => ({
            id: t._id,
            date: t.BuyTime,
            finalPrice: t.FinalPrice,
            status: t.Status,
            bookings: t.bookings?.map(b => ({
                id: b._id,
                sumPrice: b.SumPrice,
                hotel: b.hotel
            }))
        })));

        if (transactions.length === 0) {
            console.log('No transactions found for the period');
            // Return empty data structure
            return {
                status: "OK",
                message: "No transactions found for the period",
                data: {
                    totalRevenue: 0,
                    previousRevenue: 0,
                    bookingRevenue: 0,
                    serviceRevenue: 0,
                    revenueByDay: [],
                    recentTransactions: [],
                    topPerformingRooms: []
                }
            };
        }

        // Calculate metrics
        const totalRevenue = transactions.reduce((sum, t) => sum + Number(t.FinalPrice || 0), 0);
        console.log('Total revenue calculation:', {
            transactions: transactions.map(t => t.FinalPrice),
            total: totalRevenue
        });

        // Calculate booking revenue
        const bookingRevenue = transactions.reduce((sum, t) => {
            const bookingSum = t.bookings?.reduce((bSum, b) => bSum + Number(b.SumPrice || 0), 0) || 0;
            console.log('Booking revenue for transaction:', {
                transactionId: t._id,
                bookings: t.bookings?.map(b => b.SumPrice),
                sum: bookingSum
            });
            return sum + bookingSum;
        }, 0);

        // Calculate service revenue
        const serviceRevenue = transactions.reduce((sum, t) => {
            const serviceSum = t.services?.reduce((sSum, s) => sSum + Number(s.totalPrice || 0), 0) || 0;
            console.log('Service revenue for transaction:', {
                transactionId: t._id,
                services: t.services?.map(s => s.totalPrice),
                sum: serviceSum
            });
            return sum + serviceSum;
        }, 0);

        // Calculate revenue by day
        const revenueByDay = transactions.reduce((acc, t) => {
            const date = t.BuyTime.toISOString().split('T')[0];
            if (!acc[date]) {
                acc[date] = {
                    date,
                    revenue: 0,
                    bookings: 0,
                    services: 0
                };
            }
            acc[date].revenue += Number(t.FinalPrice || 0);
            acc[date].bookings += t.bookings?.reduce((sum, b) => sum + Number(b.SumPrice || 0), 0) || 0;
            acc[date].services += t.services?.reduce((sum, s) => sum + Number(s.totalPrice || 0), 0) || 0;
            return acc;
        }, {});

        // Sort days chronologically
        const sortedRevenueByDay = Object.values(revenueByDay).sort((a, b) =>
            new Date(a.date) - new Date(b.date)
        );

        const result = {
            status: "OK",
            message: "Revenue data retrieved successfully",
            data: {
                totalRevenue,
                previousRevenue: 0,
                bookingRevenue,
                serviceRevenue,
                revenueByDay: sortedRevenueByDay,
                recentTransactions: transactions
                    .sort((a, b) => new Date(b.BuyTime) - new Date(a.BuyTime))
                    .slice(0, 10)
                    .map(t => ({
                        id: t._id,
                        date: t.BuyTime.toISOString().split('T')[0],
                        type: t.services?.length > 0 ? 'Service' : 'Booking',
                        amount: t.FinalPrice,
                        status: t.Status
                    })),
                topPerformingRooms: []
            }
        };

        console.log('Final result:', JSON.stringify(result, null, 2));
        return result;

    } catch (error) {
        console.error("Error in getRevenueData:", error);
        return {
            status: "ERR",
            message: "Failed to retrieve revenue data",
            error: error.message
        };
    }
};

module.exports = {
    getRevenueData
}; 