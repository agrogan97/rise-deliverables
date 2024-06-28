// The ones I know we actually use probably
var html_instructions_RISE_styled = METAPARAMS.BASEPATH + "html/instructions_RISE_styled.html";
var html_instructions_m_RISE_styled = METAPARAMS.BASEPATH + "html/instructions_m_RISE_styled.html";
var html_instructions           = METAPARAMS.BASEPATH + "html/instructions.html";
var html_instructions_m         = METAPARAMS.BASEPATH + "html/instructions_m.html";
var html_instructions_RISE      = METAPARAMS.BASEPATH + "html/instructions_RISE.html";
var html_instructions_m_RISE    = METAPARAMS.BASEPATH + "html/instructions_m_RISE.html";
var html_sending                = METAPARAMS.BASEPATH + "html/sending_data.html";
var html_end                = METAPARAMS.BASEPATH + "html/end.html";
var html_sending_RISE           = METAPARAMS.BASEPATH + "html/sending_data_RISE.html";
var html_end_RISE           = METAPARAMS.BASEPATH + "html/end_RISE.html";
var html_validating_RISE = METAPARAMS.BASEPATH + "html/validating_RISE.html"

var html_start            = METAPARAMS.BASEPATH + "html/start.html";
var html_welcome          = METAPARAMS.BASEPATH + "html/welcome.html";
var html_welcome_m        = METAPARAMS.BASEPATH + "html/welcome_m.html";
var html_infosheet        = METAPARAMS.BASEPATH + "html/information_sheet.html";
var html_consentform      = METAPARAMS.BASEPATH + "html/consent_form.html";
var html_load             = METAPARAMS.BASEPATH + "html/loading.html";
var html_task             = METAPARAMS.BASEPATH + "html/task.html";
var html_errnoresp        = METAPARAMS.BASEPATH + "html/error_noresponse.html";
var html_errscreen        = METAPARAMS.BASEPATH + "html/error_fullscreen.html";
var html_invalidlink      = METAPARAMS.BASEPATH + "html/invalid_link.html";
var RPM1 = METAPARAMS.BASEPATH + "html/RPM1.html";
var RPM2 = METAPARAMS.BASEPATH + "html/RPM2.html";
var RPM3 = METAPARAMS.BASEPATH + "html/RPM3.html";
var RPM4 = METAPARAMS.BASEPATH + "html/RPM4.html";
var RPM5 = METAPARAMS.BASEPATH + "html/RPM5.html";
var RPM6 = METAPARAMS.BASEPATH + "html/RPM6.html";
var RPM7 = METAPARAMS.BASEPATH + "html/RPM7.html";
var RPM8 = METAPARAMS.BASEPATH + "html/RPM8.html";
var RPM9 = METAPARAMS.BASEPATH + "html/RPM9.html";

function emptyDiv(divid) {
  document.getElementById(divid).innerHTML = "";
}

function printDiv(divid,webfile) {
  if(typeof(coding)=="undefined"){
    coding = {};
  }
  // webdata
  var webdata = {};
  webfunc = function(data) {
    document.getElementById(divid).innerHTML = data;
    coding.webfile = webfile;
  }
  // send
  $.post(webfile,webdata,webfunc);
}

function hideDiv(element){
      document.getElementById(element).hidden = true;
}

function showDiv(element){
      document.getElementById(element).hidden = false;
}

function goWebsite(url) {
  printDiv("webbodyDiv",url);
}

// Auxiliar methods for HTML templates
var participant_id     = makeId();
var participant_age    = '';
var participant_gender = '';
function getHumanform(){
  participant_age    = document.getElementById("ageSelect").value;
  participant_gender = document.getElementById("genderSelect").value;
}
