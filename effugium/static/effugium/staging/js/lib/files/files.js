
function fileWrite(towards,content,func) {
  var result = $.post("php/file_write.php",{towards: towards, content: content});
  result.done(func);
}

function fileRead(from,func) {
  var result = $.post("php/file_read.php",{from: from});
  result.done(func);
}

function fileList(from,func) {
  var result = $.post("php/file_list.php",{from: from});
  result.done(func);
}

function fileMove(from,towards,func) {
  var result = $.post("php/file_move.php",{from:from, towards: towards});
  result.done(func);
}
