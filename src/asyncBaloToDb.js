const path = require("path");
const fs = require("fs");
const argv = process.argv
const textract = require("textract");
const sleep = require("system-sleep");
const Society = require("../db/societies");

const regexMatch = text => {
  return new Promise(function (resolve, reject) {
    const NAMErgx = RegExp(
      /.*(?:réunion |PARTS |parts |trimestrielles |trimestrielles SA |Groupe |TITRES D'EMPRUNT |nominatifs|«|Liquidations |étrangères |annuels |scissions |CONVOCATION |vote |absorbante : |diverses |DIVERS |société |françaises |_ |d'actions \/ d'obligations|absorbante\) |mmobilier \()(.+?)((?=\) Société )|(?= SOCIETE )|(?= \() |(?= Société )|(?= société )|(?= Siège )|(?= au capital )|(?= au Capital )|(?= S.A )|(?= S.A. )|(?= SE )|(?= Societe )|(?= PENSION )|(?= Entreprise )|(?= SA )|(?= Filiation )|(?= Etablissement)|(?= Affiliée)|(?= Banque coopérative)|(?= Banque Coopérative)|(?= affiliée)|(?= faisant)|(?=»)|(?= Capital)|(?= à capital)|(?= à Capital)|(?=®))/g
    );
    // const NAMErgx = RegExp(
    //   /.*(?:réunion |PARTS |parts |trimestrielles |trimestrielles SA |Groupe |nominatifs |Liquidations |étrangères |annuels |scissions |vote |absorbante : |diverses |société |françaises |d'actions \/ d'obligations|mmobilier \()(.+?)((?=\) Société )|(?= SOCIETE )|(?= \() |(?= Société )|(?= société )|(?= Siège )|(?= au Capital )|(?= au capital )|(?= S.A )|(?= S.A. )|(?= SE )|(?= Societe )|(?= PENSION )|(?= Entreprise )|(?= SA )|(?= Filiation )|(?= Etablissement)|(?= Affiliée))/g
    // );
    resolve(NAMErgx.exec(text));
  });
};

const definingName = async (society, text) => {
  try {
    const matchName = await regexMatch(text)
    if (matchName !== null && matchName[1].length > 1) {
      society.name = matchName[1]
      return true
    } else return false
  } catch (error) {
    console.error("definingName error -> ", error)
  }
}
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
    août: 08,
    septembre: 09,
    octobre: 10,
    novembre: 11,
    decembre: 12,
    décembre: 12

  };
  const dateTab = date.split(" ");
  return dateTab[2] + "-" + corrDate[dateTab[1]] + "-" + dateTab[0];
};

const definingDate = async (society, text) => {
  try {
    const DATErgx = RegExp(/[0-9]{1,} (?!euros)[a-zéû]{3,} [0-9]{3,}/);
    if (DATErgx.test(text)) {
      const date = text.match(DATErgx)
      society.date = formatDate(date[0]);
      return true
    } else return false
  } catch (error) {
    console.error("definingDate error -> ", error)
  }
}

const definingRcs = async (society, text) => {
  try {
    const RCSrgx = RegExp(
      /(((?<=RCS .* )|(?<=R.C.S .* )|(?<=RCS. .* ))([ 0-9]{11}?))|([ 0-9 ]{11})((?= R.C.S. )|(?= RCS)|(?= - RCS)|(?= R.C.S ))/
    );
    if (RCSrgx.test(text)) {
      const rcs = text.match(RCSrgx)
      society.rcs = rcs[0]
      return true
    } else return false
  } catch (error) {
    console.error("definingRcs error -> ", error)
  }
}

const definingBoard = async (society, text) => {
  try {
    if (text.search(/conseil d'administration/i) > 1) society.board = "CA";
    else if (text.search(/directoire et conseil/i) > 1) society.board = "DCS";
    else {
      society.board = "undefined";
    }
  } catch (error) {
    console.error("definingBoard error -> ", error);
  }
};


const definingCorporateForm = async (society, text) => {
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
    await definingBoard(society, text);
  } catch (error) {
    console.error("definingCorporateForm error -> ", error);
  }
};

const insertIntoDb = async (society) => {
  try {
    const rcsExists = await Society.existRcs(society);
    if (rcsExists !== false) {
      //RCS already in db
      if (society.corporateForm !== 'undefined') await Society.replaceIfUndefined(society, 'corporateForm')
      if (society.board !== 'undefined') await Society.replaceIfUndefined(society, 'board')
      const nameExists = await Society.existName(society.name)
      if (nameExists === false) {
        // RCS exist and Name don't exist : insert only name
        await Society.insertName(society, rcsExists)
      }
    } else if (rcsExists === false) {
      await Society.create(society)
    }
  } catch (error) {
    console.error("insertIntoDb error -> ", error);
  }
}

const readFile = async (file, directory, outList) => {
  try {
    sleep(30);
    const filePath = path.join(directory, file)
    textract.fromFileWithPath(filePath, async (error, text) => {
      if (error) console.error('textrac error : ', filePath)
      else {
        slicedText = text.slice(0, 600);
        const society = {
          rcs: "",
          name: "",
          corporateForm: "",
          board: "",
          date: ""
        };
        const isRcs = await definingRcs(society, slicedText)
        if (isRcs) {
          twiceSlicedText = slicedText.slice(0, 200);
          const isName = await definingName(society, twiceSlicedText)
          if (isName) {
            await definingDate(society, text)
            await definingCorporateForm(society, text);
            await insertIntoDb(society);
            outList.push({
              'File': file,
              'Name': society.name,
              'Text': twiceSlicedText,
            })
          }
        }
      }
    })
  } catch (error) {
    console.error('readFile error -> ', error)
  }
}

readDirectory = async () => {
  try {
    outList = []
    if (argv.length !== 3) console.log('Entrez un dossier de pdfs du balo')
    else {
      const directory = path.join(__dirname, argv[2]);
      files = fs.readdirSync(directory);
      for await (file of files) {
        await readFile(file, directory, outList)
      }
      // CREER LISTE FORMAT JSON
      fs.writeFile(
        "./out-asyncBalo.json",
        JSON.stringify(outList, null, 2),
        "utf-8",
        err => {
          if (err) console.log(err);
          console.log("Successfully Written to File.");
        }
      );
    }
    // Besoin de sortir un file avec name : file : text
  } catch (error) {
    console.error('readDirectory error -> ', error)
  }
}

readDirectory();