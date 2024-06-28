
function arcCountdown(arc,colour) {
  //make an arc at 50,50 with a radius of 30 that grows from 0 to 40 of 100 with a bounce
  var object = board.paper.object.path().attr({
      "stroke": colour,
      "stroke-width": 14,
      "stroke-opacity": 0,
      arc: arc
  });
  return object;
}

function drawCountdown(colour,opacity) {
  board.paper.object.customAttributes.arc = function (xloc, yloc, value, total, R) {
      var alpha = 360 / total * value;
      var a = (90 - alpha) * Math.PI / 180;
      var x = xloc + R * Math.cos(a);
      var y = yloc - R * Math.sin(a);
      var path;
      if (total == value) { path = [ ["M", xloc, yloc - R], ["A", R, R, 0, 1, 1, xloc - 0.01, yloc - R] ];
      } else              { path = [ ["M", xloc, yloc - R], ["A", R, R, 0, +(alpha > 180), 1, x, y] ];
      }
      return { path: path };
  };
  board.countdown = {};
  board.countdown.colour  = colour  || "#5f7";
  board.countdown.opacity = opacity || 1;
  board.countdown.total   = 6;
  board.countdown.counter = board.countdown.total;
  board.countdown.value   = 0;
  board.countdown.arc     = [board.paper.centre[0],board.paper.centre[1],board.countdown.value,1,50];
  board.countdown.object  = arcCountdown(board.countdown.arc,board.countdown.colour);
}

function startCountdown() {
  board.countdown.timeout = setTimeout(showCountdown,parameters.response_timeout);
  board.countdown.counter = board.countdown.total;
}

function showCountdown() {
  board.countdown.object.attr({"stroke-opacity": board.countdown.opacity});
  moveCountdown();
}

function stopCountdown() {
  clearTimeout(board.countdown.timeout);
  board.countdown.object.attr({"stroke-opacity": 0});
}

function moveCountdown() {
  if (parameters.warnings_timeout == 0) {
    stopCountdown();
    handleResponse('None', NaN);
  } else if (board.countdown.counter == 0) {
    stopCountdown();
    handleResponse('None', NaN);
  } else{
    board.countdown.counter -= 1;
    board.countdown.value   = board.countdown.counter / board.countdown.total;
    board.countdown.arc     = [board.paper.centre[0],board.paper.centre[1],board.countdown.value,1,30];
    board.countdown.object.animate({arc: board.countdown.arc},200, "bounce");
    board.countdown.timeout = setTimeout(moveCountdown,parameters.warnings_timeout/board.countdown.total);
  }
}

function removeCountdown(){
  board.countdown.object.remove();
}
