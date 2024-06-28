function hideTrial() {
    hideFixation(board.fixation);
    hideStimuli();
    hideInstructions();
    hideClock();
}

function hideFeedback() {
    board.posfeedback.object.attr({"opacity": 0});
    board.resfeedback.object.attr({"opacity": 0});  
    board.newfeedback.object.attr({"opacity": 0});
    board.nolfeedback.object.attr({"opacity": 0});
}

function hideChallenge() {
    board.background.object.toBack();
    board.background.object.attr({"opacity": 1});
    board.challenge.object.attr({"opacity": 0});
    board.challenge.object.toBack();
    coding.answering = true;
    testGameGo();
}

function hideBlock() {
    board.block.object.remove();
}
