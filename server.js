"use strict";

require("dotenv").config();

// [START gae_flex_postgres_app]
const express = require("express");
const Knex = require("knex");
// const crypto = require('crypto');

const app = express();
app.enable("trust proxy");

const knex = connect();

function connect() {
  // [START gae_flex_postgres_connect]
  const config = {
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    database: process.env.SQL_DATABASE
  };

  if (
    process.env.INSTANCE_CONNECTION_NAME &&
    process.env.NODE_ENV === "production"
  ) {
    config.host = `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`;
  }

  // Connect to the database
  const knex = Knex({
    client: "pg",
    connection: config
  });
  // [END gae_flex_postgres_connect]

  return knex;
}

app.get("/", (req, res, next) => {
  res.json({ msg: "ok" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log("Press Ctrl+C to quit.");
});

module.exports = app;
