function startExperiment() {
    // set flags
    startedexperiment  = true;
    finishedexperiment = false;
    timer = new Timer();
    timer.startNewTimer("player");
    // Check here if there is cached state data - if this is the first runthrough, or the game has been previously completed, then there shouldn't be
    // But if there is, then we should load in that data instead
    if (hasCachedData()){
        retrieveState(storeResults=true);
        if (compareIds()){
            // IDs don't match, don't reload from state
            setExperiment();
            // run the experiment
            edata.exp_starttime = Timer.getCurrentTime();
            RELOADED_STATE = false;
        } else {
            compareIds();
            RELOADED_STATE=true;
            // User has previously completed but not restarted - load end screen
            if (edata.gameCompleted && edata.postedConfirmation){
                goWebsite(html_end);
                console.log("Pushing to endscreen")
            // User has completed but not posted - push post through 
            } else if (edata.gameCompleted && !edata.postedConfirmation){
                postConfirmComplete();
                goWebsite(html_end);
                saveDataToServer();
            }
            // Log the cache restore time
            try {
                coding.cacheRestoreTimes.push(Timer.getCurrentTime());
                edata.cacheRestoreTimes.push(Timer.getCurrentTime());
            } catch (error) {
                coding.cacheRestoreTimes = [];
                edata.cacheRestoreTimes = [];
            }
            // Replace the new start time with the previously recorded start time
            timer.timers["player"].start = edata.exp_starttime;
            // Cache the newly added timers
            cacheState();
        }
        
    } else {
        setExperiment();
        // run the experiment
        edata.exp_starttime = Timer.getCurrentTime();
        RELOADED_STATE = false;
    }
    runExperiment();
}

function finishExperiment_resize() {
    //instructions screen
    if(!isFullscreen() && $('#startButton').length>0){
        document.getElementById('startButton').disabled = true;
    }
    //task screen
    if(!isFullscreen() && startedexperiment && !finishedexperiment) {
        stopExperiment();
        saveExperiment("data/resize");
        goWebsite(html_errscreen);
    }
}

function finishExperiment_noresponse() {
    // stop the experiment
    edata.exp_finishtime = getTimestamp();
    stopExperiment();
    // send the data
    saveExperiment("data/noresponse");
    goWebsite(html_errnoresp);
}

function finishExperiment_game() {
    // stop the experiment
    edata.exp_finishtime = getTimestamp();
    stopExperiment();
    // send the data
    //goWebsite("html/RPM_instructions.html");
    finishExperiment_data();
}

function finishExperiment_data() {
    // The primary end of experiment function
    console.log("Game end")
    timer.endTimer("player");
    edata.exp_finishtime = Timer.getCurrentTime();
    edata.gameCompleted = true;
    // Send off final data
    saveExperiment("data/data");
    postConfirmComplete();
    saveExperiment()
    // Clear the cache of any state data
    clearState();
    isRise ? goWebsite(html_end_RISE) : goWebsite(html_end)
    // Tidy up the cache
    clearState();
}

function stopExperiment() {
    if(startedexperiment){
        // set flagss
        finishedexperiment = true;
        removePaper();
    }
}