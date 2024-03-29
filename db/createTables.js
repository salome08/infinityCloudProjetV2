/**
 * Copyright 2017, Google, Inc.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

"use strict";

// [START gae_flex_postgres_create_tables]
const Knex = require("knex");
const prompt = require("prompt");
require("dotenv").config();

// const FIELDS = ["user", "password", "database"];

// prompt.start();

// Prompt the user for connection details
// prompt.get(FIELDS, (err, config) => {
//   if (err) {
//     console.error(err);
//     return;
//   }

// Connect to the database
const config = {
  host: process.env.SQL_HOST,
  database: process.env.SQL_DATABASE,
  user: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD
};

const knex = Knex({ client: "pg", connection: config });

// Create the "visits" table
knex.schema
  .createTable("visits", table => {
    table.increments();
    table.timestamp("timestamp");
    table.string("userIp");
  })
  .then(() => {
    console.log(`Successfully created 'visits' table.`);
    return knex.destroy();
  })
  .catch(err => {
    console.error(`Failed to create 'visits' table:`, err);
    if (knex) {
      knex.destroy();
    }
  });
// });
// [END gae_flex_postgres_create_tables]
