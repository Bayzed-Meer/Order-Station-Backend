require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const http = require("http");
const cron = require("node-cron");
const { Server } = require("socket.io");
const { sendReminderEmails } = require("./controllers/remeinder.controller");

const authRoute = require("./routes/auth.route");
const adminRoute = require("./routes/admin.route");
const userRoute = require("./routes/user.route");
const orderRoute = require("./routes/order.route");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:4200",
      "https://order-station.netlify.app",
      "https://bayzed-meer.github.io",
    ],
    credentials: true,
  },
});
global.io = io;
const PORT = process.env.PORT || 3000;

//middlewares
const corsOptions = {
  credentials: true,
  origin: [
    "http://localhost:4200",
    "https://order-station.netlify.app",
    "https://bayzed-meer.github.io",
  ],
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));

// routes
app.use("/auth", authRoute);
app.use("/admin", adminRoute);
app.use("/user", userRoute);
app.use("/orders", orderRoute);

// cron job for sending emails for missing check-ins
cron.schedule(
  "0 22 * * *",
  async () => {
    await sendReminderEmails();
  },
  {
    scheduled: true,
    timezone: "Asia/Dhaka",
  }
);

// connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to Database"))
  .catch((err) => console.error("Error connecting to database:", err));

server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
