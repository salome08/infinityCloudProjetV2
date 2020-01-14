const Society = require("../db/societies");

const fs = require("fs");
const path = require("path");
const argv = process.argv

if (argv.length !== 3) console.log('Entrez le repertoir de Jsons a lire')
else {
  const directory = path.join(__dirname, argv[2]);
  files = fs.readdirSync(directory);
  files.forEach(file => {
    const fileName = file.split('.')
    if (fileName[1] === 'json') {
      const societies = require(path.join(directory, file))
      if (societies) {
        for (society of societies) {
          // if (society.MarketofReference === 'P' || society.CrossListingPlace1 === 'P') {
          // INSERT INTO DATABASE
          console.log(society)
          //Check if name existe in db 
          // Society.existName(society.StockName)
          //     .then((nameExist) => {
          //         if (nameExist === false) {
          //             console.log('Name :' + society.StockName + ' not into db !')
          //         } else {
          //             console.log('New data from amf inserted to ', society.StockName)
          //             console.log('id of rcs : ', nameExist)
          //         }
          //     })
          //     .catch(e => console.log(e))
          // }
        }
      }
    } else console.log('Erreure un fichier n\' est pas au format JSON --> ', file)
  });
}