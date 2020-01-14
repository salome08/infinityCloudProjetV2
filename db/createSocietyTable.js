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
// const prompt = require("prompt");
require("dotenv").config();

// const knex = require("./connection");
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

const knex = Knex({
  client: "pg",
  connection: config
});
// console.log(process.env.PORT);

// Create the "society" table
knex.schema
  .createTable("issuer", table => {
    table.increments();
    table.timestamp("created_at");
    table.string("countryOfIncorporation");
    table.string("rcs").unique();
    table.boolean("eea");
    table.string("marketReference");
    table.string("crossListingPlace");
    table.boolean("cac40Index");
    table.boolean("cacNext20Index");
    table.boolean("cacLarge60Index");
    table.boolean("cacMid60Index");
    table.boolean("cacSmallIndex");
    table.boolean("sbf120Index");
    table.boolean("cacMidSmall190Index");
    table.boolean("cacAllTradableIndex");
    table.boolean("cacAllSharesIndex");
    table.boolean("nextBiotechIndex");
    // table.string("compartment");
    table.string("formerMarketInParis");
    table.integer("icbSubSector");
    table.string("icbSectorName");
    table.string("icbSubSectorName");
    table.string("corporateForm");
    table.string("board");
    table.boolean("delisted");
  })
  .then(() => {
    console.log(`Successfully created 'issuer' table.`);
  })
  .catch(err => {
    console.error(`Failed to create 'issuer' table:`, err);
    if (knex) {}
  });

knex.schema
  .createTable("names", table => {
    table.increments();
    table
      .integer("issuer_id")
      .references("issuer.id")
      .unsigned()
      .onDelete("cascade");
    table.date("date");
    table.string("name").unique();
    // table.boolean("actif");
  })
  .then(() => {
    console.log(`Successfully created 'names' table.`);
  })
  .catch(err => {
    console.error(`Failed to create 'names' table:`, err);
    if (knex) {}
  });

knex.schema
  .createTable("isin", table => {
    table.increments();
    table
      .integer("issuer_id")
      .references("issuer.id")
      .unsigned()
      .onDelete("cascade");
    table.date("date");
    table.string("isin");
    table.string("reason");
    // table.boolean("actif");
  })
  .then(() => {
    console.log(`Successfully created 'isin' table.`);
  })
  .catch(err => {
    console.error(`Failed to create 'isin' table:`, err);
    if (knex) {}
  });

knex.schema
  .createTable("compartment", table => {
    table.increments();
    table
      .integer("issuer_id")
      .references("issuer.id")
      .unsigned()
      .onDelete("cascade");
    table.string("compartment");
    table.date("date");
    // table.boolean("actif");
  })
  .then(() => {
    console.log(`Successfully created 'compartment' table.`);
  })
  .catch(err => {
    console.error(`Failed to create 'compartment' table:`, err);
    if (knex) {}
  });

knex.schema
  .createTable("registerOffice", table => {
    table.increments();
    table
      .integer("issuer_id")
      .references("issuer.id")
      .unsigned()
      .onDelete("cascade");
    table.date("date");
    table.string("address");
    // table.boolean("actif");
  })
  .then(() => {
    console.log(`Successfully created 'registerOffice' table.`);
  })
  .catch(err => {
    console.error(`Failed to create 'registerOffice' table:`, err);
    if (knex) {}
  });

knex.schema
  .createTable("market", table => {
    table.increments();
    table
      .integer("issuer_id")
      .references("issuer.id")
      .unsigned()
      .onDelete("cascade");
    table.string("market");
    table.date("date");
    // table.boolean("actif");
  })
  .then(() => {
    console.log(`Successfully created 'market' table.`);
  })
  .catch(err => {
    console.error(`Failed to create 'market' table:`, err);
    if (knex) {}
  });

knex.schema
  .createTable("ipo", table => {
    table.increments();
    table
      .integer("issuer_id")
      .references("issuer.id")
      .unsigned()
      .onDelete("cascade");
    table.date("dateIntro");
    table.string("listingOrigin");
    table.string("typeOfPlacement");
  })
  .then(() => {
    console.log(`Successfully created 'ipo' table.`);
  })
  .catch(err => {
    console.error(`Failed to create 'ipo' table:`, err);
    if (knex) {}
  });

knex.schema
  .createTable("marketCap", table => {
    table.increments();
    table
      .integer("issuer_id")
      .references("issuer.id")
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

knex.schema
  .createTable("delisting", table => {
    table.increments();
    table
      .integer("issuer_id")
      .references("issuer.id")
      .unsigned()
      .onDelete("cascade");
    table.date("dateOfDelisting");
    table.string("reasonOfDelisting");
    table.string("typeOfOffer");
    table.boolean("delistedEuronextParisOnly");
  })
  .then(() => {
    console.log(`Successfully created 'delisting' table.`);
  })
  .catch(err => {
    console.error(`Failed to create 'delisting' table:`, err);
    if (knex) {}
  });

knex.schema
  .createTable("transfer", table => {
    table.increments();
    table
      .integer("issuer_id")
      .references("issuer.id")
      .unsigned()
      .onDelete("cascade");
    table.date("date");
    table.string("from");
    table.string("to");
    table.string("fromCompartment");
    table.string("toCompartment");
    table.string("typeOfTransfer");
  })
  .then(() => {
    console.log(`Successfully created 'transfer' table.`);
  })
  .catch(err => {
    console.error(`Failed to create 'transfer' table:`, err);
    if (knex) {}
  });

knex.schema
  .createTable("squeezeOut", table => {
    table.increments();
    table
      .integer("issuer_id")
      .references("issuer.id")
      .unsigned()
      .onDelete("cascade");
    table.date("date");
    table.string("previousOffer");
    table.date("datePreviousOffer");
    table.integer("previous%majoritySchares");
    table.integer("previous%majorityVoltingRights");
    table.integer("previous%minoritySchares");
    table.integer("previous%minorityVoltingRights");
    table.integer("previous%diff");
    table.string("previousTreasorySchares");
    table.string("previousVmac");
    table.integer("previous%vmac");
    table.integer("after%majoritySchares");
    table.integer("after%majorityVoltingRights");
    table.integer("after%minoritySchares");
    table.integer("after%minorityVoltingRights");
    table.integer("after%diff");
    table.string("afterTreasorySchares");
    table.string("afterVmac");
    table.integer("after%vmac");
  })
  .then(() => {
    console.log(`Successfully created 'squeezeOut' table.`);
    return knex.destroy();
  })
  .catch(err => {
    console.error(`Failed to create 'squeezeOut' table:`, err);
    if (knex) {
      knex.destroy();
    }
  });