const Employee = require("../models/employee.model");
const Staff = require("../models/staff.model");
const User = require("../models/user.model");
const CheckIn = require("../models/daily-checkIn");
const BeverageOrder = require("../models/berverage-order.model");
const fs = require("fs");
const path = require("path");

exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find({}).select("-password");
    return res.status(200).json(employees);
  } catch (error) {
    console.error("Error fetching employees:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    await Employee.findOneAndDelete({ id });

    const deletedEmployee = await User.findOneAndDelete({ id });

    if (!deletedEmployee)
      return res.status(404).json({ message: "Employee not found" });

    const filePath = path.join(
      __dirname,
      "..",
      "..",
      "uploads",
      deletedEmployee.profilePicture
    );

    if (deletedEmployee.profilePicture !== "default-photo.png") {
      if (deletedEmployee.profilePicture && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res.json({ message: "Employee deleted successfully" });
  } catch (error) {
    console.error("Error deleting employee:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getAllStaffs = async (req, res) => {
  try {
    const staffs = await Staff.find({}).select("-password");
    return res.status(200).json(staffs);
  } catch (error) {
    console.error("Error fetching staffs:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.deleteStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedStaff = await Staff.findOneAndDelete({ id });

    if (!deletedStaff)
      return res.status(404).json({ message: "Staff not found" });

    res.json({ message: "Staff deleted successfully" });
  } catch (error) {
    console.error("Error deleting staff:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.mealSummary = async (req, res) => {
  try {
    const now = new Date();

    const today = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
    );

    const yesterday = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1)
    );

    const countMeals = (checkIns, mealType, location) => {
      return checkIns.filter(
        (checkIn) =>
          checkIn.meal === mealType && checkIn.workLocation === location
      ).length;
    };

    const todayCheckIns = await CheckIn.find({
      date: today.getTime(),
    });

    const yesterdayCheckIns = await CheckIn.find({
      date: yesterday.getTime(),
    });

    const todayMirpurDietCount = countMeals(todayCheckIns, "diet", "mirpur");
    const yesterdayMirpurDietCount = countMeals(
      yesterdayCheckIns,
      "diet",
      "mirpur"
    );
    const todayMirpurRegularCount = countMeals(
      todayCheckIns,
      "regular",
      "mirpur"
    );
    const yesterdayMirpurRegularCount = countMeals(
      yesterdayCheckIns,
      "regular",
      "mirpur"
    );

    const todayMohakhaliDietCount = countMeals(
      todayCheckIns,
      "diet",
      "mohakhali"
    );
    const yesterdayMohakhaliDietCount = countMeals(
      yesterdayCheckIns,
      "diet",
      "mohakhali"
    );
    const todayMohakhaliRegularCount = countMeals(
      todayCheckIns,
      "regular",
      "mohakhali"
    );
    const yesterdayMohakhaliRegularCount = countMeals(
      yesterdayCheckIns,
      "regular",
      "mohakhali"
    );

    const mealSummaryData = {
      todayMirpurDietCount,
      yesterdayMirpurDietCount,
      todayMirpurRegularCount,
      yesterdayMirpurRegularCount,
      todayMohakhaliDietCount,
      yesterdayMohakhaliDietCount,
      todayMohakhaliRegularCount,
      yesterdayMohakhaliRegularCount,
    };

    res.status(200).json(mealSummaryData);
  } catch (error) {
    console.error("Error getting meal summary:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getBeverageSummary = async (req, res) => {
  try {
    const now = new Date();

    const startOfToday = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
    );
    const endOfToday = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        23,
        59,
        59,
        999
      )
    );

    const yesterday = new Date();
    yesterday.setUTCDate(now.getUTCDate() - 1);
    const startOfYesterday = new Date(
      Date.UTC(
        yesterday.getUTCFullYear(),
        yesterday.getUTCMonth(),
        yesterday.getUTCDate()
      )
    );
    const endOfYesterday = new Date(
      Date.UTC(
        yesterday.getUTCFullYear(),
        yesterday.getUTCMonth(),
        yesterday.getUTCDate(),
        23,
        59,
        59,
        999
      )
    );

    const todayOrders = await BeverageOrder.find({
      createdAt: { $gte: startOfToday, $lt: endOfToday },
    });

    const yesterdayOrders = await BeverageOrder.find({
      createdAt: { $gte: startOfYesterday, $lt: endOfYesterday },
    });

    const countOrdersByStatus = (orders, status) => {
      return orders.filter((order) => order.orderStatus === status).length;
    };

    const beverageOrderSummary = {
      todayCompletedOrders: countOrdersByStatus(todayOrders, "completed"),
      todayInProgressOrders: countOrdersByStatus(todayOrders, "in progress"),
      todayAppliedOrders: countOrdersByStatus(todayOrders, "applied"),
      todayCancelledOrders: countOrdersByStatus(todayOrders, "cancelled"),
      yesterdayCompletedOrders: countOrdersByStatus(
        yesterdayOrders,
        "completed"
      ),
      yesterdayCancelledOrders: countOrdersByStatus(
        yesterdayOrders,
        "cancelled"
      ),
    };

    res.status(200).json(beverageOrderSummary);
  } catch (error) {
    console.error("Error getting beverage order summary:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
