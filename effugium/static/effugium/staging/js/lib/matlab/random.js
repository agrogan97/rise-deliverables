
function randunif(s,xmin,xmax) {
  var v = applyMatrix(function(){return Math.random()*(xmax-xmin)+xmin;},matrix(s));
  if(numel(v)==1) { v=v[0]; }
  return v;
}

function rand(s) { return randunif(s,0,1); }

function randn(s,xmean,xstd) {
  if(typeof(xmean)=='undefined') { xmean=0; }
  if(typeof(xstd )=='undefined') { xstd=1;  }
  var v = applyMatrix(function(){var u,v,a,b,y,y0,y1;u=Math.random();v=Math.random();a=Math.sqrt(-2*Math.log(u));b=2*Math.PI*v;y0=a*Math.cos(b);y1=a*Math.sin(b);return xmean+xstd*y0;},matrix(s));
  if(numel(v)==1) { v=v[0]; }
  return v;
}

function randi(n,s) {
  var v = applyMatrix(function(){return Math.floor(n*Math.random());},matrix(s));
  if(numel(v)==1) { v=v[0]; }
  return v;
}

function randperm(n) {
  var a = colon(0,n-1);
  var b = [];
  while(!isempty(a)){ b = b.concat(a.splice(randi(a.length),1)); }
  return b;
}

function randomElement(v,s) {
  assert(size(v).length==1,'randomElement: error. not a vector');
  if(typeof(s)=='undefined') { return v[randi(v.length)]; }
  var y = matrix(s);
  applyMatrix(function(){return randomElement(v)},y);
  return y;
}

function randgamma(k,t,s) {
  var randgamma_one = function() {
    var k_floor = floor(k);
    var k_delta = k - k_floor;
    var v0 = (Math.E / (Math.E + k_delta));
    var epsilon = 0;
    var eta     = power(epsilon,k_delta-1) * power(Math.E,-epsilon) + 1;
    while (eta > power(epsilon,k_delta-1) * power(Math.E,-epsilon)) {
      if (rand() <= v0) { epsilon = power(rand(),1/k_delta);  eta = rand()*power(epsilon,k_delta-1);  }
      else              { epsilon = 1-log(rand());            eta     = rand() * exp(-epsilon);       }
    }
    var elnu = log(rand(k_floor));
    if (k_floor>1) { elnu = sum(elnu); }
    var gamma = t*(epsilon - elnu);
    return gamma;
  }
  var v = applyMatrix(randgamma_one,matrix(s));
  if(numel(v)==1) { v=v[0]; }
  return v;
}
