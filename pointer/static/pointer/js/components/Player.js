class Player {
    constructor() {
        // Storage object for all data
        this.data = []

        // Specific copy of the current round data for easy access
        this.round = {
            globalRoundNum: 0, // An index of all rounds attempted of all types
            roundIndex: 0, // An index of unique rounds played (new attempts not counted)
            attemptNum: 0, // The round-specific attempt number
            trainingNum: 0,
            level: 1, // The difficulty level (for RISE, 1->4)
            numCorrect: 0, // The number of correctly solved training rounds (i.e. not including test or transfer)
            numCorrectPerLevel: 0,
            roundType: "train",
            layoutId: undefined,
            layout : undefined,
            score : undefined, // An integer of the curent score at any moment
            target: undefined,
            scoreTally : [], // an array of score as it changes
            playerIx: undefined, // The index of the current graph position
            playerNode: undefined, // An object reference to the current graph position
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
        // and track if they've collected a key (stored as false if not collected, and tool ID as string if has)
        this.hasKey = false;
    }

    /**
     * Instantiate a new round with a new layout file
     * @param {boolean} [restart=false] whether or not this round is a restart with the same layout file as the previous round
     * @returns {any}
     */
    newRound(restart=false){
        // Check this.round.numCorrectPerLevel and update the current level if necessary
        if (this.round.numCorrectPerLevel != 0 && this.round.numCorrectPerLevel % 5 == 0 && this.round.roundIndex <= 72 && this.level < 5){
            this.level += 1;
            this.round.numCorrectPerLevel = 0;
        }

        let newRound = {
            globalRoundNum: this.round.globalRoundNum + 1, // Always increment by 1
            roundIndex: restart ? this.round.roundIndex : this.round.roundIndex +1, // Keep the same if restart, else increment by 1
            attemptNum: restart ? this.round.attemptNum + 1 : 0, // Increment by 1 if restart, else reset to 0
            level: this.level,
            trainingNum: (game.isTraining() && !restart) ? this.round.trainingNum +1 : this.round.trainingNum,
            numCorrect: this.round.numCorrect,
            numCorrectPerLevel: this.round.numCorrectPerLevel,
            layoutId: restart ? this.round.layoutId : undefined,
            layout: restart ? this.round.layout : undefined,
            score : restart ? this.round.layout.scores.start : undefined, // An integer of the curent score at any moment
            target: restart ? this.round.layout.scores.goal : undefined,
            scoreTally : restart ? [this.round.layout.scores.start] : [], // an array of score as it changes
            playerIx: "start", // The index of the current graph position
            playerNode: undefined, // An object reference to the current graph position
            startTime: Date.now(),
            endTime: undefined,
            completed: false,
            resp: this.newEmptyResponse()
        }
        newRound['roundType'] = game.isTraining() ? "train" : (game.isTest() ? "test" : "transfer");
        // Set as current round
        this.round = newRound;
        // call after setting newRound so we can use the methods in Game, which rely on this round
        this.round.roundType = game.isTraining() ? "train" : (game.isTest() ? "test" : "transfer")
    }

    /**
     * Creates a new empty response object that would be added to wider round information
     * @returns {Object} object containing arrays for data storage
     */
    newEmptyResponse(){
        return {
            allowed: [],
            action: [],
            timestamp: [],
        }
    }

    /**
     * Update the current running response dictionary
     */
    saveResponse(action, allowed){
        this.round.resp.action.push(action)
        this.round.resp.allowed.push(allowed)
        this.round.resp.timestamp.push(Date.now())
    }

    /**
     * Save the current round by adding in extra information after the player has completed it - eg. completion time, if completed succesfully etc
     */
    saveRound(reachedGoal=false, isRestart=false){
        // Set endtime
        this.round.endTime = Date.now()
        // Set correctness from if this was restarted or skipped
        this.round.completed = reachedGoal;
        // Update rise tracker alongside
        if (reachedGoal){
            // Update num correct
            if (game.isTraining()) {
                this.round.numCorrectPerLevel += 1
            };
            this.round.numCorrect += 1;
            this.updateRiseTracking(this.round.roundIndex, this.round.endTime);
        } else {
            if (game.isTraining() && !isRestart) {
                this.round.numCorrectPerLevel = 0;
            }
        }
        
        // Store in this.data
        this.data.push(this.round);
        delete _.last(this.data).playerNode;
        // Trigger server-side saving:
        const data = {
            data: this.round,
            riseTracking: this.riseTracking
        }
        return game.saveToServer(data)
        .catch((e) => console.log(e))
    }

    /**
     * Updates the layout stored for the most recent data entries, fresh from receiving a layout from the server
     * @param {Object} layout - an object mapping layout ID to a string with the actual layout design in
     * @returns {any}
     */
    updateLayoutAndPosition(config){
        // update this.round
        this.round.layoutId = config.layoutId
        this.round.layout = config.layout
        // and update this.round with start and target scores
        this.round.score = config.layout.scores.start;
        this.round.scoreTally.push(config.layout.scores.start);
        this.round.target = config.layout.scores.goal;
        // and set the initial player index and start node reference
        this.round.playerIx = "start";
        this.round.playerNode = graph.nodes.start;
    }

    updatePlayerIndex(node){
        // Update the current player index and node
        this.round.playerIx = node.id;
        this.round.playerNode = node;
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

    computeNewScore(node){
        // Compute the new score when moving to a new node and update this.round.score and this.round.scoreTally
        this.round.score = node.action(this.round.score);
        this.round.scoreTally.push(this.round.score);
    }
}