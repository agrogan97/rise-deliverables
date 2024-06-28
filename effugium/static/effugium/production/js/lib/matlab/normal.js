
function normpdf(x, mu, sigma) {
  var tmp1 = -Math.pow((x - mu), 2) / (2 * Math.pow(sigma, 2));
  var tmp2 = Math.pow(Math.E, tmp1);
  var tmp3 = 1 / (sigma * (Math.sqrt(2 * Math.PI)));
  var norm = tmp3 * tmp2;
  return norm;
}

function normcdf(mean, sigma, to) {
  var z = (to - mean) / Math.sqrt(2 * sigma * sigma);
  var t = 1 / (1 + 0.3275911 * Math.abs(z));
  var a1 = 0.254829592;
  var a2 = -0.284496736;
  var a3 = 1.421413741;
  var a4 = -1.453152027;
  var a5 = 1.061405429;
  var erf = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-z * z);
  var sign = 1;
  if (z < 0){
    sign = -1;
  }
  var ret = (1 / 2) * (1 + sign * erf);
  return ret;
}
