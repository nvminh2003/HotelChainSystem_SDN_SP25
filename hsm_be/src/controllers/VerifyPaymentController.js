const Transaction = require("../models/TransactionModel");

const verifyPayment = async (req, res) => {
    try {
        const vnp_Params = req.query;
        if (toString(vnp_Params.vnp_Params) !== "01") {
            return res.json({
                status: "Err",
                message: "Customer cancel or system error in transaction",
            });
        }
        // Ensure correct transactionID extraction
        let transactionID = vnp_Params.transactionID;
        if (transactionID.includes("?")) {
            transactionID = transactionID.split("?")[0];
        }

        // Convert VNPay amount correctly
        const paidAmount = parseInt(vnp_Params.vnp_Amount) / 100 || 0;
        console.log("Corrected Transaction ID:", transactionID);
        console.log("Corrected Paid Amount:", paidAmount);

        if (!transactionID) {
            return res.status(400).json({ status: "ERR", message: "Transaction ID is missing" });
        }

        const transaction = await Transaction.findById(transactionID);
        if (!transaction) {
            return res.status(404).json({ status: "ERR", message: "Transaction not found" });
        }

        console.log("Before Update:", transaction);

        // Update payment details
        if (paidAmount >= transaction.FinalPrice) {
            transaction.Status = "Completed";
            transaction.Pay = "Paid";
            transaction.PaidAmount = paidAmount; // ✅ Ensure `PaidAmount` is updated
        } else if (paidAmount > 0) {
            transaction.Status = "Pending";
            transaction.Pay = "Partial";
            transaction.PaidAmount = paidAmount; // ✅ Ensure `PaidAmount` is updated
        } else {
            console.log("Payment might still be processing, keeping the previous status.");
        }

        await transaction.save();

        console.log("After Update:", transaction);

        return res.json({
            status: "OK",
            message: "Payment verified successfully",
            transaction,
        });
    } catch (error) {
        console.error("Error verifying payment:", error);
        return res.status(500).json({
            status: "ERR",
            message: "Internal Server Error",
            error: error.message,
        });
    }
};

module.exports = { verifyPayment };

