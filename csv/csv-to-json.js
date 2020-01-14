const csvToJson = require("convert-csv-to-json");
const fs = require("fs");
const path = require("path");
const argv = process.argv

if (argv.length !== 3) console.log('Entrez le repertoir de CSV a convertir')
else {
  const directory = path.join(__dirname, argv[2]);
  files = fs.readdirSync(directory);
  files.forEach(file => {
    console.log(path.join(directory, file))
    const fileName = file.split('.')
    console.log(fileName)
    if (fileName[1] === 'csv') {
      let fileInputName = path.join(directory, file);
      let fileOutputName = directory + '/../../json/Delistings/' + fileName[0] + '.json';
      csvToJson.generateJsonFileFromCsv(fileInputName, fileOutputName);
    } else console.log('Erreure un fichier n\' est pas au format CSV --> ', file)
  });
}