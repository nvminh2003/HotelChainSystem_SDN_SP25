const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

const sendEmailCreateOrder = async (email, orderItems) => {
    try {
        // console.log("MAIL_ACCOUNT:", process.env.MAIL_ACCOUNT);
        // console.log("MAIL_PASSWORD:", process.env.MAIL_PASSWORD);
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: process.env.MAIL_ACCOUNT,
                pass: process.env.MAIL_PASSWORD,
            },
            // logger: true,
            // debug: true,
        });

        // Format thông tin đơn hàng thành HTML
        const orderDetails = orderItems
            .map((item, index) => {
                // Định dạng giá gốc
                const formattedPrice = new Intl.NumberFormat("vi-VN").format(
                    item.price
                );

                return `
                    <tr>
                        <td style="padding: 5px 10px; border: 1px solid #ddd;">${
                            index + 1
                        }</td>
                        <td style="padding: 5px 10px; border: 1px solid #ddd;">${
                            item.name
                        }</td>
                        <td style="padding: 5px 10px; border: 1px solid #ddd;">${
                            item.amount
                        }</td>
                        <td style="padding: 5px 10px; border: 1px solid #ddd;">${formattedPrice} VND</td>
                    </tr>
                `;
            })
            .join("");

        const totalPrice = orderItems.reduce((total, item) => {
            const amount = item.amount || 0;
            const price = item.price || 0;
            const discount = item.discount || 0;
            const shippingPrice = item.shippingPrice || 0;

            // Kiểm tra từng giá trị
            if (isNaN(amount) || isNaN(price) || isNaN(discount)) {
                console.error("Invalid data:", { amount, price, discount });
                return total; // Bỏ qua mục không hợp lệ
            }

            const subtotal = amount * price * (1 - discount / 100);
            // console.log("Subtotal:", subtotal);
            return total + subtotal + shippingPrice;
        }, 0);
        const formattedAmount = new Intl.NumberFormat("vi-VN").format(
            totalPrice
        );

        // console.log("Total Price:", formattedAmount);

        const emailHTML = `
            <h2>Đặt hàng thành công!</h2>
            <p>Xin chào,</p>
            <p>Cảm ơn bạn đã đặt hàng tại cửa hàng của chúng tôi. Đây là thông tin đơn hàng của bạn:</p>
            <table style="border-collapse: collapse; width: 100%; text-align: left;">
                <thead>
                    <tr style="background-color: #f2f2f2;">
                        <th style="padding: 5px 10px; border: 1px solid #ddd;">#</th>
                        <th style="padding: 5px 10px; border: 1px solid #ddd;">Tên sản phẩm</th>
                        <th style="padding: 5px 10px; border: 1px solid #ddd;">Số lượng</th>
                        <th style="padding: 5px 10px; border: 1px solid #ddd;">Giá gốc</th>
                    </tr>
                </thead>
                <tbody>
                    ${orderDetails}
                </tbody>
            </table>
            <p style="margin-top: 20px; color: red;"><strong>Tổng tiền:</strong> ${formattedAmount} VND</p>
            <p>Chúng tôi sẽ sớm liên hệ để xác nhận đơn hàng. Cảm ơn bạn đã mua sắm cùng chúng tôi!</p>
        `;

        const info = await transporter.sendMail({
            from: process.env.MAIL_ACCOUNT, // Địa chỉ email người gửi
            to: "minhnvhe173072@fpt.edu.vn", //quocviet081107@gmail.com kimhue12103008@gmail.com minhnvhe173072@fpt.edu.vn Địa chỉ email người nhận  anhdthhs176249@fpt.edu.vnnttuyet99@gmail.com
            subject: "Đặt hàng thành công", // Chủ đề
            html: emailHTML, // Nội dung email dạng HTML
        });

        console.log("Message sent: %s", info.messageId);
    } catch (error) {
        console.error("Error while sending email:", error);
    }
};

module.exports = { sendEmailCreateOrder };
