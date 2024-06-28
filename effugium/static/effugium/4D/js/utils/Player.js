class Player {
    constructor() {
        // Storage object for all data
        this.data = []

        // Specific copy of the current round data for easy access
        this.round = {
            globalRoundNum: 0, // An index of all rounds attempted of all types
            roundIndex: 0, // An index of unique rounds played (new attempts not counted)
            attemptNum: 0, // The round-specific attempt number
            level: 1, // The difficulty level (for RISE, 1->4)
            currLevel: 1,
            stratLevel: 1,
            numCorrect: 0, // The number of correctly solved training rounds (i.e. not including test or transfer)
            numCorrectPerLevel: 0,
            roundType : "train",
            layoutId: undefined,
            layout : undefined,
            fromReload: false,
            resp: this.newEmptyResponse(), // Creates a new empty response dictionary
        }

        // Rise-specific tracking object
        this.riseTracking = {
            roundNum: this.round.roundIndex,
            maxRounds: 92,
            roundsComplete: [],
            timesComplete: [],
        }

        // Keep track of current player position on grid
        this.position = {x: 0, y: 0};
        this.level = 1;
        this.currLevel = 1;
        this.stratLevel = 1;
        // and track if they've collected a key (stored as false if not collected, and tool ID as string if has)
        this.hasKey = false;
        this.hasLock = false;
        this.canMove = true;
    }

    /**
     * Instantiate a new round with a new layout file
     * @param {boolean} [restart=false] whether or not this round is a restart with the same layout file as the previous round
     * @returns {any}
     */
    newRound(restart=false){
        // Check this.round.numCorrectPerLevel and update the current level if necessary
        if (this.round.numCorrectPerLevel != 0 && this.round.numCorrectPerLevel % 5 == 0 && this.round.roundIndex <= 72 && this.level < 4){
            this.level += 1;
            this.round.numCorrectPerLevel = 0;
        }

        // Second protective layer against multiple restarts
        if (this.round.attemptNum >= 2){this.round.attemptNum = 2; restart = false}

        let newRound = {
            globalRoundNum: this.round.globalRoundNum + 1, // Always increment by 1
            roundIndex: restart ? this.round.roundIndex : this.round.roundIndex +1, // Keep the same if restart, else increment by 1
            attemptNum: restart ? this.round.attemptNum + 1 : 0, // Increment by 1 if restart, else reset to 0
            level: this.level,
            currLevel: this.currLevel,
            stratLevel: this.stratLevel,
            numCorrect: this.round.numCorrect,
            numCorrectPerLevel: this.round.numCorrectPerLevel,
            layoutId: restart ? this.round.layoutId : undefined,
            layout: restart ? this.round.layout : undefined,
            roundType: undefined,
            startTime: Date.now(),
            endTime: undefined,
            completed: false,
            fromReload: false,
            resp: this.newEmptyResponse()
        }
        // Set as current round
        this.round = newRound;
        // Remember that isTraining pulls from this.round.roundIndex
        this.round.roundType = game.isTraining() ? "train" : (game.isTest() ? "test" : "transfer")
        // Cache round attempt number
        localStorage.setItem("attemptNum", this.round.attemptNum)
    }

    /**
     * Creates a new empty response object that would be added to wider round information
     * @returns {Object} object containing arrays for data storage
     */
    newEmptyResponse(){
        return {
            allowed: [],
            direction: [],
            timestamp: [],
            tool: [],
            xloc: [],
            yloc: []
        }
    }

    /**
     * Update the current running response dictionary
     */
    saveResponse(response){
        Object.keys(response).forEach(key => {
            this.round.resp[key].push(response[key])
        })
    }

    /**
     * Save the current round by adding in extra information after the player has completed it - eg. completion time, if completed succesfully etc
     */
    saveRound(reachedGoal=false){
        // Set endtime
        this.round.endTime = Date.now()
        // Set correctness from if this was restarted or skipped
        this.round.completed = reachedGoal;
        // Update rise tracker alongside
        if (reachedGoal){
            // Update num correct
            if (game.isTraining()) {this.round.numCorrectPerLevel += 1};
            this.round.numCorrect += 1;
            this.updateRiseTracking(this.round.roundIndex, this.round.endTime);
        } else {
            if (game.isTraining()){this.round.numCorrectPerLevel = 0};
        }

        localStorage.setItem("lastRound", [this.round.roundIndex, reachedGoal])
        
        // Store in this.data
        this.data.push(this.round);
        // Trigger server-side saving:
        const data = {
            data: this.data,
            riseTracking: this.riseTracking
        }
        game.saveToServer(data);
    }

    /**
     * Updates the layout stored for the most recent data entries, fresh from receiving a layout from the server
     * @param {Object} layout - an object mapping layout ID to a string with the actual layout design in
     * @returns {any}
     */
    updateLayout(config){
        // update this.data
        this.round.layoutId = config.layoutId
        this.round.layout = config.layout

        // And once implemented, cache the data - unless we scrap localStorage caching and enable refresh from server - would be so much easier
    }

    /**
     * Ongoing tracking for RISE, updating after each successful level completion. Updates this.riseTracking object. Called within this.saveRound().
     * @param {int} roundIndex the unique index for the current round, equating to the number of unique rounds seen (minus 1 for 0-indexing). Doesn't include any repeat attempts.
     * @param {int} endTime epoch timestamp at which player completed the round
     */
    updateRiseTracking(roundIndex, endTime){
        this.riseTracking.roundNum = roundIndex+1
        this.riseTracking.roundsComplete.push(roundIndex+1)
        this.riseTracking.timesComplete.push(endTime)
    }
}