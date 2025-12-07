const mongoose = require("mongoose");
const chalk = require("chalk");
require("dotenv").config();

exports.connectDatabase = async () => {
  try {
    const dbinfo = await mongoose.connect(process.env.MONGODB_URL);
    console.log(
      chalk.yellow(`Database connection sucessfull ${dbinfo.connection.host}`)
    );
  } catch (error) {
    console.log(chalk.red("Database connection faield!!", error));
  }
};
