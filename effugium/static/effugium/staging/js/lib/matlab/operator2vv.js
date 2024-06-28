
function vequal(u,v) {
  if (typeof(v)=="number" && typeof(u)=="number") { return u==v; }
  if (typeof(v)=="number") { v = matrix(size(u),v); }
  if (typeof(u)=="number") { u = matrix(size(v),u); }
  return applyMatrix(function(u,v){return u==v;},u,v);
}

function power(u,v) {
  if (typeof(v)=="number" && typeof(u)=="number") { return Math.pow(u,v); }
  if (typeof(v)=="number") { v = matrix(size(u),v); }
  if (typeof(u)=="number") { u = matrix(size(v),u); }
  return applyMatrix(function(u,v){return Math.pow(u,v); },u,v);
}

// ANY ARGUMENTS
function vsum() {
  var s = size(arguments[0]);
  var args = [function(){ var s = 0; for(var i=0;i<arguments.length;i++) { s+= arguments[i]; } return s; }];
  for(var i=0;i<arguments.length;i++) {
    if(typeof(arguments[i])=="number")  { args[i+1] = matrix(s,arguments[i]); }
    else                                { args[i+1] = arguments[i];           }
  }
  return applyMatrix.apply(this,args);
}

function vrest() {
  var s = size(arguments[0]);
  var args = [function(){ var s = arguments[0]; for(var i=1;i<arguments.length;i++) { s-= arguments[i]; } return s; }];
  for(var i=0;i<arguments.length;i++) {
    if(typeof(arguments[i])=="number")  { args[i+1] = matrix(s,arguments[i]); }
    else                                { args[i+1] = arguments[i];           }
  }
  return applyMatrix.apply(this,args);
}

function vprod() {
  var s = size(arguments[0]);
  var args = [function(){ var s = 1; for(var i=0;i<arguments.length;i++) { s*= arguments[i]; } return s; }];
  for(var i=0;i<arguments.length;i++) {
    if(typeof(arguments[i])=="number")  { args[i+1] = matrix(s,arguments[i]); }
    else                                { args[i+1] = arguments[i];           }
  }
  return applyMatrix.apply(this,args);
}

function vdiv() {
  var s = size(arguments[0]);
  var args = [function(){ var s = arguments[0]; for(var i=1;i<arguments.length;i++) { s/= arguments[i]; } return s; }];
  for(var i=0;i<arguments.length;i++) {
    if(typeof(arguments[i])=="number")  { args[i+1] = matrix(s,arguments[i]); }
    else                                { args[i+1] = arguments[i];           }
  }
  return applyMatrix.apply(this,args);
}

function vand(u,v) {
  return num2bin(vprod(bin2num(u),bin2num(v)));
}

function vor(u,v) {
  return num2bin(vsum(bin2num(u),bin2num(v)));
}

function vgreater(u,v) {
  if (typeof(v)=="number" && typeof(u)=="number") { return u>v; }
  if (typeof(v)=="number") { v = matrix(size(u),v); }
  if (typeof(u)=="number") { u = matrix(size(v),u); }
  return applyMatrix(function(u,v){return u>v;},u,v);
}

function vless(u,v) {
  if (typeof(v)=="number" && typeof(u)=="number") { return u>v; }
  if (typeof(v)=="number") { v = matrix(size(u),v); }
  if (typeof(u)=="number") { u = matrix(size(v),u); }
  return applyMatrix(function(u,v){return u<v;},u,v);
}

