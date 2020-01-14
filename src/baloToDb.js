//parcourir un dossier et creer un tableau d'objet avec code rcs, nom, date, path

const path = require("path");
const fs = require("fs");
const textract = require("textract");
const sleep = require("system-sleep");
const Society = require("../db/societies");

// const browse = (dir, fileList) => {
//   //parcours le fichier passé ressort une liste de pdfs
//   files = fs.readdirSync(dir);
//   fileList = fileList || [];
//   files.forEach(file => {
//     if (fs.statSync(path.join(dir, file)).isDirectory()) {
//       fileList = browse(path.join(dir, file), fileList);
//     } else {
//       if (path.extname(file) == ".pdf") {
//         let filePath = path.join(dir, file);
//         fileList.push(filePath);
//       }
//     }
//   });
//   return fileList;
// };

const formatDate = date => {
  const corrDate = {
    janvier: 01,
    février: 02,
    fevrier: 02,
    mars: 03,
    avril: 04,
    mai: 05,
    juin: 06,
    juillet: 07,
    aout: 08,
    août: 08
  };
  const dateTab = date.split(" ");
  return dateTab[2] + "-" + corrDate[dateTab[1]] + "-" + dateTab[0];
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
const regexMatch = text => {
  return new Promise(function (resolve, reject) {
    const NAMErgx = RegExp(
      /.*(?:réunion |PARTS |parts |trimestrielles |trimestrielles SA |Groupe |TITRES D'EMPRUNT |nominatifs|«|Liquidations |étrangères |annuels |scissions |CONVOCATION |vote |absorbante : |diverses |société |françaises |_ |d'actions \/ d'obligations|absorbante\) |mmobilier \()(.+?)((?=\) Société )|(?= SOCIETE )|(?= \() |(?= Société )|(?= société )|(?= Siège )|(?= au capital )|(?= au Capital )|(?= S.A )|(?= S.A. )|(?= SE )|(?= Societe )|(?= PENSION )|(?= Entreprise )|(?= SA )|(?= Filiation )|(?= Etablissement)|(?= Affiliée)|(?= Banque coopérative)|(?= Banque Coopérative)|(?= affiliée)|(?= faisant)|(?=»)|(?= Capital)|(?= à capital)|(?= à Capital)|(?=®))/g
    );
    // const NAMErgx = RegExp(
    //   /.*(?:réunion |PARTS |parts |trimestrielles |trimestrielles SA |Groupe |nominatifs |Liquidations |étrangères |annuels |scissions |vote |absorbante : |diverses |société |françaises |d'actions \/ d'obligations|mmobilier \()(.+?)((?=\) Société )|(?= SOCIETE )|(?= \() |(?= Société )|(?= société )|(?= Siège )|(?= au Capital )|(?= au capital )|(?= S.A )|(?= S.A. )|(?= SE )|(?= Societe )|(?= PENSION )|(?= Entreprise )|(?= SA )|(?= Filiation )|(?= Etablissement)|(?= Affiliée))/g
    // );
    resolve(NAMErgx.exec(text));
  });
};

const extractFromBaloDirectory = function (directory) {
  try {
    const RCSrgx = RegExp(
      /(((?<=RCS .* )|(?<=R.C.S .* )|(?<=RCS. .* ))([ 0-9]{11}?))|([ 0-9 ]{11})((?= R.C.S. )|(?= RCS)|(?= - RCS)|(?= R.C.S ))/
    );
    // FOR LESS THAN 2019
    // const NAMErgx = RegExp(
    //   /(?<=Bulletin n° [0-9]{1,} )[A-Z 1-9 -ïÈÉ– ]{1,}((?= \()|(?= Société)|(?= société)|(?= Siège))/g
    // );

    // FOR BALOS 2019
    // const NAMErgx = RegExp(
    //   /(?!SA )((?<=réunion )|(?<=nominatifs )|(?<=Liquidations )|(?<=étrangères )|(?<=annuels )|(?<=trimestrielles )|(?<=SA )|(?<=scissions )|(?<=vote )|(?<=diverses )|(?<=françaises )|(?<=d'actions \/ d'obligations )|(?<=\())(.+?)((?=\) Société)|(?= SOCIETE)|(?= \()|(?= Société)|(?= société)|(?= Siège)|(?= au capital)|(?= S.A)|(?= SE)|(?= Societe)|(?= Réouverture)|(?= Entreprise)|(?= SA))/g
    // );
    const NAMErgx = RegExp(
      /.*(?:réunion |PARTS |parts |trimestrielles SA |trimestrielles  |Groupe |nominatifs |Liquidations |étrangères |annuels |scissions |vote |absorbante : |diverses |société |françaises |d'actions \/ d'obligations|mmobilier \()(.+?)((?=\) Société )|(?= SOCIETE )|(?= \() |(?= Société )|(?= société )|(?= Siège )|(?= au capital )|(?= S.A )|(?= S.A. )|(?= SE )|(?= Societe )|(?= Réouverture )|(?= Entreprise )|(?= SA )|(?= Filiation ))/g
    );
    const DATErgx = RegExp(/[0-9]{1,} [a-zéû]{3,} [0-9]{3,}/);
    files = fs.readdirSync(directory);
    console.log("directory : ", directory);
    console.log("Prepare to extract from " + files.length + " files...");
    sleep(500);
    let tab = [];


    files.forEach(file => {
      //creer un objet
      sleep(50);
      textract.fromFileWithPath(directory + "/" + file, (error, text) => {
        if (error) {
          console.log("Error during textract -> ", error);
        } else {
          const society = {
            rcs: "",
            name: "",
            corporateForm: "",
            board: "",
            date: ""
          };
          const out = {
            file: "",
            name: "",
            text: ""
          };
          slicedText = text.slice(0, 600);
          //recuperer rcs
          if ((match = slicedText.match(RCSrgx))) {
            society.rcs = match[0];
            try {
              twiceSlicedText = slicedText.slice(0, 300);
              regexMatch(twiceSlicedText).then(result => {
                if (result !== null && result[1].length > 1) {
                  society.name = result[1];
                  // console.log(twiceSlicedText);
                  // console.log('name : ', result[1]);

                  // out.file = file;
                  // out.name = result[1];
                  // out.text = twiceSlicedText;
                  // tab.push(out);
                  if (DATErgx.test(text)) {
                    const date = text.match(DATErgx);
                    const formatedDate = formatDate(date[0]);
                    society.date = formatedDate;
                  }
                  definingCorporateForm(society, text);
                  // console.log(society)
                  // console.log(twiceSlicedText)
                  console.log('--------------------------------------')
                  // INSERT DB
                  Society.existRcs(society).then(rcsExists => {
                    if (rcsExists !== false) {
                      // RCS existe : replace undefined
                      if (society.corporateForm !== 'undefined') Society.replaceIfUndefined(society, 'corporateForm')
                        .then(() => console.log('replaced corporateForm'))
                        .catch(e => console.log('error corporateForm', e))
                      if (society.board !== 'undefined') Society.replaceIfUndefined(society, 'board')
                        .then(() => console.log('replaced board'))
                        .catch(e => console.log('error replace board', e))
                      Society.existName(society.name).then(nameExists => {
                        if (nameExists === false) {
                          // Si RCS existe et name m'existe pas  : insert name
                          Society.insertName(society, rcsExists)
                            .then(() => console.log('new name insertion'))
                            .catch(e => console.log('error insert name', e))
                        }
                      })
                    } else if (rcsExists === false) {
                      // Si RCS n'existe pas : create
                      Society.create(society).then(() => {
                        console.log('Created')
                        // console.log(society)
                      }).catch(e => console.log('error create', e))
                    }
                  })
                } else {
                  console.log("no match name : ", twiceSlicedText);
                  console.log("file: ", twiceSlicedText);
                  console.log("no match name : ", twiceSlicedText);
                }
              });
            } catch (e) {
              console.log("my error file -> ", e);
            }
          } else {
            // out.file = file;
            // out.text = text.slice(0, 300);
            // console.log("no match rcs : ", file);
          }
        }
      });
    });



    console.log("THE END...");
    return tab;
  } catch (e) {
    console.log(e);
  }
};

(async function main() {
  argv = process.argv.slice(1);
  if (argv.length < 2) {
    console.log("Entrez un dossier");
  } else {
    // let fileList = [];
    const directory = path.join(__dirname, argv[1]);
    // fileList = browse(dir, fileList);
    let list = await extractFromBaloDirectory(directory);
    list.unshift(list.length);
    console.log(list);

    // CREER LISTE FORMAT JSON
    fs.writeFile(
      "./valids.json",
      JSON.stringify(list, null, 2),
      "utf-8",
      err => {
        if (err) console.log(err);
        console.log("Successfully Written to File.");
      }
    );
    return;
  }
})();