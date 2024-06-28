
function bin2num(b) {
  if(typeof(b)=="number") {
    return b;
  }
  if(typeof(b)=="boolean") {
    if (b) {
      return 1;
    } else {
      return 0;
    }
  }
  var v = [];
  for (var i=0; i<b.length; i++) {
    v = v.concat(bin2num(b[i]));
  }
  return v;
}

function num2bin(n) {
  if(typeof(n)=="boolean") {
    return n;
  }
  if(typeof(n)=="number") {
    if (n) {
      return true;
    } else {
      return false;
    }
  }
  var v = [];
  for (var i=0; i<n.length; i++) {
    v = v.concat(num2bin(n[i]));
  }
  return v;
}

function sign2bin(s) {
  if (s>0)  { return true;  }
  else      { return false; }
}

function bin2sign(b) {
  if (b)  { return  1; }
  else    { return -1; }
}

function toPrecision(x,n){
  var s = x.toFixed(n);
  return str2num(s);
}

function num2str(n) {
  var s = n.toString()
  return s;
}
function str2num(s) {
  var n = parseFloat(s);
  return n;
}

function dec2hex(n) {
  n = Math.round(n);
  return "0123456789ABCDEF".charAt((n-n%16)/16)+"0123456789ABCDEF".charAt(n%16);
}

function rgb2hex(rgb) {
  rgb = vprod(rgb,255);
  return '#'+dec2hex(rgb[0])+dec2hex(rgb[1])+dec2hex(rgb[2]);
}

function vec2str(v) {
  var str = '['+v+']';
  return str;
}

function mat2vec(m) {
  if(typeof(m)=="number") { return(m); }
  var v = [];
  for (var i=0; i<m.length; i++) {
    v = v.concat(m[i]);
  }
  return v;
}