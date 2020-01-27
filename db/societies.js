const knex = require("./connection");

let self = module.exports = {
  existName: name => {
    return knex("names")
      .select()
      .whereRaw("LOWER(name) LIKE '%' || LOWER(?) || '%' ", name.trim())
      .then(rows => {
        return rows.length === 0 ? false : rows[0].issuer_id
      })
  },
  existRcs: society => {
    return knex("isuer")
      .select()
      .where("rcs", society.rcs)
      .then(rows => {
        return rows.length === 0 ? false : rows[0].id
      })
  },
  existMarketCap: (issuerId, date) => {
    return knex("marketCap")
      .select()
      .where('issuer_id', issuerId)
      .where('date', date)
      .then(rows => {
        return rows.length === 0 ? false : true
      })
  },
  existMarket: (issuerId, date) => {
    return knex("market")
      .select()
      .where('issuer_id', issuerId)
      .where('date', date)
      .then(rows => {
        return rows.length === 0 ? false : true
      })
  },
  existCompartment: (issuerId, date) => {
    return knex("compartment")
      .select()
      .where('issuer_id', issuerId)
      .where('date', date)
      .then(rows => {
        return rows.length === 0 ? false : true
      })
  },
  existDelisting: (rcsId, date) => {
    return knex("rcs-delisting")
      .select()
      .where('rcs_id', rcsId)
      .where('dateOfDelisting', date)
      .then(rows => {
        return rows.length === 0 ? false : true
      })
  },
  insertIssuer: (society, date) => {
    return knex("issuer")
      .insert({
        marketReference: society.MarketofReference.trim(),
        crossListingPlace: society.CrossListingPlace1.trim(),
        countryOfIncorporation: society.CountryofIncorporation.trim(),
        cac40Index: society.CAC40 === 1 ? true : false,
        icbSubSector: society.ICBSubSector.trim(),
        icbSectorName: society.ICBSectorName.trim(),
        icbSubSectorName: society.ICBSubSectorName.trim(),
      })
      .returning("id")
      .then(id => {
        console.log(id[0])
        return id[0]
      })
      // .then(() => console.log('Name ' + society.StockName + ' created !'))
      .catch(e => console.log(e));
  },
  insertRcs: (issuerId, rcs) => {
    return knex("issuer").insert({
      rcs: rcs,
    })
      .where('id', issuerId)
      .then(() => console.log('Rcs inserted !', rcs));
  },
  insertCorporateform: (issuerId, value) => {
    return knex("issuer").insert({
      corporateForm: value,
    })
      .where('id', issuerId)
      .then(() => console.log('corporateForm inserted !', value));
  },
  insertBoard: (issuerId, value) => {
    return knex("issuer").insert({
      board: value,
    })
      .where('id', issuerId)
      .then(() => console.log('board inserted !', value));
  },
  insertMarketCap: (value, issuerId, date) => {
    return knex("marketCap").insert({
      issuer_id: issuerId,
      marketCapInMillionEuros: value,
      date: date,
    })
      .then(() => console.log('Market cap inserted !'));
  },
  insertCompartment: (value, issuerId, date) => {
    return knex("compartment").insert({
      issuer_id: issuerId,
      compartment: value.trim(),
      date: date,
    })
      .then(() => console.log('Market cap inserted !'));
  },
  insertMarket: (value, issuerId, date) => {
    return knex("market").insert({
      issuer_id: issuerId,
      market: value.trim(),
      date: date,
    })
      .then(() => console.log('Market inserted !'));
  },
  insertName: (name, issuerId, date) => {
    return knex("names").insert({
      issuer_id: issuerId,
      date: date,
      name: name.trim()
    })
      .then(() => console.log('Name ' + name + ' inserted !'))
  },
  existIsin: (isin) => {
    return knex("isin")
      .select()
      .where("isin", isin.trim())
      .then(rows => {
        return rows.length === 0 ? false : rows[0].issuer_id
      })
      .catch(e => console.log(e))
  },
  insertIsin: (isin, issuerId, date) => {
    return knex('isin')
      .insert({
        issuer_id: issuerId,
        isin: isin.trim(),
        date: date
      })
      .then(() => console.log('Isin inserted !'))

  },
  insertDelisting: (issuerId, date, reason) => {
    console.log(date.split("/").reverse().join("-") + issuerId)
    return knex('delisting')
      .insert({
        issuer_id: issuerId,
        dateOfDelisting: date,
        reasonOfDelisting: reason,
      })
      .then(() => console.log('Reason of delisting inserted !'))
  },
  replaceIfUndefined: (society, column) => {
    return knex('isuer')
      .where('rcs', society.rcs)
      .where(column, "undefined")
      .update(column, society[column])
      .then((res) => {
        if (res !== 0) console.log("Updated field ", column)
      })
      .catch((e) => console.log(e))
  },
  insertEuronext: (society, rcsId) => {
    return knex('isuer')
      .where('id', rcsId)
      .update({
        countryOfIncorporation: society.CountryofIncorporation,
        marketReference: society.MarketofReference,
        crossListingPlace: society.CrossListingPlace1,
        cac40Index: society.CAC40 === 1 ? true : false,
        compartment: society.Compartment,
        icbSubSector: society.ICBSubSector,
        icbSectorName: society.ICBSectorName,
        icbSubSectorName: society.ICBSubSectorName,
      })
      .then((res) => {
        if (res !== 0) console.log('Euronext ' + society.StockName + ' inserted !')
      })
      .catch((e) => console.log(e))
  },
  create: society => {
    return knex("isuer")
      .insert({
        rcs: society.rcs,
        corporateForm: society.corporateForm,
        board: society.board
      })
      .returning("id")
      .then(id => {
        return knex("rcs-name").insert({
          rcs_id: id[0],
          date: society.date,
          name: society.name
        });
      })
      .then(() => console.log('Name ' + society.name + ' created !'))
      .catch(e => console.log(e));
  },
  getOneByTagName: societyName => {
    // console.log('in getByTagName');
    // return knex('tags').where('tag_name', tag).first();
    return knex("society")
      .select()
      .where("name", societyName);
  },
  getAll: () => {
    return knex("society").select("name", "rcs", "board");
  }
};

// knex("users").whereNotExists(function () {
//   this.select("*")
//     .from("accounts")
//     .whereRaw("users.account_id = accounts.id");
// });