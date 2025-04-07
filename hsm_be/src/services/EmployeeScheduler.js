const EmployeeSchedule = require("../models/EmployeeScheduleModel");
const createEmployeeSchedule = (newEmployeeSchedule) => {
    return new Promise(async (resolve, reject) => {
        const { employees, hotels, employee_types, schedule } = newEmployeeSchedule;
        try {

            const newEmployeeSchedule = await EmployeeSchedule.create({
                employees,
                hotels,
                employee_types,
                schedule
            });

            resolve({
                status: "OK",
                message: "Success",
                data: newEmployeeSchedule,
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



module.exports = {
    createEmployeeSchedule,
};