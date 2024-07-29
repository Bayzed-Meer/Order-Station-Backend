const Employee = require("../models/employee.model");
const Staff = require("../models/staff.model");
const User = require("../models/user.model");
const CheckIn = require("../models/daily-checkIn");
const BeverageOrder = require("../models/berverage-order.model");
const fs = require("fs");
const path = require("path");

exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find({}, { id: 1 });

    const employeeIds = employees.map((emp) => emp.id);

    const users = await User.find({ id: { $in: employeeIds } });

    return res.status(200).json(users);
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
    const staffs = await Staff.find({}, { id: 1 });

    const staffIds = staffs.map((emp) => emp.id);

    const users = await User.find({ id: { $in: staffIds } });

    return res.status(200).json(users);
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
    const pastWeek = [];

    for (let i = 0; i < 7; i++) {
      const day = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - i)
      );
      pastWeek.push(day);
    }

    const checkInsByDay = await Promise.all(
      pastWeek.map((day) =>
        CheckIn.find({
          date: day.getTime(),
        })
      )
    );

    const countMeals = (checkIns, mealType, location) => {
      return checkIns.filter(
        (checkIn) =>
          checkIn.meal === mealType && checkIn.workLocation === location
      ).length;
    };

    const mealSummaryData = pastWeek.map((day, index) => {
      const checkIns = checkInsByDay[index];
      return {
        date: day.toISOString().split("T")[0],
        mirpurDietCount: countMeals(checkIns, "diet", "mirpur"),
        mirpurRegularCount: countMeals(checkIns, "regular", "mirpur"),
        mohakhaliDietCount: countMeals(checkIns, "diet", "mohakhali"),
        mohakhaliRegularCount: countMeals(checkIns, "regular", "mohakhali"),
      };
    });

    res.status(200).json(mealSummaryData);
  } catch (error) {
    console.error("Error getting meal summary:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getBeverageSummary = async (req, res) => {
  try {
    const now = new Date();
    const pastWeek = [];

    for (let i = 0; i < 7; i++) {
      const day = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - i)
      );
      pastWeek.push(day);
    }

    const getStartAndEndOfDay = (day) => {
      const startOfDay = new Date(
        Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate())
      );
      const endOfDay = new Date(
        Date.UTC(
          day.getUTCFullYear(),
          day.getUTCMonth(),
          day.getUTCDate(),
          23,
          59,
          59,
          999
        )
      );
      return { startOfDay, endOfDay };
    };

    const ordersByDay = await Promise.all(
      pastWeek.map(({ startOfDay, endOfDay }) =>
        BeverageOrder.find({
          createdAt: { $gte: startOfDay, $lt: endOfDay },
        })
      )
    );

    const countOrdersByStatus = (orders, status) => {
      return orders.filter((order) => order.orderStatus === status).length;
    };

    const beverageSummaryData = pastWeek.map((day, index) => {
      const { startOfDay, endOfDay } = getStartAndEndOfDay(day);
      const orders = ordersByDay[index];
      return {
        date: day.toISOString().split("T")[0],
        completedOrders: countOrdersByStatus(orders, "completed"),
        cancelledOrders: countOrdersByStatus(orders, "cancelled"),
      };
    });

    res.status(200).json(beverageSummaryData);
  } catch (error) {
    console.error("Error getting beverage order summary:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
