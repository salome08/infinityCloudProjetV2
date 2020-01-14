require("dotenv").config();

const config = {
  host: process.env.SQL_HOST,
  database: process.env.SQL_DATABASE,
  user: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD
};
// const config = {
//   host: process.env.SQL_HOST,
//   database: process.env.SQL_DATABASE,
//   user: process.env.SQL_USER,
//   password: process.env.SQL_PASSWORD
// };
module.exports = {
  development: {
    client: "pg",
    connection: config
  },
  production: {
    client: "pg",
    connection: process.env.DATABASE_URL + "?ssl=true"
  }
};
