"use strict";
const Knex = require("knex");
require("dotenv").config();

const config = {
  host: process.env.SQL_HOST,
  database: process.env.SQL_DATABASE,
  user: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD
};

const knex = Knex({
  client: "pg",
  connection: config
});

knex.schema
  .createTable("rcs-marketCap", table => {
    table.increments();
    table
      .integer("rcs_id")
      .references("isuer.id")
      .unsigned()
      .onDelete("cascade");
    table.integer("marketCapInMillionEuros");
    table.date("date");
  })
  .then(() => {
    console.log(`Successfully created 'marketCap' table.`);
  })
  .catch(err => {
    console.error(`Failed to create 'marketCap' table:`, err);
  });