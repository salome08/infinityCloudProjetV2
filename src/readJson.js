const Society = require("../db/societies");
const sleep = require("system-sleep");

const fs = require("fs");
const path = require("path");
const argv = process.argv

const getDateofDocument = async (file) => {
  const regxDate = /[0-9]{6,8}/g
  if (regxDate.test(file)) {
    const matchDate = file.match(regxDate)
    const year = matchDate[0].slice(0, 4);
    const month = matchDate[0].slice(4, 6);
    const day = matchDate[0].slice(6, 8);
    const formatedDateTab = day ? [year, month, day] : [year, month, "01"]
    const date = formatedDateTab.join('-')
    return date;
  } else console.log('Nomatch for date in file title: ', file)
}

const insertMarketCap = async (marketCap, issuerId, dateOfDocument) => {
  console.log('insert market cap :::: ', issuerId)

  const marketCapExist = await Society.existMarketCap(issuerId, dateOfDocument)
  if (marketCapExist === false) await Society.insertMarketCap(parseInt(marketCap.replace('_', '')), issuerId, dateOfDocument)
}

const insertMarket = async (market, issuerId, dateOfDocument) => {
  console.log('insert market :::: ', issuerId)

  const marketExist = await Society.existMarket(issuerId, dateOfDocument)
  if (marketExist === false) await Society.insertMarket(market, issuerId, dateOfDocument)
}
const insertCompartment = async (compartment, issuerId, dateOfDocument) => {
  console.log('insert compartment cap :::: ', issuerId)

  const compartmentExist = await Society.existCompartment(issuerId, dateOfDocument)
  if (compartmentExist === false) await Society.insertCompartment(compartment, issuerId, dateOfDocument)
}

// const insertIsin = async (society, rcsId) => {
//   const isinExist = await Society.existIsin(society.ISIN)
//   if (isinExist === false) {
//     // insert isin
//     Society.insertIsin(society.ISIN, rcsId)
//       .then(() => console.log('Isin Inserted !'))
//     // insert data
//     Society.insertEuronext(society, rcsId).then(() => console.log('Data Euronext Inserted !'))
//   } else console.log('Code isin deja dans la base')
// }

// NOUVEAU SYSTEME : 
// inserer les infos si name n'existe pas deja 
// si isin existe deja et name n'existe pas, ajouter name avec le meme issuer id
// si name existe deja et isin n'existe pas, ajouter isin avec le meme issuer id

const pushSocietyToDb = async (society, dateOfDocument, notInserted) => {
  try {
    const nameExist = await Society.existName(society.StockName)
    console.log('-----> In try name Exist ->', nameExist)
    if (nameExist === false) {
      // Name n'existe pas
      console.log('-----> In name`exist === false ', society.StockName)

      const isinExist = await Society.existIsin(society.ISIN)
      if (isinExist === false) {
        // ISIN n'existe pas
        // Ajouter name et ajouter isin
        console.log('-----> In isinExist === false')
        const issuerId = await Society.insertIssuer(society, dateOfDocument)
        console.log('IssuerId : ', issuerId)
        await Society.insertName(society.StockName, issuerId, dateOfDocument)
        await Society.insertIsin(society.ISIN, issuerId, dateOfDocument);
        await insertMarketCap(society.MarketcapitalizationInMillionEuros, issuerId, dateOfDocument);
        await insertMarket(society.Market, issuerId, dateOfDocument);
        await insertCompartment(society.Compartment, issuerId, dateOfDocument)
      } else {

        // ISIN existe deja, inserer le name avec le bon issuer_id
        console.log('-----> In isinExist === true')
        console.log('ISIN already in database (New name): ', society.StockName)

        await Society.insertName(society.StockName, isinExist, dateOfDocument)
        await insertMarketCap(society.MarketcapitalizationInMillionEuros, isinExist, dateOfDocument);
        await insertMarket(society.Market, isinExist, dateOfDocument);
        await insertCompartment(society.Compartment, isinExist, dateOfDocument)
      }
    } else {
      // Name existe deja dans la base 
      // Ajouter ISIN s'il n'existe pas 
      const isinExist = await Society.existIsin(society.ISIN)
      if (isinExist === false) {
        console.log('-----> In isinExist === false')

        console.log('Name already in database (New ISIN): ', society.StockName)

        await Society.insertIsin(society.ISIN, nameExist, dateOfDocument);
      }
      console.log('-----> In nameExist === true', nameExist)

      await insertMarketCap(society.MarketcapitalizationInMillionEuros, nameExist, dateOfDocument);
      await insertMarket(society.Market, nameExist, dateOfDocument);
      await insertCompartment(society.Compartment, nameExist, dateOfDocument)

      // notInserted.push(society.StockName)
    }
  } catch (error) {
    console.log(error)
  }
}

const pushDelistingToDb = async (society) => {
  // rcsId, date, reason
  try {
    // console.log(society)
    const isinExist = await Society.existIsin(society.ISINcode)
    // console.log(isinExist)
    if (isinExist !== false) {
      //test if delisting exists 
      const delistingExist = await Society.existDelisting(isinExist, society.Date.split("/").reverse().join("-"))
      if (delistingExist === false)
        //insert data into rcs-delisting
        await Society.insertDelisting(isinExist, society.Date.split("/").reverse().join("-"), society.Reasonofdelisting)
      console.log(delistingExist)
      console.log('Le name existe pas dans la base : ', society.Name, ': ', isinExist)
    } else {
      console.log('Le name n\' existe pas dans la base : ', society.Name)
    }
  } catch (error) {
    console.error(error)
  }
}

const readFile = async (file, directory, notInserted) => {
  try {
    const fileName = file.split('.')
    if (fileName[1] === 'json') {
      const dateOfDocument = await getDateofDocument(file)
      const societies = require(path.join(directory, file))
      if (societies) {
        for await (society of societies) {
          console.log(society.Reference)
          if (society.Reference && society.Reference === 'Paris' || society.Listing === 'Paris')
            await pushDelistingToDb(society)
          // console.log('1')
          else
          if (society.StockName && society.MarketofReference === 'P' || society.CrossListingPlace1 === 'P') {
            await pushSocietyToDb(society, dateOfDocument, notInserted);
            // console.log('2')
          }
        }
      }
    }
  } catch (error) {
    console.log(error)
  }
}

const readDirectory = async () => {
  try {
    if (argv.length !== 3) console.log('Entrez le repertoir de Jsons a lire')
    else {
      let notInserted = []
      const directory = path.join(__dirname, argv[2]);
      files = fs.readdirSync(directory);
      for await (file of files) {
        await readFile(file, directory, notInserted)
      }
      // fs.writeFile(
      //   "./notInDb2019.json",
      //   JSON.stringify(notInserted, null, 2),
      //   "utf-8",
      //   err => {
      //     if (err) console.log(err);
      //     console.log("Successfully Written to File.");
      //   }
      // );
    }
  } catch (error) {
    console.log(error)
  }
}

readDirectory()