const Employee = require("../models/EmployeeModel");
const Hotel = require("../models/HotelModel");
const EmployeeType = require("../models/EmployeeTypeModel");
const Permission = require("../models/PermissionModel");
const Account = require("../models/AccountModel");
const EmployeeSchedule = require("../models/EmployeeScheduleModel");
const mongoose = require("mongoose");
const getAllEmployeeType = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const allEmployeeType = await EmployeeType.find();
            resolve({
                status: "OK",
                message: " All Employees successfully",
                data: allEmployeeType,
            });
        } catch (e) {
            reject(e);
        }
    });
};

const getAllPermission = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const allPermission = await Permission.find();
            resolve({
                status: "OK",
                message: " All permission successfully",
                data: allPermission,
            });
        } catch (e) {
            reject(e);
        }
    });
};

//tạo employee
const createEmployee = (newEmployee) => {
    return new Promise(async (resolve, reject) => {
        const { hotels, FullName, Phone, Email, Gender, Image, Address, accountId } = newEmployee;
        try {
            const checkEmployee = await Employee.findOne({ Email });

            if (checkEmployee !== null) {
                // Trả về lỗi với mã 400 khi email đã tồn tại
                return res.status(400).json({
                    status: "error",
                    message: "The email of employee already exists",
                });
            }

            const newEmployee = await Employee.create({
                hotels,
                FullName,
                Phone,
                Email,
                Gender,
                Image,
                Address,
                accountId,
            });

            resolve({
                status: "OK",
                message: "Success",
                data: newEmployee,
            });
        } catch (e) {
            reject({
                status: "error",
                message: e.message || "Internal server error",
                code: 500
            });
        }
    });
};
const getEmployeeWithSchedule = async (req) => {
    try {
        console.log("Request Params trong getEmployeeWithSchedule:", req.params);

        const { id } = req.params;

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return { status: "ERR", message: "employeeId không hợp lệ" };
        }

        const employeeSchedule = await EmployeeSchedule.findOne({ employees: id })
            .populate({
                path: "employees",
                populate: [
                    {
                        path: "accountId",
                        select: "-Password",
                        model: "Account",
                        populate: {
                            path: "permissions",
                            model: "permissions" // Chắc chắn đúng tên model
                        }
                    }
                ]
            })
            .populate("hotels")
            .populate("employee_types")
            .populate("schedule");

        if (!employeeSchedule) {
            return { status: "ERR", message: "Không tìm thấy lịch làm việc của nhân viên này." };
        }

        return employeeSchedule;
    } catch (error) {
        console.error("Lỗi truy vấn:", error);
        return { status: "ERR", message: "Lỗi khi lấy thông tin nhân viên", error: error.message };
    }
};

const updateEmployeeWithSchedule = async (req) => {
    try {
        console.log("Request Params:", req.params);
        console.log("Request Body:", req.body);

        const { id } = req.params; // ID của Employee
        const { FullName, Phone, Email, Gender, Image, Address, account, schedule, hotels, employee_types } = req.body;

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return { status: "ERR", message: "employeeId không hợp lệ" };
        }

        // 1. Kiểm tra nhân viên có tồn tại không
        let employee = await Employee.findById(id);
        if (!employee) {
            return { status: "ERR", message: "Không tìm thấy nhân viên." };
        }

        // 2. Cập nhật thông tin Employee nếu có dữ liệu mới
        const updateFields = {};
        if (FullName) updateFields.FullName = FullName;
        if (Phone) updateFields.Phone = Phone;
        if (Email) updateFields.Email = Email;
        if (Gender !== undefined) updateFields.Gender = Gender;
        if (Image) updateFields.Image = Image;
        if (Address) updateFields.Address = Address;
        if (hotels) updateFields.hotels = hotels;
        if (employee_types) updateFields.employee_types = employee_types;

        Object.assign(employee, updateFields);
        await employee.save();

        // 3. Cập nhật bảng Account nếu có accountId
        if (employee.accountId && account) {
            let accountData = await Account.findById(employee.accountId);
            if (accountData) {
                if (account.FullName) accountData.FullName = account.FullName;
                if (account.permissions) accountData.permissions = account.permissions;
                await accountData.save();
            }
        }

        // 4. Cập nhật lịch làm việc (schedule)
        let employeeSchedule = await EmployeeSchedule.findOne({ employees: id });
        if (!employeeSchedule) {
            employeeSchedule = new EmployeeSchedule({
                employees: id,
                hotels: hotels || [], // Thêm hotels nếu có
                employee_types: employee_types || [], // Thêm employee_types nếu có
                schedule: schedule || [],
            });
        } else {
            if (Array.isArray(schedule) && schedule.length > 0) {
                employeeSchedule.schedule = schedule;
                employeeSchedule.hotels = hotels || employeeSchedule.hotels;
                employeeSchedule.employee_types = employee_types || employeeSchedule.employee_types;
                employeeSchedule.updatedAt = new Date();
            }
        }
        await employeeSchedule.save();

        return {
            status: "OK",
            message: "Cập nhật thành công",
            employee,
            schedule: employeeSchedule.schedule
        };
    } catch (error) {
        console.error("Lỗi cập nhật:", error);
        return { status: "ERR", message: "Lỗi server", error: error.message };
    }
};

// const getListEmployees = async () => {

//     const employees = await Employee.find().populate("hotels").populate({
//         path: "accountId", // Lấy thông tin tài khoản
//         populate: {
//             path: "permissions", // Lấy thông tin quyền
//             model: "permissions",
//         },
//     }); // Load thông tin khách sạn từ bảng hotels

//     return employees.map(emp => ({
//         _id: emp._id,
//         fullname: emp.FullName,
//         email: emp.Email,
//         phone: emp.Phone,

//         position: emp.accountId && emp.accountId.permissions.length > 0
//             ? emp.accountId.permissions.map(p => `${p.PermissionName}`).join(", ")
//             : "No Position Assigned",

//         area: emp.hotels.length > 0
//             ? `${emp.hotels[0].NameHotel} - ${emp.hotels[0].LocationHotel}`
//             : "No Hotel Assigned"
//     }));
// };

const getListEmployees = async () => {
    const employees = await Employee.find()
        .populate("hotels")
        .populate({
            path: "accountId",
            populate: {
                path: "permissions",
                model: "permissions",
            },
        });

    return employees
        .filter((emp) => {
            // Kiểm tra nếu không có accountId hoặc không có permissions, giữ nhân viên này
            if (!emp.accountId || !emp.accountId.permissions) {
                return true;
            }
            // Kiểm tra xem nhân viên có quyền "Admin" hay không
            const hasAdminPermission = emp.accountId.permissions.some(
                (permission) => permission.PermissionName === "Admin"
            );
            // Nếu có quyền "Admin", loại bỏ nhân viên này (return false)
            // Nếu không có quyền "Admin", giữ nhân viên này (return true)
            return !hasAdminPermission;
        })
        .map((emp) => ({
            _id: emp._id,
            fullname: emp.FullName,
            email: emp.Email,
            phone: emp.Phone,
            position:
                emp.accountId && emp.accountId.permissions.length > 0
                    ? emp.accountId.permissions.map((p) => `${p.PermissionName}`).join(", ")
                    : "No Position Assigned",
            area:
                emp.hotels.length > 0
                    ? `${emp.hotels[0].NameHotel} - ${emp.hotels[0].LocationHotel}`
                    : "No Hotel Assigned",
            isBlocked: emp.accountId ? emp.accountId.IsDelete : false,
        }));
};

module.exports = {
    getAllEmployeeType,
    getAllPermission,
    createEmployee,
    getListEmployees,
    getEmployeeWithSchedule,
    updateEmployeeWithSchedule,
};