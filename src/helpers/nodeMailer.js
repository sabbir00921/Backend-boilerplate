const nodemailer = require("nodemailer");
const { CustomError } = require("./customError");
require("dotenv").config();

// Create a test account or replace with real credentials.

const transporter = nodemailer.createTransport({
  service: "gmail",
  secure: process.env.NODE_ENV == "development" ? false : true,
  auth: {
    user: process.env.HOST_MAIL,
    pass: process.env.APP_PASSWORD,
  },
});

exports.mailer = async (subject, template, email) => {
  try {
    const info = await transporter.sendMail({
      from: `"VIRUS COMPUTER" <${process.env.HOST_MAIL}>`,
      to: email,
      subject,
      html: template,
    });
    return info;
  } catch (error) {
    console.error("Mailer Error:", error.message);
    throw new CustomError(500, "Mail sent failed");
  }
};
