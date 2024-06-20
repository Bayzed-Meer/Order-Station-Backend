require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");

const authRoute = require("./routes/auth.route");
const adminRoute = require("./routes/admin.route");

const app = express();
const PORT = process.env.PORT || 3000;

//middlewares
const corsOptions = {
  credentials: true,
  origin: ["http://localhost:4200"],
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// routes
app.use("/auth", authRoute);
app.use("/admin", adminRoute);

// connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to Database"))
  .catch((err) => console.error("Error connecting to database:", err));

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
