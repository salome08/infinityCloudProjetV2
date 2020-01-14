//parcourir un dossier et sortie rcs et name puis remplir db

const path = require("path");
const fs = require("fs");
const textract = require("textract");
const sleep = require("system-sleep");
const Society = require("./db/societies");

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

const definingBoard = (society, text) => {
  try {
    if (text.search(/conseil d'administration/i) > 1) society.board = "CA";
    else if (text.search(/directoire et conseil/i) > 1) society.board = "DCS";
    else {
      society.board = "undefined";
    }
  } catch (e) {
    console.log("definingBoard error -> ", e);
  }
};

const definingCorporateForm = (society, text) => {
  try {
    if (text.search(/Société anonyme/i) > 0) {
      society.corporateForm = "SA";
    } else if (text.search(/Société europ/i) > 0) {
      society.corporateForm = "SE";
    } else if (text.search(/commandite/i) > 0) {
      society.corporateForm = "SCA";
    } else {
      society.corporateForm = "undefined";
    }
    definingBoard(society, text);
  } catch (e) {
    console.log("definingCorporateForm error -> ", e);
  }
};

const generateTabSocieties = function(fileList) {
  try {
    const RCSrgx = RegExp(/([ 0-9 ]{11})((?= R.C.S)|(?= RCS))/);
    const NAMErgx = RegExp(
      /(?<=Bulletin n° [0-9]{1,} )[A-Z 1-9 -ïÈÉ– ]{1,}((?= \()|(?= Société)|(?= société)|(?= Siège))/g
    );

    fileList.forEach(file => {
      // console.log(file);
      //creer un objet
      sleep(50);
      textract.fromFileWithPath(file, (error, text) => {
        if (error) {
          console.log(error);
        } else {
          const society = {
            rcs: "",
            name: "",
            corporateForm: "",
            board: ""
          };
          let match = "";
          //recuperer rcs
          if ((match = text.match(RCSrgx))) {
            try {
              society.rcs = match[0];

              //recuperer name
              if (NAMErgx.test(text)) {
                let match = text.match(NAMErgx);
                society.name = match[0];

                definingCorporateForm(society, text);

                // Society.create(society).then(() => {
                //   console.log("Success insertion into DB");
                // });
              } else {
                console.log("not name found : ", file);
                console.log("not name found TEXT : ", text);
              }

              console.log("Success : ", society);
            } catch (e) {
              console.log("my error file -> ", e);
            }
          } else {
            // console.log("no match rcs : ", file);
          }
        }
      });
    });
    //   return tab;
  } catch (e) {
    console.log(e);
  }
};

(function main() {
  argv = process.argv.slice(1);
  if (argv.length < 2) {
    console.log("Entrez un dossier");
  } else {
    let fileList = [];
    const dir = path.join(__dirname, argv[1]);
    fileList = browse(dir, fileList);
    let TabSocieties = generateTabSocieties(fileList);
    // fs.writeFileSync("./result2009", TabSocieties);
    fs.writeFile(
      "./resultPdf.json",
      JSON.stringify(TabSocieties, null, 2),
      "utf-8",
      err => {
        if (err) console.log(err);
        console.log("Successfully Written to File.");
      }
    );
  }
})();
