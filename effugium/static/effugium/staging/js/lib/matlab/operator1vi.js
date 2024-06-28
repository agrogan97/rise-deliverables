
// SQUEEZE
function squeeze(v) {
  var squeeze = function(v){
    if(typeof(v)=="number") { return v; }
    if(size(v,0)==1)        { return squeeze(v[0]); }
    for(var i=0; i<v.length; i++) {
      v[i] = squeeze(v[i]);
    }
    return v;
  }
  return squeeze(clone(v));
}

// IS MEMBER
function ismember(e,v) {
  if(typeof(v)=="number") { return(v==e); }
  for(var i=0; i<v.length; i++) {
    if(ismember(e,v[i])) { return true; }
  }
  return false;
}

// UNIQUE
function unique(v) {
  assert(size(v).length==1,'unique: error. not a vector');
  var y = [];
  for(var i=0; i<v.length; i++){
    if(!ismember(v[i],y)) { y.push(v[i]); }
  }
  return sort(y);
}


// MIN
function min(v) {
  assert(size(v).length==1,'min: error. not a vector');
  var m = Infinity;
  for (var i=0; i<v.length; i++) {
    if(!isNaN(v[i]) && !(m<v[i])) { m = v[i]; }
  }
  return m;
}

// MAX
function max(v) {
  assert(size(v).length==1,'max: error. not a vector');
  var m = -Infinity;
  for (var i=0; i<v.length; i++) {
    if(!isNaN(v[i]) && m<v[i]) { m = v[i]; }
  }
  return m;
}

// SUM
function sum(v) {
  assert(size(v).length==1,'sum: error. not a vector');
  assert(v.length>0,       'sum: error. not a vector');
  var s = 0;
  for (var i=0; i<v.length; i++) {
    if (!isNaN(v[i])){
      if(typeof(v[i])=="boolean" && v[i]) { s += 1;    }
      else                                { s += v[i]; }
    }
  }
  return s;
}

// PROD
function prod(v) {
  assert(size(v).length==1,'prod: error. not a vector');
  var s = 1;
  for (var i=0; i<v.length; i++) {
    if (!isNaN(v[i])){ s *= v[i]; }
  }
  return s;
}

// MEAN
function mean(v) {
  assert(size(v).length==1,'mean: error. not a vector');
  var s = sum(v);
  var l = v.length - sum(isnan(v));
  var m = s/l;
  return m;
}

// QUANTILES
function quantile(v, p) {
  assert(size(v).length==1,'median: error. not a vector');
  if(p==0) { return min(v); }
  if(p==1) { return max(v); }
  v = sort(v);
  var ret = NaN;
  var prop = Math.floor(p*v.length);
  if(v.length % 2) { ret = v[prop]; }
  else { ret = (v[prop-1] + v[prop]) / 2.0; }
  if (isnan(ret)) {
    if (prop<1)         { ret = min(v); }
    if (prop>=v.length) { ret = max(v); }
  }
  return ret;
}
function median(v) { return quantile(v,0.5); }

// VARIANCE
function variance(v) {
  assert(size(v).length==1,'variance: error. not a vector');
  var s = sum(power(vrest(v,mean(v)),2));
  var l = v.length - sum(isnan(v));
  return s/l;
}

// STANDARD DEVIATION
function std(v) { return Math.sqrt(variance(v)); }

// ALL
function all(v) {
  assert(size(v).length==1,'all: error. not a vector');
  var r = true;
  for (var i=0; i<v.length; i++) {
    r = r && Boolean(v[i]);
  }
  return r;
}

// ANY
function any(v) {
  assert(size(v).length==1,'any: error. not a vector');
  var r = false;
  for (var i=0; i<v.length; i++) {
    r = r || Boolean(v[i]);
  }
  return r;
}

