console.log("Hello World (from the index.js)");

// Remplir la colonne NOM De SOCIETES et RCS et BOARD (original: createBoard)

// -> Depuis les pdfs de 2015
// -> Parcours les dossiers et sous dossiers,
// -> Extrait le nom des societes qui ont un num RCS
// -> Definir mode de gouvernance

//parcourir un dossier et creer un tableau d'objet avec code rcs, nom, date, path

// Algo
const path = require("path");
const fs = require("fs");
const textract = require("textract");
const sleep = require("system-sleep");

// DATABASE
const Society = require("../db/societies");

const browse = (dir, fileList) => {
  //parcours le fichier passé ressort une liste de pdfs
  files = fs.readdirSync(dir);
  fileList = fileList || [];
  files.forEach(file => {
    if (fs.statSync(path.join(dir, file)).isDirectory()) {
      fileList = browse(path.join(dir, file), fileList);
    } else {
      if (path.extname(file) == ".pdf") {
        let filePath = path.join(dir, file);
        fileList.push(filePath);
      }
    }
  });
  return fileList;
};

function definingBoard(text) {
  return new Promise(async (resolve, reject) => {
    try {
      if (text.search(/Société anonyme/i) > 0) {
        if (text.search(/conseil d'administration/i) > 0) {
          //     move(file, `./MATCH/SA/CA/${path.basename(file)}`);
          //   } else if (text.search(/directoire et conseil/i) > 0) {
          //     move(file, `./MATCH/SA/DCS/${path.basename(file)}`);
          //   } else {
          //     move(file, `./MATCH/SA/aucun/${path.basename(file)}`);
        }
        return resolve("SA");
      } else if (text.search(/Société europ/i) > 0) {
        //   if (text.search(/conseil d'administration/i) > 0) {
        //     move(file, `./MATCH/SE/CA/${path.basename(file)}`);
        //   } else if (text.search(/directoire et conseil/i) > 0) {
        //     move(file, `./MATCH/SE/DCS/${path.basename(file)}`);
        //   } else {
        //     move(file, `./MATCH/SE/aucun/${path.basename(file)}`);
        //}
        return resolve("SE");
      } else if (text.search(/commandite/i) > 0) {
        //   move(file, `./MATCH/SCA/${path.basename(file)}`);
        return resolve("CA");
      } else {
        return reject("Board is unknown");
      }
    } catch (e) {
      return reject(e);
    }
  });
}

function InsertSocietyFromDir(fileList) {
  return new Promise(async (resolve, reject) => {
    try {
      const RCSrgx = /([ 0-9 ]{11})((?= R.C.S)|(?= RCS))/;
      //   const NAMErgx = /(?<=Bulletin n° [0-9] {1,})[ A-Z ]{1,}(?= Société)/;
      const NAMErgx = /(?<=Bulletin n° [1-9]{1,} {1,}).{1,}(?= Société)/;

      fileList.forEach(file => {
        //creer un objet
        sleep(50);
        textract.fromFileWithPath(file, (error, text) => {
          if (error) console.log(error);
          const society = {
            rcs: "",
            name: "",
            board: ""
          };
          let match = "";

          // Only if i find RCS
          if ((match = text.match(RCSrgx))) {
            try {
              // Get RCS
              society.rcs = match[0];

              // Get NAME
              match = "";
              if ((match = text.match(NAMErgx))) {
                console.log(match[0]);
                society.name = match[0];
                match = "";
                // Match avec un mode de gouvernance (board)
                // => Ecrire la fonction (/parse-balo-rcs/index.js)
                definingBoard(text)
                  .then(board => {
                    society.board = board;
                  })
                  .then(() => {
                    Society.create(society).then(() => {
                      // .then ...           // Isert society into DB
                      console.log("Success insertion into DB");
                    });
                  });
              } else {
                console.log("no match name : ", file);
              }
            } catch (e) {
              console.log("my error file -> ", file);
              // console.log("my error -> ", e);
            }
          } else {
            console.log("no match rcs : ", file);
          }
        });
      });
      return resolve();
    } catch (e) {
      return reject(e);
    }
  });
}

(function main() {
  argv = process.argv.slice(1);
  if (argv.length != 2) {
    console.log("Entrez un dossier");
  } else {
    let fileList = [];
    const dir = path.join(__dirname, argv[1]);
    fileList = browse(dir, fileList);
    let TabSocieties = InsertSocietyFromDir(fileList);
    console.log(TabSocieties);
  }
})();
