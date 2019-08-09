 const answers = [
  "ahab=afan=place",
  "pele=pyle=lemur",
  "planetoftheapes",
  "speeded=sox=mdt",
  "===tirol=cur===",
  "bfa=syracuseny=",
  "lummox=eos=hoed",
  "orion=amy=pasta",
  "bono=vim=kibitz",
  "=rodserling=rae",
  "===yer=emile===",
  "sow=ads=ageless",
  "thetwilightzone",
  "india=abet=alan",
  "roomy=boss=rapt"
];

const board = "ahab=afan=placepelplae=pnetyleoft=leheamurpesspe===edetird=sol=ox=curmdt===bfalum=symoxrac=eouses=hny=oedoribonon=o=vamyim==pakibstaitz=ro===dseyerrli=emng=ilerae===sowthe=adtwis=aliggelhtzessoneindrooia=my=abebost=as=rlanapt";

let board_arr = [board.substring(0, 15)];

board.substring(15).split(/(.{30})/).filter((s) => !!s).forEach((double_row) => {
  let r1 = "",
      r2 = "";

  double_row.split(/(.{3})/).filter((s) => !!s).forEach((trip, i) => {
    i % 2 ? r2 += trip : r1 += trip;
  });

  board_arr.push(r1)
  board_arr.push(r2);
});

let correct = true;

answers.forEach((row, i) => {
  if (row !== board_arr[i]) {
    console.log(`Incorrect. Line ${i} ${board_arr[i]} !== ${row}`);
    correct = false;
  }
});

correct && console.log("Answers match");
