const { default: mongoose } = require("mongoose");
const Account = require("../models/AccountModel");
const { generateAccessToken, generateFefreshToken } = require("./JwtService");
const bcrypt = require("bcryptjs");

const createAcount = (newAccount) => {
    return new Promise(async (resolve, reject) => {
        const { FullName, Email, Username, Password, permissions } = newAccount;
        try {
            const checkUser = await Account.findOne({
                Email: Email,
            });
            if (checkUser !== null) {
                return resolve({
                    status: "ERR",
                    message: "The email is already",
                });
            }
            const hash = bcrypt.hashSync(Password, 10);
            // console.log("hash:", hash);
            const createdAccount = await Account.create({
                FullName,
                Email,
                Username,
                Password: hash,
                permissions,
            });
            if (createdAccount) {
                resolve({
                    status: "OK",
                    message: "Account created successfully!",
                    data: createdAccount,
                });
            }
            console.log("Created Account:", createdAccount);
        } catch (e) {
            reject(e);
        }
    });
};

const loginAccount = async (accountLogin) => {
    try {
        const { email, password } = accountLogin;

        // Check if account exists
        const account = await Account.findOne({ Email: email });
        if (!account) {
            return {
                status: "ERR",
                message: "The account is not found",
            };
        }

        // Compare password
        const isPasswordValid = await bcrypt.compare(
            password,
            account.Password
        );
        if (!isPasswordValid) {
            return {
                status: "ERR",
                message: "The email or password is incorrect",
            };
        }

        // Generate tokens with only ID
        const access_token = await generateAccessToken({
            id: account.id,
        });

        const refresh_token = await generateFefreshToken({
            id: account.id,
        });

        // Save refresh token to database
        await Account.findByIdAndUpdate(account.id, {
            refreshToken: refresh_token
        });

        // Return user data separately from tokens
        return {
            status: "OK",
            message: "Login successful",
            access_token,
            refresh_token,
            data: {
                id: account.id,
                email: account.Email,
                fullName: account.FullName,
                permissions: account.permissions,  // Send permissions in response, not in token
            }
        };
    } catch (error) {
        console.error("Error in loginAccount:", error);
        return {
            status: "ERR",
            message: "An error occurred during login",
        };
    }
};

const refreshTokenService = async (refreshToken) => {
    try {
        // Find account with this refresh token
        const account = await Account.findOne({ refreshToken });

        if (!account) {
            return {
                status: "ERR",
                message: "Refresh token not found",
            };
        }

        // Generate new tokens
        const newAccessToken = await generateAccessToken({
            id: account.id,
        });

        const newRefreshToken = await generateFefreshToken({
            id: account.id,
        });

        // Update refresh token in database
        await Account.findByIdAndUpdate(account.id, {
            refreshToken: newRefreshToken
        });

        return {
            status: "OK",
            access_token: newAccessToken,
            refresh_token: newRefreshToken,
        };
    } catch (error) {
        return {
            status: "ERR",
            message: "Failed to refresh token",
        };
    }
};

const logout = async (accountId) => {
    try {
        // Remove refresh token from database
        await Account.findByIdAndUpdate(accountId, {
            refreshToken: null
        });

        return {
            status: "OK",
            message: "Logged out successfully"
        };
    } catch (error) {
        return {
            status: "ERR",
            message: "Failed to logout"
        };
    }
};

const getAllAccounts = async () => {
    try {
        const allAccounts = await Account.aggregate([
            {
                $lookup: {
                    from: "permissions",
                    localField: "permissions",
                    foreignField: "_id",
                    as: "permissionDetails",
                },
            },
            {
                $project: {
                    _id: 1,
                    FullName: 1,
                    Email: 1,
                    Username: 1,
                    // Password: 1, // ❌ Remove this for security
                    permissionDetails: 1,
                    IsDelete: 1,
                },
            },
        ]);

        return {
            status: "OK",
            message: "All users retrieved successfully",
            data: allAccounts,
        };
    } catch (e) {
        return {
            status: "ERR",
            message: "Database query failed",
            error: e.message,
        };
    }
};

const getDetailsAccount = async (id) => {
    try {
        // Validate ObjectId
        if (!mongoose.isValidObjectId(id)) {
            return {
                status: "ERR",
                message: "Invalid user ID format",
            };
        }

        const objectId = new mongoose.Types.ObjectId(id);

        // Aggregate query to get user details with role
        const account = await Account.aggregate([
            {
                $match: { _id: objectId },
            },
            {
                $lookup: {
                    from: "permissions",
                    localField: "permissions",
                    foreignField: "_id",
                    as: "permissionDetails",
                },
            },
            {
                $project: {
                    _id: 1,
                    FullName: 1,
                    Email: 1,
                    Username: 1,
                    permissionDetails: 1,
                    IsDelete: 1,
                },
            },
        ]);

        if (!account.length) {
            return {
                status: "ERR",
                message: "User not found",
            };
        }

        return {
            status: "OK",
            message: "User successfully retrieved",
            data: account[0],
        };
    } catch (e) {
        return {
            status: "ERR",
            message: "Database query failed",
            error: e.message,
        };
    }
};

module.exports = {
    createAcount,
    getAllAccounts,
    getDetailsAccount,
    loginAccount,
    refreshTokenService,
    logout,
};
