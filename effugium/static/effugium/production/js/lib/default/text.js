function removeSpaces(string){
  return string.split(' ').join('');
}
function makeId() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < 12; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
