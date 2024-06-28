function isFullscreen(){
  return (document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement);
}
function onFullscreen() {
  if (document.documentElement.requestFullscreen) {
    document.documentElement.requestFullscreen();
  } else if (document.documentElement.mozRequestFullScreen) {
    document.documentElement.mozRequestFullScreen();
  } else if (document.documentElement.webkitRequestFullscreen) {
    document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
  }
}
function offFullscreen() {
  if (document.cancelFullScreen) {
    document.cancelFullScreen();
  } else if (document.mozCancelFullScreen) {
    document.mozCancelFullScreen();
  } else if (document.webkitCancelFullScreen) {
    document.webkitCancelFullScreen();
  }
}
function toggleFullScreen() {
  if (isFullscreen()) {
    offFullscreen();
  } else {
    onFullscreen();
  }
}

function handleFullscreen() {
  //instructions screen
  if(!isFullscreen() && $('#startButton').length>0){
    document.getElementById('startButton').disabled = true;
  }
  //task screen
  if(!isFullscreen() && startedexperiment && !finishedexperiment) {
    stopExperiment();
    goWebsite(html_errscreen);
  }
}            
