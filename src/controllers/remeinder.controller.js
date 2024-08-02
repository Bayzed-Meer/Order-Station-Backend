const nodemailer = require("nodemailer");
const User = require("../models/user.model");
const CheckIn = require("../models/daily-checkIn");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = (to, subject, text) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: to,
    subject: subject,
    text: text,
  };

  return transporter.sendMail(mailOptions);
};

exports.sendReminderEmails = async () => {
  try {
    let today = new Date();
    today.setHours(today.getHours() + 6);
    today.setDate(today.getDate() + 1);
    today = today.toISOString().split("T")[0];
    today = new Date(today);

    const dayOfWeek = today.getDay();

    const users = await User.find({});

    for (const user of users) {
      const checkIn = await CheckIn.findOne({
        employeeID: user.id,
        date: today,
      });

      let shouldSendEmail = true;
      if (user.clientInfo === "regional" && dayOfWeek === 5) {
        shouldSendEmail = false;
      } else if (user.clientInfo === "outsource" && dayOfWeek === 0) {
        shouldSendEmail = false;
      } else if (user.clientInfo !== "support" && dayOfWeek === 6) {
        shouldSendEmail = false;
      }

      if (shouldSendEmail && !checkIn) {
        const emailSubject = "⏰ Urgent: Check-In Reminder";

        const emailBody = `
Hi ${user.username},

⏳ This is a reminder that you have only 2 hours left to complete your daily check-in for today.

Please make sure to submit your check-in before the deadline to avoid any issues. If you have any questions or need assistance, don't hesitate to reach out to us.

Thank you!

Best regards,  
The Order Station Team

📧 For support, contact us at support@example.com.
        `;

        await sendEmail(user.email, emailSubject, emailBody);
      }
    }
  } catch (error) {
    console.error("Error sending notifications:", error);
  }
};
