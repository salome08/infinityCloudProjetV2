// var regex = /(?:^|\s)format_(.*?)(?:\s|$)/;
var regex = /.*(?:réunion |parts |trimestrielles |nominatifs |Liquidations |étrangères |annuels |SA |scissions |vote |diverses |françaises|d'actions \/ d'obligations |\()(.+?)((?=\) Société )|(?= SOCIETE )|(?= \() |(?= Société )|(?= société )|(?= Siège )|(?= au capital )|(?= S.A )|(?= SE )|(?= Societe )|(?= Réouverture )|(?= Entreprise )|(?= SA ))/;
// var input = "something format_abc";
var input = "t situations trimestrielles parts BANQUE DE SAVOIE SA Société ";

// regex(input);        //=> [" format_abc", "abc"]
let match = regex.exec(input); //=> [" format_abc", "abc"]
console.log(match[1]);
// input.match(regex);  //=> [" format_abc", "abc"]
