const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const routes = require("./routes");
const bodyParser = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
dotenv.config();
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./configs/swagger');
const connectDB = require("../dbConnect/db");

const app = express();
const port = process.env.PORT || 9999;

const corsOptions = {
    origin: process.env.CLIENT_URL || "http://localhost:3000", // Cho phép frontend truy cập
    methods: ["GET", "POST", "PUT", "DELETE"], // Các phương thức được phép
    credentials: true, // Cho phép gửi cookie, authentication headers
    allowedHeaders: ["Content-Type", "Authorization", "token"]
};

// CORS phải được gọi trước tất cả middleware khác
app.use(cors(corsOptions));

// Sau đó, tiếp tục với các middleware khác
app.use(express.json({ limit: "2000mb" }));
app.use(express.urlencoded({ limit: "2000mb", extended: true }));
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(cookieParser());


routes(app);

const http = require("http");
const server = http.createServer(app);

const { Server } = require("socket.io");
const Notification = require("./models/Notification");

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.set("io", io);

let chatMessages = []; // Lưu tin nhắn trong RAM
const janitors = new Set(); // Danh sách nhân viên dọn dẹp

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Tham gia vào room theo vai trò
    socket.on("join_role", (role) => {
        socket.join(role);
        console.log(`${socket.id} joined room: ${role}`);
    });

    // Khi nhân viên dọn dẹp tham gia
    socket.on("register", (role) => {
        if (role === "janitor") {
            janitors.add(socket.id);
        }
    });

    // Gửi thông báo đến Admin khi có booking mới
    socket.on("new_booking", async (data) => {
        try {
            const notification = new Notification({
                sender: data.sender || "Hệ thống",
                receiverRole: "Admin",
                message: data.message,
                type: "booking",
            });

            await notification.save();
            io.to("Admin").emit("receive_notification", notification);
        } catch (error) {
            console.error("Lỗi khi lưu thông báo:", error);
        }
    });

    // Gửi tin nhắn cũ khi user kết nối
    socket.on("get_messages", () => {
        socket.emit("load_messages", chatMessages);
    });

    // Nhận tin nhắn từ client
    socket.on("send_message", (data) => {
        console.log("Tin nhắn từ client:", data);
        chatMessages.push(data);

        // Phát tin nhắn đến tất cả client ngay lập tức
        io.emit("receive_message", data);
    });


    // Khi nhân viên dọn dẹp rời khỏi
    socket.on("disconnect", () => {
        janitors.delete(socket.id);
        console.log("User disconnected", socket.id);
    });
});


// CORS Configuration
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000", // Your frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
    allowedHeaders: ['Content-Type', 'Authorization', 'token'],
}));
// Add swagger documentation route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    swaggerOptions: {
        persistAuthorization: true,
    },
}));

// Chạy server
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    connectDB();
});