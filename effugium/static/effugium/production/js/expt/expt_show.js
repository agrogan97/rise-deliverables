// Show methods

function showFeedbackPos() {
    board.posfeedback.object.attr({"opacity": 1});
    board.posfeedback.object.toFront();
  
}
function showFeedbackRestart() {
    board.resfeedback.object.attr({"opacity": 1});
    board.resfeedback.object.toFront();
}
function showFeedbackNew() {
    board.newfeedback.object.attr({"opacity": 1});
    board.newfeedback.object.toFront();
}
function showFeedbackNoLeft() {
    board.nolfeedback.object.attr({"opacity": 1});
    board.nolfeedback.object.toFront();
}

function showChallenge() {
    /*
        Summary:
                - This will bring up the challenge intersitial image, and will then display a game grid with the 'Challenge round' header
                - NB: It doesn't create a challenge layout, just changes the display
    */

    if ((coding.game+1) == 5 && coding.test >= 0){
        coding.answering = false;
        board.background.object.attr({"opacity": 1});
        board.background.object.toFront();
        board.challenge.object.attr({"opacity": 1});
        board.challenge.object.toFront();
    } else {
        coding.answering = true;
        testGameGo();
    }
    
}
