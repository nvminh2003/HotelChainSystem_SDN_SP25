import axios from "axios";

const getRoomDashboardData = async (hotelId, startDate, endDate) => {
    try {
        // First get all rooms for the hotel
        const roomsResponse = await axios.get(`${process.env.REACT_APP_API_URL_BACKEND}/rooms/hotel/${hotelId}`);

        // Then get bookings for the date range
        const bookingsResponse = await axios.get(
            `${process.env.REACT_APP_API_URL_BACKEND}/bookings/date-range?startDate=${startDate}&endDate=${endDate}`
        );

        // Map the rooms with their current status based on bookings
        const rooms = roomsResponse.data.data;
        const bookings = bookingsResponse.data.data;

        const roomsWithStatus = rooms.map(room => {
            const roomBookings = bookings.filter(booking =>
                booking.rooms._id === room._id &&
                booking.Status !== 'Cancelled'
            );

            let status = room.Status || 'Available';

            // If there's an active booking for today, mark as Occupied
            const today = new Date();
            const isOccupied = roomBookings.some(booking => {
                const checkIn = new Date(booking.Time.Checkin);
                const checkOut = new Date(booking.Time.Checkout);
                return today >= checkIn && today <= checkOut;
            });

            if (isOccupied) {
                status = 'Occupied';
            }

            return {
                ...room,
                status
            };
        });

        return {
            status: "OK",
            data: roomsWithStatus
        };
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        throw error;
    }
};

const getRoomBookingStatus = async (roomId, startDate, endDate) => {
    try {
        const response = await axios.get(
            `${process.env.REACT_APP_API_URL_BACKEND}/bookings/date-range?startDate=${startDate}&endDate=${endDate}`
        );

        const bookings = response.data.data;
        const roomBookings = bookings
            .filter(booking => booking.rooms._id === roomId)
            .map(booking => ({
                checkIn: booking.Time.Checkin,
                checkOut: booking.Time.Checkout,
                guestName: booking.customers.full_name,
                status: booking.Status
            }));

        return {
            status: "OK",
            data: roomBookings
        };
    } catch (error) {
        console.error('Error fetching room booking status:', error);
        throw error;
    }
};

export {
    getRoomDashboardData,
    getRoomBookingStatus
}; 