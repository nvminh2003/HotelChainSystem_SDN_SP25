const moment = require('moment');
const crypto = require("crypto");
const qs = require('qs');
require('dotenv').config();
const { createPaymentLinkAD } = require("../utils");

const createPaymentLink = async (req, res) => {
    try {
        const { amount, description, ipAddr, transactionId } = req.body;

        if (!amount || !ipAddr || !transactionId) {
            return res.status(400).json({
                status: "ERR",
                message: "Missing required parameters"
            });
        }

        const paymentUrl = createPaymentLinkAD(
            amount,
            description || `Payment for transaction ${transactionId}`,
            ipAddr,
            transactionId
        );

        return res.status(200).json({
            status: "OK",
            message: "Payment URL generated successfully",
            paymentUrl: paymentUrl
        });
    } catch (error) {
        console.error("Error creating payment link:", error);
        return res.status(500).json({
            status: "ERR",
            message: "Failed to create payment link",
            error: error.message
        });
    }
};

// Helper function to sort the parameters
function sortObject(obj) {
    let sorted = {};
    let str = [];
    let key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            str.push(encodeURIComponent(key));
        }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
}

module.exports = {
    createPaymentLink
};
