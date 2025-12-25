const chalk = require("chalk");
const { server } = require("./src/app");
const { connectDatabase } = require("./src/database/db");
require("dotenv").config();

connectDatabase()
  .then(() => {
    server.listen(process.env.PORT || 5000, () => {
      console.log(
        chalk.green(`Server running at http://localhost:${process.env.PORT}`)
      );
    });
  })
  .catch((error) => {
    console.log(chalk.red("Database connection faield!!", error));
  });
