
var participant_id     = '';
var participant_age    = '';
var participant_gender = '';
var participant_performance = 0;

function getHumanform() {
  participant_id     = makeId();
  participant_age    = document.getElementById("ageSelect").value;
  participant_gender = document.getElementById("genderSelect").value;
}

function getPerformance() {
  participant_performance = nanmean(sdata.resp_correct);
}