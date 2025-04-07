const AccountRouter = require("./AccountRouter");
const RoomRouter = require("./RoomRouter");
const RoomTypeRouter = require("./RoomTypeRouter");
const EmployeeType = require("./EmployeeType");
const Hotel = require("./HotelRouter");
const Employee = require("./EmployeeRouter");
const EmployeeSchedule = require("./EmployeeScheduleRouter");
const ServiceRouter = require("./ServiceRouter")
const BookingRouter = require("./BookingRouterRFA");
const TransactionRouter = require("./TransactionRouter");
const CustomerRouter = require("./CustomerRouter");
const AmenityRouter = require("./AmenityRouter");
const RoomAmenityRouter = require("./RoomAmenityRouter");
const HouseKeeping = require('./HouseKeepingRouter');
const Dashboard = require('./DashboardRouter');
const Revenue = require('./RevenueRouter');
const routes = (app) => {
    app.use("/api/account", AccountRouter);
    app.use("/api/rooms", RoomRouter);
    app.use("/api/roomtype", RoomTypeRouter);
    app.use("/api/employee-type", EmployeeType);
    app.use("/api/hotel", Hotel);
    app.use("/api/employee", Employee);
    app.use("/api/employee-schedule", EmployeeSchedule);
    app.use("/api/services", ServiceRouter);
    app.use("/api/bookings", BookingRouter);
    app.use("/api/transactions", TransactionRouter);
    app.use("/api/customers", CustomerRouter);
    app.use("/api/amenities", AmenityRouter);
    app.use("/api/roomamenities", RoomAmenityRouter);
    app.use("/api/housekeeping", HouseKeeping);
    app.use("/api/dashboard", Dashboard);
    app.use("/api/revenue", Revenue);
};

module.exports = routes;
