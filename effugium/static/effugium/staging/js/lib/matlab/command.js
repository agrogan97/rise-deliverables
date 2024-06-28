
function clear(v) {
  // clear all
  if(v=="all") { clear(who()); }
  // clear variables
  if(typeof(v)=="string") { v = [v]; }
  for(var i=0; i<v.length; i++) {
    eval('delete '+v[i]);
  }
}

function who() {
  var vbs = [];
  for(var vb in window){
    if(window.hasOwnProperty(vb) && typeof(eval(vb))!="function"){
      vbs = vbs.concat(vb);
    }
  }
  return vbs;
}
