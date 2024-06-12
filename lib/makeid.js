function generateRandomString(length) {
  let result = "";
  let characters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

function makeid(num = 4) {
  let result = "C_Y_B_E_R_";
  let currentDate = new Date();
  let year = currentDate.getFullYear().toString().slice(2);
  let month = ("0" + (currentDate.getMonth() + 1)).slice(-2);
  let day = ("0" + currentDate.getDate()).slice(-2);
  result += year + "_" + month + "_" + day + "_";
  let randomNumber = generateRandomString(4);
  let formattedRandomNumber = randomNumber.replace(/(\d{1,2})(?=\d)/g, "$1_");
  result += formattedRandomNumber + "_";
  for (let i = 0; i < num; i++) {
    if (i % 2 === 0 && i > 0) {
      result += "_";
    }
    result += generateRandomString(1);
  }
  return result;
}

module.exports = { makeid };
