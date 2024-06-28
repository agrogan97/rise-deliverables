

function drawInput(paper,centre,text, func) {

  var input_enabled = true;
  var input = {}
  input.centre  = centre;
  input.text    = text || '';
  input.func    = func || function(){};
  input.object  = paper.text(centre[0],centre[1],text);
  input.box     = paper.rect(0,0,0,0);

  input.enable  = function() {
    input_enabled = true;
    input.box.attr({"opacity": 1});
    input.update();
  }
  input.disable  = function() {
    input_enabled = false;
    input.box.attr({"opacity": 0});
    input.update();
  }
  input.update = function() {
      input.object.attr({"text": input.text});
      var bbox = input.object.getBBox();
      input.box.attr({"x":bbox.x,"y":bbox.y,"width":bbox.width,"height":bbox.height});
  }
  input.hide   = function() {
    input.object.attr({"opacity": 0});
    input.box.attr({"opacity": 0});
  }
  input.show   = function() {
    input.object.attr({"opacity": 1});
    if (input_enabled) {
      input.box.attr({"opacity": 1});
    }
  }

  // Enter
  var handleEnter = function() {
    if (input_enabled) {
      input.func(input.text);
      input.text = '';
      input.update();
    }}
  jwerty.key('return',handleEnter);
  
  // Backspace
  var handleBack  = function()    {
    if (input_enabled) {
      input.text = input.text.slice(0, - 1);
      input.update();
    }
  }
  // prevent from navigating back
  $(document).on("keydown", function (e) {
    if (e.which === 8) {
      a = $(e.target);
      e.preventDefault();
    }
  });
  jwerty.key('backspace',handleBack);
  
  // Character keys
  var handleKey   = function(key) {
    if (input_enabled) {
      input.text += key;
      input.update();
    }
  }
  var handleA   = function(){ handleKey('a'); }
  var handleB   = function(){ handleKey('b'); }
  var handleC   = function(){ handleKey('c'); }
  var handleD   = function(){ handleKey('d'); }
  var handleE   = function(){ handleKey('e'); }
  var handleF   = function(){ handleKey('f'); }
  var handleG   = function(){ handleKey('g'); }
  var handleH   = function(){ handleKey('h'); }
  var handleI   = function(){ handleKey('i'); }
  var handleJ   = function(){ handleKey('j'); }
  var handleK   = function(){ handleKey('k'); }
  var handleL   = function(){ handleKey('l'); }
  var handleM   = function(){ handleKey('m'); }
  var handleN   = function(){ handleKey('n'); }
  var handleO   = function(){ handleKey('o'); }
  var handleP   = function(){ handleKey('p'); }
  var handleQ   = function(){ handleKey('q'); }
  var handleR   = function(){ handleKey('r'); }
  var handleS   = function(){ handleKey('s'); }
  var handleT   = function(){ handleKey('t'); }
  var handleU   = function(){ handleKey('u'); }
  var handleV   = function(){ handleKey('v'); }
  var handleW   = function(){ handleKey('w'); }
  var handleX   = function(){ handleKey('x'); }
  var handleY   = function(){ handleKey('y'); }
  var handleZ   = function(){ handleKey('z'); }
  jwerty.key('A',handleA);
  jwerty.key('B',handleB);
  jwerty.key('C',handleC);
  jwerty.key('D',handleD);
  jwerty.key('E',handleE);
  jwerty.key('F',handleF);
  jwerty.key('G',handleG);
  jwerty.key('H',handleH);
  jwerty.key('I',handleI);
  jwerty.key('J',handleJ);
  jwerty.key('K',handleK);
  jwerty.key('L',handleL);
  jwerty.key('M',handleM);
  jwerty.key('N',handleN);
  jwerty.key('O',handleO);
  jwerty.key('P',handleP);
  jwerty.key('Q',handleQ);
  jwerty.key('R',handleR);
  jwerty.key('S',handleS);
  jwerty.key('T',handleT);
  jwerty.key('U',handleU);
  jwerty.key('V',handleV);
  jwerty.key('W',handleW);
  jwerty.key('X',handleX);
  jwerty.key('Y',handleY);
  jwerty.key('Z',handleZ);

  input.update();
  return input;
}

function setInput() {

}
