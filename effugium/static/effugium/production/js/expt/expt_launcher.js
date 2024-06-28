function nextTrial() {
    if (!startedexperiment) { return; }
    // this is used for any change in game (i.e. restart; new game; completed game)
    if (coding.index % coding.saveAfter == 0) saveExperiment();
    // Cache the current state
    cacheState();
    // Block the Skip Game and Restart buttons
    removeClicks();
    if (!RELOADED_STATE){
        // save progress if already started
        if (flag_test===true){
            saveTest();
            saveTrial();
            flag_test = false;
        
            } else {
                if (coding.index>-1) {
                    saveTrial();
                    saveExperiment();
                }
                if (flag_restart==0) {
                    saveGame();
                }
            }
        
        if (coding.test==((parameters.nb_trials/5)-1)) {flag_transfer = true;}
    
        if (flag_restart===false) {
        // END OF EXPERIMENT
    
            if ((coding.game+1)===(parameters.nb_trials+parameters.nb_transfer)) {
                finishExperiment_game();
                return;
                }
        }
        
        // increment trial
        coding.index++;
        coding.trial++;
        // update
        updateSdata();
        // timestamp
        coding.timestamp = getTimestamp();
        // reset trial stats
        coding.answering = true;
        coding.solved = 0;
        if (flag_restart===false) {
            if (coding.game>0 && (coding.game)<parameters.nb_trials) {
            if (((coding.game+1)%5)===0 || ((coding.game)%5)===0) {
                if ((sdata.test_index[Math.round((coding.game+1)/5)-1]===(Math.round((coding.game+1)/5)-1))===false) {
                    coding.test++
                    testGame();
                    return
                }
                } 
            }
        }
    
        // Once 5 consecutive games have been solved, increment the level
        if (coding.game<4) {
            coding.level = 1;
        } else {
            if (coding.level==sdata.game_level[coding.game-4]) {
                if ((sdata.game_solved[coding.game]+sdata.game_solved[coding.game-1]+sdata.game_solved[coding.game-2]+sdata.game_solved[coding.game-3]+sdata.game_solved[coding.game-4])==5) {
                    if (coding.level < 5){
                        coding.level++
                        coding.level_count = 0;
                    }
            
                }
            }
        }
    
        if (flag_restart) {
            coding.attempts++
        } else {
            coding.game ++;
            coding.attempts = 1;
        }

        board.uc.object.attr({"text": "Round " + (coding.game + coding.test +2 ) + "/92"});
        board.dl.object.attr({"text": ("Restart Round (" + (coding.attempts) + "/3)")});
        board.dl.object.attr({"opacity": op_dl});
        resetGrid();

        // Cache the current state
        cacheState();

    } else {
        /*
            ----- LOADING FROM CACHE -----
        */

        coding.timestamp = getTimestamp();
        coding.answering = true;
        coding.solved = 0;
        // Increment the tracker for every user attempt (including choice restarts and restarts from cache)
        coding.index++;
        coding.trial++;
        coding.registeredControls = false;
        registerControls();
        // update
        updateSdata();
        if (flag_test){
            /*
                ----- TESTING (CHALLENGE) ROUND -----
            */
           RELOADED_STATE = true;
           testGame();

        } else if (flag_transfer) {
            /*
                ----- TRANSFER ROUND -----
            */
            if (coding.attempts == 1){
                coding.attempts = 2;
            } else if (coding.attempts == 2){
                coding.attempts = 3;
            }
            cacheState()

            // Set board text
            board.uc.object.attr({"text": "Game " + (coding.game + coding.test +2 ) + "/92"});
            board.dl.object.attr({"text": ("Restart Round (" + (coding.attempts) + "/3)")});
            board.dl.object.attr({"opacity": op_dl});
            RELOADED_STATE = true;
            resetGrid();
        } else {
            /*
                ----- TRAINING ROUND -----
                    - Check if player has used all restarts (coding.attempts = 3)
            */
            if (coding.attempts == 1){
                coding.attempts = 2;
            } else if (coding.attempts == 2){
                coding.attempts = 3;
            }
            cacheState()
            // Set board text
            board.uc.object.attr({"text": "Round " + (coding.game + coding.test +2 ) + "/92"});
            board.dl.object.attr({"text": ("Restart Round (" + (coding.attempts) + "/3)")});
            board.dl.object.attr({"opacity": op_dl});
            RELOADED_STATE = true;
            resetGrid();
        }
    }

    RELOADED_STATE = false;
}

    function solvedGame(){
        coding.solved = 1;
        coding.answering = 0;

        showFeedbackPos();
        setTimeout(function(){hideFeedback();nextTrial();}, 500);
    }

    function restartGame(){
        // Cache the current state
        coding.answering = true;
        cacheState();
        if (coding.answering) {
            if (flag_test==false) {
                if (coding.attempts<3) {
                    flag_restart = true;
                    showFeedbackRestart();
                    coding.answering = false;
                    removeClicks();
                    setTimeout(function(){
                        hideFeedback();
                        nextTrial();
                    }, 500);
                } else {
                    removeClicks();
                    showFeedbackNoLeft();
                    setTimeout(function(){
                        coding.isSkipBlocked = true;
                        hideFeedback();
                        nextTrial();
                    }, 500);
                }
            } else {
                //restartTest();
            }
        }
    }

    function restartTest(){
        // showFeedbackNoLeft();
        // setTimeout(function(){hideFeedback();nextTrial();}, 500);
    }
    

    function newGame(){
        removeClicks();
        if (coding.answering) {
            showFeedbackNew();
            setTimeout(function(){ 
                hideFeedback();
                nextTrial();
                }, 
                500);
        }
    }

    function testGame(){
        coding.answering = false;
        flag_test = true;
        flag_restart = false;
        coding.attempts = 1;
        cacheState();
        showChallenge();
    }

    function testGameGo() {
        resetGrid();
        cacheState();
        board.uc.object.attr({"text": "Challenge game"});
        board.dl.object.attr({"text": (key_dl + "try again (" + (coding.attempts) + "/1)")});
        board.dl.object.attr({"opacity": 0});
    }


    function saveTrial() {

        sdata.expt_index[coding.index]        = coding.index;
        sdata.expt_trial[coding.index]        = coding.trial;

        sdata.trial_solved[coding.index]      = coding.solved;
        sdata.trial_attempts[coding.index]    = coding.attempts;
        sdata.trial_level[coding.index]       = coding.level;
        sdata.trial_layout[coding.index]      = coding.layout;
        sdata.trial_game[coding.index]        = coding.game+1;
        sdata.trial_transfer[coding.index]    = flag_transfer;
        sdata.trial_test[coding.index]        = flag_test;
    }

    function saveGame() {
        sdata.game[coding.game]              = coding.game+1;
        sdata.game_solved[coding.game]       = coding.solved;
        sdata.game_layout[coding.game]       = coding.layout; 
        sdata.game_level[coding.game]        = coding.level; 
        sdata.game_attempts[coding.game]     = sdata.trial_attempts[coding.index];
        sdata.game_transfer[coding.game]     = flag_transfer;
    }

    function saveTest() {
        sdata.test_index[coding.test]        = coding.test;
        sdata.test_solved[coding.test]       = coding.solved;
        sdata.test_layout[coding.test]       = coding.layout;
    }
