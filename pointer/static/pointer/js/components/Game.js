class Game{
    constructor(study='rise'){
        this.study = study;
        this.deviceType = this.detectDeviceType();
        this.maxRounds = 95

        // Create a dict with keys representing special round indices
        // this.curriculum = {}
        // _.range(0, 72/6).map((m) => (5 + m*6)).forEach(i => this.curriculum[i] = 'test'); // specifies how tests are laid out
        // _.range(72, 92).forEach(i => this.curriculum[i] = "transfer") // specifies when transfers come in

        // // We create the ordering in advance so we can iterate through without any repeats
        // this.testRounds = _.shuffle(_.range(1, 12+1))
        // this.transferRounds = _.sampleSize(_.range(1, 500), 25)
        // this.trainRounds = {
        //     1: _.sampleSize(_.range(1, 500), 75),
        //     2: _.sampleSize(_.range(1, 500), 75),
        //     3: _.sampleSize(_.range(1, 500), 75),
        //     4: _.sampleSize(_.range(1, 500), 75),
        //     5: _.sampleSize(_.range(1, 500), 75),
        // }

        // -- Uncomment for when we have the new Pointer round JSONs --
        this.curriculum = {}
        _.range(0, 48).forEach(i => this.curriculum[i] = "training")
        _.range(48, 48+37).forEach(i => this.curriculum[i] = "test")
        _.range(48+37, 48+37+10).forEach(i => this.curriculum[i] = "transfer")
        this.trainRounds = [];
        this.testRounds = [];
        // Generate training rounds
        let A = 1; let B = 1;
        _.range(0, 16).forEach(i => {
            // First add training rounds
            let nums = _.sampleSize(_.range(1, 50), 3)
            this.trainRounds.push([A, B, nums[0]])
            this.trainRounds.push([A, B, nums[1]])
            this.trainRounds.push([A, B, nums[2]])
            // Then add test rounds
            let testRounds = _.sampleSize(_.range(1, 50), 2)
            this.testRounds.push([A, B, testRounds[0]])
            this.testRounds.push([A, B, testRounds[1]])
            if (A == 4){ A = 1; B++; } else A++;
        })
        // Last 5 test rounds are max difficulty
        _.sampleSize(_.range(1, 50), 5).forEach(n => this.testRounds.push([4, 4, n]))
        // And shuffle in the 5 extras
        this.testRounds = _.shuffle(this.testRounds);
        // Generate 10 transfer rounds
        this.transferRounds = _.sampleSize(_.shuffle(_.range(1, 150)), 10)

        // Randomly choose concept vs. strategy or read from URL
        let query = (new URL(window.location.href)).searchParams;
        this.curriculumType = query.get("curriculum"); 
        // if (this.curriculumType == undefined) {
        //     this.curriculumType = _.sample(["concept", "strategy"])
        // }
        if (this.curriculumType == undefined) {
            this.curriculumType = "concept"
            throw new Error("No curriculum type provided")
        }
        console.log(`Using curriculum: ${this.curriculumType}`)
    }

    /**
    * Static method that reads the URL for specific parameters and returns an object containing these or undefined.
    * @returns {Object} an object of any/all of the specific parameters, with any not found set as undefined
    */
    static getUrlParams(){
        let query = (new URL(window.location.href)).searchParams;
        return {
            "id" : query.get("id"),
            "tag" : query.get("tag"),
            "iv" : query.get("iv"),
            "email" : query.get("email"),
            "DEBUG" : query.get("DEBUG"),
            "source" : query.get("source").replace("/", ""),
            "curriculumType" : query.get("curriculum").replace("/", "") || undefined,
            "session_id" : query.get("session_id").replace("/", "") || undefined,
            "study_id" : query.get("study_id").replace("/", "") || undefined
        }
    }

    /**
    * Validates the client-side URL by confirming this is a real RISE participant
    * @returns {Promise}
    */
    async validateParticipant(){
        // Check if running in DEBUG mode
        const params = Game.getUrlParams();
        const debug = (params.DEBUG === true);
        if (debug == true){
            return new Promise(true)
        }
        // const URL = "https://apply.risefortheworld.org/verify_roomworld"
        const URL = `${METAPARAMS.IP}effugium/validate/`
        let data = {
                        "csrfmiddlewaretoken" : Cookies.get('csrftoken'),
                        id : params["id"] || undefined,
                        curriculum : this.curriculumType || undefined
                    }

        // Submit a validation request to RISE via server
        const response = await fetch(URL, {
            method: "POST",
            headers: {
                'X-CSRFToken': Cookies.get('csrftoken'),
                'Accept': 'application/json',
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify(data)
        })

        // if (!response.ok){
        //     throw new Error(`An error has occured: ${response.status}`)
        // }

        return response
    }

    async registerComplete(){
        const URL = `${METAPARAMS.IP}effugium/registerComplete/`
        let data = Game.getUrlParams()
        const response = await fetch(URL, {
            method: "POST",
            headers: {
                'X-CSRFToken': Cookies.get('csrftoken'),
                'Accept': 'application/json',
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify(data)
        })

        return response
    }
 
    /**
     * Save the current game state to the server
     * @param {any} data All generated game data from the `player` class. Includes round and layout information, layout files, completions, and response-level data.
     * @returns {Promise} promise containing the response
     */
    async saveToServer(data){
        const URL = `${METAPARAMS.IP}pointer/saveRound/`
        const sendData = {...data, ...Game.getUrlParams()}
        const response = await fetch(URL, {
            method: "POST",
            headers: {
                'X-CSRFToken': Cookies.get('csrftoken'),
                'Accept': 'application/json',
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify(sendData)
        })

        if (!response.ok){
            throw new Error(`An error has occured: ${response.status}, ${response.message}`)
        }

        return response
    }

    /**
     * Detects the type of device the client is using, and categorises into one of "desktop", "mobile", or "largeMobile"
     * @returns {string} device type, or if multiple found, an array of device types as strings
     */
    detectDeviceType() {
        const opts =  {
            "desktop" : !/Mobi/i.test(navigator.userAgent),
            "mobile" : /Mobi/i.test(navigator.userAgent) || navigator.maxTouchPoints > 0,
            "largeMobile" : /iPad/.test(navigator.userAgent)
        }
        const isTrue = Object.keys(opts).filter(i => (opts[i] == true))
        if (isTrue.length > 1){
            return isTrue[0]
        }
        else return isTrue
    }

    /**
     * Request a layout from the server by ID. In a better version, we'd provide params that would allow us to filter by set rather than by specifics.
     * @param {any} id
     * @returns {Response}
     */
    async loadRoundById(id){
        const tries = 2;
        let errors = [];
        for (let i=0; i< tries; i++) {
            const response = await fetch(`${METAPARAMS.IP}pointer/load/${id}/`, {
                method: 'GET',
                headers: {
                    'X-CSRFToken': Cookies.get('csrftoken'),
                    'Accept': 'application/json',
                    'Content-Type': 'application/json' 
                }
            })
    
            if (!response.ok){
                throw new Error(`An error has occured: ${response.status}, ${response.message}`)
            }
    
            try {
                return response
            } catch (error) {
                errors.push(error)
            }
        }
        
        throw errors;

    }

    /**
     * Parse and edit some of the fields in the layout file we receive from the server to remove any inconsistencies or potential bugs
     * @param {any} level
     * @returns {any}
     */
    parseLevel(level){
        level.nodes = JSON.parse(level.nodes);
        level.scores = JSON.parse(level.scores);
        // We'll apply some patching to the level configs here too:
        level.nodes.forEach(n => {
            if (_.isEqual([], n.concept)) {n.concept = n.id}
        })
        // Get the value used in the nodes.X.connections that indicates endpoint
        level.endIndex = level.nodes.length.toString()
        // iterate through the connections for each node and replace endIndex with "end"
        level.nodes.forEach((node, nodeIndex) => {
            node.connections.forEach((conn, connIndex) => {
                if (conn == level.endIndex){
                    level.nodes[nodeIndex].connections[connIndex] = "end"
                }
            })
        })

        return level
    }

    /**
     * A wrapper to handle loading a round from the server and storing it within the player class. Also catches any errors with the request.
     * @param {any} id the id of the layout file to load. Typically looks like 'r_1_1_1' or 'r_1_2_1' etc. - note that this would not include the .txt extension as previous modes may have
     */
    roundRequestHandler(id){
        console.log(`Layout ${id}`)
        loadingRound = true;
        return this.loadRoundById(id)
            .catch(error => console.log(error.message))
            .then(res => {return res.json()}) // TODO We currently get no feedback if the layout can't load - need to handle the error properly
            .then((res) => {
                let newLayout = this.parseLevel(res)
                // Update the most recent entry in player.data with this layout
                player.updateLayoutAndPosition({layoutId: newLayout.givenName, layout: newLayout})
                loadingRound = false;
            })
    }

    // -- 3D version --
    // getLayoutId(){
    //     // Curriculum structure - uses current round index and player level to load a new round from th e server
    //     // The generation logic here is just a reworking of what's in V.1, and not necessarily the most sensible way of doing it
    //     // if training
    //     if (this.isTraining()){
    //         return `level_${player.round.level}_${this.trainRounds[player.level][player.round.trainingNum]}`
    //     } else if (this.curriculum[player.round.roundIndex] == "test"){
    //         // load a test
    //         return `level_test_${this.testRounds[Object.keys(this.curriculum).indexOf(player.round.roundIndex.toString())]}`; // i.e. the index of the current round in the curriculum (which equates to test round number)
    //     } else if (this.curriculum[player.round.roundIndex] == "transfer"){
    //         // load a transfer
    //         return `level_transfer_${this.transferRounds[player.round.roundIndex-71]}`;
    //     } else {
    //         throw new Error(`Error generating a layout for round ${player.round.roundIndex}`);
    //     }
    // }

    // -- 4D version --
    getLayoutId(){
        // Curriculum structure - uses current round index and player level to load a new round from th e server
        // The generation logic here is just a reworking of what's in V.1, and not necessarily the most sensible way of doing it
        // if training
        // Ordering is determined by curriculumType in URL
        let c, s = undefined;
        if (this.curriculumType == "concept"){
            c = 0, s = 1;
        } else if (this.curriculumType == "strategy"){
            c = 1, s = 0;
        } else {
            throw new Error(`Curriculum type ${this.curriculumType} not recognised`)
        }
        if (this.isTraining()){
            return `level-c${this.trainRounds[player.round.roundIndex][c]}-s${this.trainRounds[player.round.roundIndex][s]}_${this.trainRounds[player.round.roundIndex][2]}`
        } else if (this.isTest()){
            // load a test
            // and change `level` to 'test` when we get the new ones from Mira
            return `test-c${this.testRounds[player.round.roundIndex-48][c]}-s${this.testRounds[player.round.roundIndex-48][s]}_${this.testRounds[player.round.roundIndex-48][2]}`
        } else if (this.isTransfer()){
            // load a transfer
            return `transfer_${this.transferRounds[player.round.roundIndex-85]}`;
        } else {
            throw new Error(`Error generating a layout for round ${player.round.roundIndex}`);
        }
    }

    /**
     * Request new entry created in DB for a new player. The backend will generate a UID for the player and return this UID to client-side so it can be referenced when saving data. Note that this is a static method, and we would call it during the tutorial to then pass it via URL params to the main game.
     * @param {any} endpoint The HTTP endpoint on the server 
     * @returns {Promise} The promise returned by fetch. For contents see server documentation.
     */
    static async newPlayer(data){
        // Tell the server we have a new player
        let query = (new URL(window.location.href)).searchParams;
        let source = query.get("source")
        return fetch(`${METAPARAMS.IP}pointer/newPlayer/`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-CSRFToken': Cookies.get('csrftoken'),
            },
            body: JSON.stringify(data)
        })
            .catch(response => {
                console.log(`HTTP Error: ${response.status}`)
                return response
            })
    }

    /**
     * Ask the server if previous game settings have been created for this player. If not then send ones to server.
     * @returns {any}
     */
    static async getGameSettings(){
        let uid = Game.getUrlParams()["id"] || undefined
        return fetch(`${METAPARAMS.IP}pointer/settings/${uid}/`, {
            method : 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-CSRFToken': Cookies.get('csrftoken'),
            },
        })
    }

    async saveGameSettings(){
        // Get URL params dict from static method
        const params = Game.getUrlParams()
        let gameSettings = {
            "mapping" : this.roomImages,
            "curriculumType" : params["curriculumType"],
            "session_id" : params["session_id"],
            "study_id" : params["study_id"],
        }
        return fetch(`${METAPARAMS.IP}pointer/settings/${params["id"]}/`, {
            method : 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-CSRFToken': Cookies.get('csrftoken'),
            },
            body: JSON.stringify({"uid" : params["id"], "gameSettings" : gameSettings})
        })
    }

    /**
     * Another helper function just to quickly check if the current round is a training round
     */
    isTraining(){
        return this.curriculum[player.round.roundIndex] == "training";
    }

    isTransfer(){
        return this.curriculum[player.round.roundIndex] == "transfer"
    }

    isTest(){
        return this.curriculum[player.round.roundIndex] == "test"
    }

    // Detects if about to start test phase
    isNewPhase(){
        return this.curriculum[player.round.roundIndex-1] == "training" && this.isTest()
    }

    /**
     * Map images from assets.images to concepts
     */
    createImageMappings(loaded){
        // Define the image mappings to be used by sampling without replacement from assets.rooms and splitting into 2 arrays
        if (loaded != undefined && loaded != false){
            this.roomImages = loaded.mapping
        } else {
            this.roomImages = _.chunk(_.sampleSize(Object.keys(assets.rooms), 10), 5)
        }
        this.roomImageOptions = this.roomImages[0].map(i => assets.rooms[i])
        this.roomImageOptionsTransfer = this.roomImages[1].map(i => assets.rooms[i])
    }

    /**
     * Main launch point for the game.
     */
    launch(){
        // And update the start time, since it was instantiated while the player may have been reading the instructions
        player.round.startTime = Date.now();
        this.hasSettings = undefined;
        Game.getGameSettings()
            .then(async res => {this.hasSettings = await res.json()})
            .then(() => {
                console.log(`Game settings? ${this.hasSettings.success}`)
                if (this.hasSettings.success){
                    this.createImageMappings(this.hasSettings.gameSettings)
                } else {
                    this.createImageMappings()
                    this.saveGameSettings();
                }
                console.log("Using room images", this.roomImages);
            })
            .then(() => {
                this.roundRequestHandler(this.getLayoutId())
                .then(() => {
                    graph.setConfig(player.round.layout);
                    player.round.playerNode = graph.nodes.start
                })
            })
    }
}