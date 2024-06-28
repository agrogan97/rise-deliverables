
<!-- Individual squircles -->

function polySquircle(squircle) {
  var nbPoints = 90;
  var shape    = squircle.shape;
  var Harea    = squircle.area;
  var Ht       = linspace(0,2*pi,nbPoints+1);
  var Hr       = .25 * pi;
  var Ha = sqrt(abs(0.25 * Harea * gamma(1+2/shape) / power(gamma(1+1/shape),2) ));
  var Hx = power(abs(cos(Ht)),(2/shape));
  Hx     = vprod(Hx,Ha);
  Hx     = vprod(Hx,sign(cos(Ht)));
  var Hy = power(abs(sin(Ht)),(2/shape));
  Hy     = vprod(Hy,Ha);
  Hy     = vprod(Hy,sign(sin(Ht)));
  var Hpolyx = vrest(vprod(Hx,cos(Hr)),vprod(Hy,sin(Hr)));
  Hpolyx = vsum(Hpolyx,squircle.centre[0]);
  var Hpolyy = vsum(vprod(Hx,sin(Hr)),vprod(Hy,cos(Hr)));
  Hpolyy = vsum(Hpolyy,squircle.centre[1]);
  var Hpoly = [Hpolyx,Hpolyy];
  return Hpoly;
}

function pathSquircle(squircle) {
  var Hpoly = squircle.poly;
  var path = sprintf('M %.2f , %.2f',Hpoly[0][0],Hpoly[1][0]);
  for (var i=1; i<Hpoly[0].length; i++) { path += sprintf(' L %.2f , %.2f',Hpoly[0][i],Hpoly[1][i]); }
  path += ' Z';
  return path;
}

function colourSquircle(squircle) {
  squircle.crgb   = [squircle.colour,0,1-squircle.colour];
  squircle.chex   = rgb2hex(squircle.crgb);
  squircle.object.attr({"fill": squircle.chex});
  squircle.object.attr({"stroke-opacity": 0});
}


<!-- Squircles Ring -->

function createSquirclesRing(nbSquircles,paper,centre,radi,area,colours,shapes) {
  if(typeof(nbSquircles)=="undefined") {nbSquircles = 8;    }
  if(typeof(paper)=="undefined")       {paper       = board.paper.object;  }
  if(typeof(centre)=="undefined")      {centre      = board.paper.centre;  }
  if(typeof(radi)=="undefined")        {radi        = 100;  }
  if(typeof(area)=="undefined")        {area        = 2500; }
  if(typeof(colours)=="undefined")     {colours     = randunif(nbSquircles,0,1); }
  if(typeof(shapes)=="undefined")      {shapes      = randunif(nbSquircles,1,2); }
  // set squircles ring properties
  var ring = {};
  ring.paper  = paper;
  ring.centre = centre;
  ring.radi   = radi;
  ring.area   = area;
  // generate squircles
  var squircles = genSquirclesRing(ring,colours,shapes);
  squircles     = drawSquirclesRing(paper,squircles);
  hideSquirclesRing(squircles);
  // return
  return [ring,squircles];
}

function genSquirclesRing(ring,colours,shapes) {
  assert(colours.length==shapes.length,"drawSquircles: error. arguments not consistent");
  var nbSquircles = colours.length;
  var angles      = linspace(0,2*pi,nbSquircles+1);
  var d_pos       = vprod([sin(angles),cos(angles)],ring.radi);
  squircles = [];
  for(var i=0; i<nbSquircles; i++){
    squircles[i] = {};
    squircles[i].centre = vsum(ring.centre,[d_pos[0][i],d_pos[1][i]]);
    squircles[i].area   = ring.area;
    squircles[i].colour = colours[i];
    squircles[i].shape  = shapes[i];
    squircles[i].poly   = polySquircle(squircles[i]);
    squircles[i].path   = pathSquircle(squircles[i]);
  }
  return squircles;
}

function drawSquirclesRing(paper,squircles) {
  for(var i=0; i<squircles.length; i++){
    squircles[i].object = drawPath(paper,squircles[i].path);
    colourSquircle(squircles[i]);
  }
  return squircles;
}

function showSquirclesRing(squircles) {
  for(var i=0; i<squircles.length; i++) {
    squircles[i].object.attr({"opacity": 1});
  }
}

function hideSquirclesRing(squircles) {
  for(var i=0; i<squircles.length; i++) {
    squircles[i].object.attr({"opacity": 0});
  }
}

function removeSquirclesRing(squircles) {
  for(var i=0; i<squircles.length; i++) {
    squircles[i].object.remove();
  }
}

function setSquirclesRing(ring,squircles,colours,shapes) {
  removeSquirclesRing(squircles);
  squircles = genSquirclesRing(ring,colours,shapes);
  drawSquirclesRing(ring.paper,squircles);
  hideSquirclesRing(squircles);
  return squircles;
}

function exampleSquircles() {
  var ringsquircles = createSquirclesRing();
  board.ring    = ringsquircles[0];
  board.stimuli = ringsquircles[1];
  board.stimuli = setSquirclesRing(board.ring,board.stimuli,randunif(8,0,1),randunif(8,1,2));
  showSquirclesRing(board.stimuli);
}
