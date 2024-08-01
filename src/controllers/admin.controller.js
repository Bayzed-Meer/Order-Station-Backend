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
    const { startDate, endDate } = req.query;
    let start, end;

    if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);

      start.setHours(start.getHours() + 6);
      end.setHours(end.getHours() + 6);

      if (start > end) {
        return res
          .status(400)
          .json({ message: "Start date must be before end date" });
      }
    }

    const requestedDays = [];
    for (
      let day = new Date(start);
      day <= end;
      day.setDate(day.getDate() + 1)
    ) {
      requestedDays.push(new Date(day));
    }

    requestedDays.reverse();

    const checkInsByDay = await Promise.all(
      requestedDays.map((day) =>
        CheckIn.find({
          date: {
            $gte: new Date(day.setHours(0, 0, 0, 0)),
            $lt: new Date(day.setHours(23, 59, 59, 999)),
          },
        })
      )
    );

    const countMeals = (checkIns, mealType, location) => {
      return checkIns.filter(
        (checkIn) =>
          checkIn.meal === mealType && checkIn.workLocation === location
      ).length;
    };

    const mealSummaryData = requestedDays.map((day, index) => {
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
    const { startDate, endDate } = req.query;
    let start, end;

    if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);

      start.setHours(start.getHours() + 6);
      end.setHours(end.getHours() + 6);

      if (start > end) {
        return res
          .status(400)
          .json({ message: "Start date must be before end date" });
      }
    }

    const requestedDays = [];
    for (
      let day = new Date(start);
      day <= end;
      day.setDate(day.getDate() + 1)
    ) {
      requestedDays.push(new Date(day));
    }

    requestedDays.reverse();

    const ordersByDay = await Promise.all(
      requestedDays.map(async (day) => {
        const orders = await BeverageOrder.find({
          createdAt: {
            $gte: new Date(day.setHours(0, 0, 0, 0)),
            $lt: new Date(day.setHours(23, 59, 59, 999)),
          },
        });
        return orders;
      })
    );

    const countOrdersByStatus = (orders, status) => {
      return orders.filter((order) => order.orderStatus === status).length;
    };

    const beverageSummaryData = requestedDays.map((day, index) => {
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
