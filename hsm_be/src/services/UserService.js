const User = require("../models/UserModel");
const bcrypt = require("bcryptjs");
const { genneralAccessToken, genneralFefreshToken } = require("./JwtService");

const createUser = (newUser) => {
    return new Promise(async (resolve, reject) => {
        const { email, password, confirmPassword } = newUser;
        try {
            const checkUser = await User.findOne({
                email: email,
            });
            if (checkUser !== null) {
                resolve({
                    status: "ERR",
                    message: "The email is already",
                });
            }
            const hash = bcrypt.hashSync(password, 10);
            console.log("hash:", hash);
            const createdUser = await User.create({
                // name,
                email,
                password: hash,
                // confirmPassword: hash,
                // phone,
            });
            if (createdUser) {
                resolve({
                    status: "OK",
                    message: "Success",
                    data: createUser,
                });
            }
        } catch (e) {
            reject(e);
        }
    });
};

const loginUser = (userLogin) => {
    return new Promise(async (resolve, reject) => {
        const { email, password } = userLogin;
        // console.log("email:", email);
        try {
            const checkUser = await User.findOne({
                email: email,
            });
            // console.log("checkUser:", checkUser);
            if (checkUser === null) {
                resolve({
                    status: "ERR",
                    message: "The user is not defined",
                });
            }
            const comparePassword = bcrypt.compareSync(
                password,
                checkUser.password
            );
            // console.log("comparePassword: ", comparePassword);

            if (!comparePassword) {
                resolve({
                    status: "ERR",
                    message: "The password or user is incorrect",
                });
            }

            //access token
            const access_token = await genneralAccessToken({
                id: checkUser.id,
                isAdmin: checkUser.isAdmin,
            });
            // console.log(" access token: ", access_token);

            // refresh token
            const refresh_token = await genneralFefreshToken({
                id: checkUser.id,
                isAdmin: checkUser.isAdmin,
            });

            // console.log("refresh_token: ", refresh_token);
            resolve({
                status: "OK",
                message: "Success",
                access_token,
                refresh_token,
            });
        } catch (e) {
            reject(e);
        }
    });
};

const updateUser = (id, data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const checkUser = await User.findOne({ _id: id }); //_id
            console.log("checkUser: ", checkUser);
            if (checkUser === null) {
                resolve({
                    status: "OK",
                    message: "The user is not defined",
                });
            }

            const updatedUser = await User.findByIdAndUpdate(id, data, {
                new: true,
            });
            resolve({
                status: "OK",
                message: "Update User Success",
                data: updatedUser,
            });
        } catch (e) {
            reject(e);
        }
    });
};

const deleteUser = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const checkUser = await User.findOne({ _id: id }); //_id
            console.log("checkUser: ", checkUser);
            if (checkUser === null) {
                resolve({
                    status: "Error",
                    message: "The user is not defined",
                });
            }

            await User.findByIdAndDelete(id);
            resolve({
                status: "OK",
                message: "Delete user successfully",
            });
        } catch (e) {
            reject(e);
        }
    });
};

const deleteManyUser = (ids) => {
    return new Promise(async (resolve, reject) => {
        try {
            await User.deleteMany({ _id: ids });
            resolve({
                status: "OK",
                message: "Delete user successfully",
            });
        } catch (e) {
            reject(e);
        }
    });
};

const getAllUsers = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const allUser = await User.find();
            resolve({
                status: "OK",
                message: " All users successfully",
                data: allUser,
            });
        } catch (e) {
            reject(e);
        }
    });
};

const getDetailsUser = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const user = await User.findOne({ _id: id }); //_id
            if (!user) {
                return resolve({
                    status: "ERR",
                    message: "The user is not defined",
                });
            }

            return resolve({
                status: "OK",
                message: "User successfully retrieved",
                data: user,
            });
        } catch (e) {
            return reject({
                status: "ERR",
                message: "Database query failed",
                error: e.message,
            });
        }
    });
};

module.exports = {
    createUser,
    loginUser,
    updateUser,
    deleteUser,
    getAllUsers,
    getDetailsUser,
    deleteManyUser,
};
