const AccountService = require("../services/AccountService");
const { refreshTokenJwtService, generateAccessToken, generateFefreshToken } = require("../services/JwtService");
const jwt = require("jsonwebtoken");
const Account = require("../models/AccountModel");
const createAcount = async (req, res) => {
    try {
        // console.log(req.body);
        const { FullName, Email, Username, Password, permissions } = req.body;
        const mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        const isCheckEmail = mailformat.test(Email);
        if (!Email || !Password || !Username || !permissions) {
            return res
                .status(200)
                .json({ status: "ERR", message: "The input is required." });
        } else if (!isCheckEmail) {
            return res
                .status(200)
                .json({ status: "ERR", message: "The input is email." });
        }

        console.log("isCheckEmail", isCheckEmail);
        const account = await AccountService.createAcount(req.body);
        return res.status(200).json(account);
    } catch (e) {
        return res.status(404).json({
            message: "User creation failed",
            error: e.message,
        });
    }
};


const loginAccount = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Email format validation
        const mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (!email || !password) {
            return res.status(400).json({
                status: "ERR",
                message: "Email and password are required.",
            });
        }
        if (!mailformat.test(email)) {
            return res.status(400).json({
                status: "ERR",
                message: "Invalid email format.",
            });
        }

        // Authenticate account
        const result = await AccountService.loginAccount(req.body);
        if (result.status === "ERR") {
            return res.status(401).json(result);
        }

        // Set refresh token as HTTP-only cookie
        res.cookie("refresh_token", result.refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            maxAge: 365 * 24 * 60 * 60 * 1000 // 1 year
        });

        // Only send access token and user data in response
        return res.status(200).json({
            status: "OK",
            message: "Login successful",
            access_token: result.access_token,
            data: result.data
        });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({
            status: "ERR",
            message: "Login failed",
        });
    }
};

const updateAccount = async (req, res) => {
    try {
        const accountId = req.params.id;
        const data = req.body;

        if (!accountId) {
            return res.status(400).json({
                status: "ERR",
                message: "The accountId is required",
            });
        }

        console.log("accountId:", accountId);

        const updatedAccount = await AccountService.updateAccount(accountId, data);

        if (!updatedAccount) {
            return res.status(404).json({
                status: "ERR",
                message: "Account not found or update failed",
            });
        }

        return res.status(200).json({
            status: "OK",
            message: "Account updated successfully",
            data: updatedAccount,
        });
    } catch (error) {
        console.error("Error updating account:", error);
        return res.status(500).json({
            status: "ERR",
            message: "An error occurred while updating the account",
            error: error.message,
        });
    }
};



const getAllAccounts = async (req, res) => {
    try {
        const accounts = await AccountService.getAllAccounts();
        return res.status(200).json(accounts);
    } catch (e) {
        return res.status(404).json({
            error: e.message,
        });
    }
};


const getDetailsAccount = async (req, res) => {
    try {
        const accountId = req.params.id;

        if (!accountId) {
            return res.status(400).json({
                status: "ERR",
                message: "The userId is required",
            });
        }

        const accountResponse = await AccountService.getDetailsAccount(accountId);

        // Nếu không tìm thấy user
        if (accountResponse.status === "ERR") {
            return res.status(404).json(accountResponse);
        }

        // Trả về kết quả thành công
        return res.status(200).json(accountResponse);
    } catch (e) {
        return res.status(500).json({
            status: "ERR",
            message: "Server error occurred",
            error: e.message,
        });
    }
};

const refreshToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refresh_token;
        //    console.log("Received refresh token:", refreshToken);

        if (!refreshToken) {
            console.log("No refresh token in cookies");
            return res.status(401).json({
                status: "ERR",
                message: "No refresh token provided"
            });
        }

        let decoded;
        try {
            decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN);
            //     console.log("Decoded token:", decoded);
        } catch (error) {
            if (error.name === "TokenExpiredError") {
                console.log("Refresh token expired");
                return res.status(403).json({
                    status: "ERR",
                    message: "Refresh token expired"
                });
            }
            console.log("Invalid refresh token:", error);
            return res.status(403).json({
                status: "ERR",
                message: "Invalid refresh token"
            });
        }

        const user = await Account.findById(decoded.id)
            .populate('permissions')
            .select('-Password');

        if (!user || user.refreshToken !== refreshToken) {
            console.log("Token mismatch or user not found");
            return res.status(403).json({
                status: "ERR",
                message: "Invalid refresh token"
            });
        }

        const access_token = await generateAccessToken({ id: user.id });
        // const new_refresh_token = await generateFefreshToken({ id: user.id });

        // Immediately invalidate the old refresh token (added improvement)
        // user.refreshToken = new_refresh_token;
        // await user.save();

        res.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: 365 * 24 * 60 * 60 * 1000 // 1 year
        });

        return res.status(200).json({
            status: "OK",
            message: "Token refreshed successfully",
            access_token,
            data: {
                _id: user._id,
                Email: user.Email,
                FullName: user.FullName,
                Username: user.Username,
                permissionDetails: user.permissions,
                IsDelete: user.IsDelete
            }
        });
    } catch (error) {
        console.error("Unexpected error during token refresh:", error);
        return res.status(500).json({
            status: "ERR",
            message: "An unexpected error occurred"
        });
    }
};

const logout = async (req, res) => {
    try {
        // Get user ID from authenticated request
        const userId = req.account.id;
        // Clear refresh token in database
        const result = await AccountService.logout(userId);

        // Clear refresh token cookie
        res.clearCookie('refresh_token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            sameSite: 'strict'
        });

        return res.status(200).json(result);
    } catch (error) {
        console.error("Logout error:", error);
        return res.status(500).json({
            status: "ERR",
            message: "Failed to logout"
        });
    }
};

module.exports = { createAcount, getAllAccounts, getDetailsAccount, loginAccount, refreshToken, logout }