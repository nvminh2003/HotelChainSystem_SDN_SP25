const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const generateAccessToken = async (payload) => {
    const access_token = jwt.sign(
        { id: payload.id },
        process.env.ACCESS_TOKEN,
        { expiresIn: "1h" }
    );
    return access_token;
};

const generateFefreshToken = async (payload) => {
    const refresh_token = jwt.sign(
        { id: payload.id },
        process.env.REFRESH_TOKEN,
        { expiresIn: "365d" }
    );
    return refresh_token;
};

const refreshTokenJwtService = async (token) => {
    return new Promise((resolve, reject) => {
        try {
            if (!token) {
                return resolve({
                    status: "ERR",
                    message: "No token provided",
                });
            }

            jwt.verify(token, process.env.REFRESH_TOKEN, async (err, user) => {
                if (err) {
                    console.error("Token verification error:", err);
                    return resolve({
                        status: "ERR",
                        message: "Authentication failed. Invalid token.",
                    });
                }

                if (!user?.id) {
                    return resolve({
                        status: "ERR",
                        message: "Invalid token payload",
                    });
                }

                try {
                    const access_token = await generateAccessToken({
                        id: user.id,
                        isAdmin: user.isAdmin || false,
                    });

                    return resolve({
                        status: "OK",
                        message: "Token refreshed successfully",
                        access_token,
                    });
                } catch (tokenError) {
                    console.error("Error generating new access token:", tokenError);
                    return resolve({
                        status: "ERR",
                        message: "Failed to generate new access token",
                    });
                }
            });
        } catch (e) {
            console.error("Unexpected error in refreshTokenJwtService:", e);
            return reject(e);
        }
    });
};

//export const genneral
module.exports = {
    generateAccessToken,
    generateFefreshToken,
    refreshTokenJwtService,
};
