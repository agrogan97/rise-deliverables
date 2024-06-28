class Game{
    constructor(study='rise'){
        this.study = study;
        this.loadWebContent("instructions_rise_desktop")
        this.deviceType = this.detectDeviceType();
        // this.deviceType = "mobile"
        // An option to store a loaded layout here until it's permanently assigned to a round
        this.layoutStaging = undefined;
        // Parameters from the old version of roomworld
        this.parameters = {}
        this.defineParameters()

        this.preload();

        this.curriculum = {}
        _.range(0, 48).forEach(i => this.curriculum[i] = "training")
        _.range(48, 48+37).forEach(i => this.curriculum[i] = "test")
        _.range(48+37, 48+37+10).forEach(i => this.curriculum[i] = "transfer")
        this.trainRounds = [];
        this.testRounds = [];
        // Generate training rounds
        let A = 1; let B = 1;
        _.range(0, 16).forEach(i => {
            let nums = _.sampleSize(_.range(1, 50), 3)
            this.trainRounds.push([A, B, nums[0]])
            this.trainRounds.push([A, B, nums[1]])
            this.trainRounds.push([A, B, nums[2]])
            if (A == 4){ A = 1; B++; } else A++;
        })
        // Generate first 32 test rounds
        _.range(0, 16).forEach(i => {
            let diff = [_.random(1, 4), _.random(1, 4)]
            let nums = _.sampleSize(_.range(1, 50), 2)
            this.testRounds.push([...diff, nums[0]])
            this.testRounds.push([...diff, nums[1]])
        })
        // Last 5 test rounds are max difficulty
        _.sampleSize(_.range(1, 50), 5).forEach(n => this.testRounds.push([4, 4, n]))
        // And shuffle in the 5 extras
        this.testRounds = _.shuffle(this.testRounds);
        // Generate 10 transfer rounds
        this.transferRounds = _.sampleSize(_.shuffle(_.range(1, 150)), 10)

        this.parameters.testRounds = this.testRounds;
        this.parameters.transferRounds = this.transferRounds;
        this.parameters.trainRounds = this.trainRounds;
        this.parameters.curriculum = this.curriculum;

        let query = (new URL(window.location.href)).searchParams;
        this.curriculumType = query.get("curriculum"); 
        if (this.curriculumType == undefined) {
            this.curriculumType = _.sample(["concept", "strategy"])
        }
        this.parameters.curriculumType = this.curriculumType
        
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
            "source" : query.get("source")
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
        const URL = `${METAPARAMS.IP}effugium/v2/validate/`
        let data = {
                        "csrfmiddlewaretoken" : Cookies.get('csrftoken'),
                        id : params["id"] || undefined,
                        tag : params["tag"] || undefined,
                        iv : params["iv"] || undefined,
                        email : params["email"] || undefined,
                        gameParameters: this.parameters
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

    async createPlayer() {
        const params = Game.getUrlParams();
        const URL = `${METAPARAMS.IP}effugium/4d/createPlayer/`
        const response = await fetch(URL, {
            method: "POST",
            headers: {
                'X-CSRFToken': Cookies.get('csrftoken'),
                'Accept': 'application/json',
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify({
                id : params["id"] || undefined, 
                source: params["source"] || undefined,
                gameParameters : this.parameters
            })
        })
        return response
    }

    async registerComplete(){
        const URL = `${METAPARAMS.IP}effugium/v2/registerComplete/`
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
        const URL = `${METAPARAMS.IP}effugium/v2/save/`
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
            throw new Error(`An error has occured: ${response.status}`)
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
     * Uses javascript to dynamically change the static web content according to various conditions. Used to control the validation view, instructions for mobile/desktop, etc.
     */
    loadWebContent(type){
        const opts = {
            "instructions_rise_desktop" : "instructions_2324.html",
            "instructions_rise_mobile" : "instructions_2324_m.html",
            "validate" : "validate.html",
            "invalid" : "invalid_link.html",
            "end" : "end.html",
            "empty" : "empty.html"
        }
        // Check input type matches allowed
        if (!Object.keys(opts).includes(type)){throw new Error(`Web content type ${type} not recognised.`)}
        // Render HTML into div
        $("#bodyDiv").load(`${METAPARAMS.IP}${METAPARAMS.BASEPATH}html/${opts[type]}`)
    }

    /**
     * Request a layout from the server by ID. In a better version, we'd provide params that would allow us to filter by set rather than by specifics.
     * @param {any} id
     * @returns {Response}
     */
    async loadRoundById(id){
        const response = await fetch(`${METAPARAMS.IP}effugium/v2/getRoundById/4D/${id}/`, {
            method: 'GET',
            headers: {
                'X-CSRFToken': Cookies.get('csrftoken'),
                'Accept': 'application/json',
                'Content-Type': 'application/json' 
            }
        })

        if (!response.ok){
            throw new Error(`An error has occured: ${response.status}`)
        }

        return response
    }

    /**
     * A wrapper to handle loading a round from the server and storing it within the player class. Also catches any errors with the request.
     * @param {any} id the id of the layout file to load. Typically looks like 'r_1_1_1' or 'r_1_2_1' etc. - note that this would not include the .txt extension as previous modes may have
     */
    roundRequestHandler(id){
        return this.loadRoundById(id)
            .catch(error => {
                console.log(error.message); 
                this.loadWebContent("invalid")
            })
            .then(res => {return res.json()})
            .then((res) => {
                // Update the most recent entry in player.data with this layout
                player.updateLayout({layoutId: res.layoutId, layout: res.layout})
                // Cache layout to the browser, so if we need to reload we know the most recent one
                localStorage.setItem("layoutId", id);
            })
    }

    defineParameters(){
        // Randomly sample between shapes -> colours or vice versa
        [this.parameters.img_tool, this.parameters.img_pair] = _.sampleSize(['s', 'c'], 2);
        [this.parameters.img_tool, this.parameters.img_pair] = ['s', 'c']
        this.parameters.max_pairs = 12;
        this.parameters.max_shapes = 4
        this.parameters.max_img_n_1 = 18
        this.parameters.numcols = 15;
        this.parameters.numrows = 15;
        this.parameters.maxRounds = 95;
        this.parameters.intersitialLength = 600;

        // let s_order = Array.from(Array(this.parameters.max_img_n_1).keys()).slice(1);
        // s_order = _.shuffle(s_order);
        let s_order = _.shuffle(_.range(1, this.parameters.max_img_n_1+1))
      
        // let c_order = Array.from(Array(this.parameters.max_img_n_1).keys()).slice(1);
        // c_order = _.shuffle(s_order);
        let c_order = _.shuffle(_.range(1, this.parameters.max_img_n_1+1))

        if (this.parameters.img_tool=='s') {
            this.parameters.img_teleporter   = 's' + s_order[this.parameters.max_pairs+0]+'_c';
            this.parameters.img_key          = 's' + s_order[this.parameters.max_pairs+1]+'_c';
            this.parameters.img_door         = 's' + s_order[this.parameters.max_pairs+2]+'_c';
            this.parameters.img_catapult     = 's' + s_order[this.parameters.max_pairs+3]+'_c';
            this.parameters.img_lever        = 's' + s_order[this.parameters.max_pairs+4]+'_c';
            this.parameters.img_portal       = 's' + s_order[this.parameters.max_pairs+5]+'_c';
        
            this.parameters.img_teleporter_t = '_c'+ c_order[this.parameters.max_pairs+0];
            this.parameters.img_key_t        = '_c'+ c_order[this.parameters.max_pairs+1];
            this.parameters.img_door_t       = '_c'+ c_order[this.parameters.max_pairs+2];
            this.parameters.img_catapult_t   = '_c'+ c_order[this.parameters.max_pairs+3];
            this.parameters.img_lever_t      = '_c'+ c_order[this.parameters.max_pairs+4];
            this.parameters.img_portal_t     = '_c'+ c_order[this.parameters.max_pairs+5];
            
        
        } else {
            this.parameters.img_teleporter   = '_c' + c_order[this.parameters.max_pairs+0];
            this.parameters.img_key          = '_c' + c_order[this.parameters.max_pairs+1];
            this.parameters.img_door         = '_c' + c_order[this.parameters.max_pairs+2];
            this.parameters.img_catapult     = '_c' + c_order[this.parameters.max_pairs+3];
            this.parameters.img_lever        = '_c' + c_order[this.parameters.max_pairs+4];
            this.parameters.img_portal       = '_c' + c_order[this.parameters.max_pairs+5];
        
            this.parameters.img_teleporter_t = 's'+ s_order[this.parameters.max_pairs+0] +'_c';
            this.parameters.img_key_t        = 's'+ s_order[this.parameters.max_pairs+1] +'_c';
            this.parameters.img_door_t       = 's'+ s_order[this.parameters.max_pairs+2] +'_c';
            this.parameters.img_catapult_t   = 's'+ s_order[this.parameters.max_pairs+3] +'_c';
            this.parameters.img_lever_t      = 's'+ s_order[this.parameters.max_pairs+4] +'_c';
            this.parameters.img_portal_t     = 's'+ s_order[this.parameters.max_pairs+5] +'_c';
        }

        this.parameters.s_order = s_order;
        this.parameters.c_order = c_order;

        this.parameters.shape_teleporter = s_order[this.parameters.max_pairs+0];
        this.parameters.shape_key        = s_order[this.parameters.max_pairs+1];
        this.parameters.shape_door       = s_order[this.parameters.max_pairs+2];
        this.parameters.shape_catapult   = s_order[this.parameters.max_pairs+3];
        this.parameters.shape_lever      = s_order[this.parameters.max_pairs+4];
        this.parameters.shape_portal     = s_order[this.parameters.max_pairs+5];

        this.parameters.color_teleporter = c_order[this.parameters.max_pairs+0];
        this.parameters.color_key        = c_order[this.parameters.max_pairs+1];
        this.parameters.color_door       = c_order[this.parameters.max_pairs+2];
        this.parameters.color_catapult   = c_order[this.parameters.max_pairs+3];
        this.parameters.color_lever      = c_order[this.parameters.max_pairs+4];
        this.parameters.color_portal     = c_order[this.parameters.max_pairs+5];

        // this.parameters.levels_def = {};
        // this.parameters.levels_def[1] = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60];
        // this.parameters.levels_def[2] = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55];
        // this.parameters.levels_def[3] = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50];
        // this.parameters.levels_def[4] = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45];
        // this.parameters.levels_def[5] = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40];

        // this.parameters.levels_test       = _.shuffle([1,2,3,4,5,6,7,8,9,10,11,12]);
        // this.parameters.levels_transfer   = _.shuffle([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]);
    }

    /**
     * Restore game parameters from the server, ensuring participants keep the same levels, colours, shapes etc.
     * @param {Object} params A copy of the game parameters object that will replace the default instantiated one
     */
    restoreParameters(params){
        this.parameters = params;
        this.testRounds = params.testRounds;
        this.transferRounds = params.transferRounds;
        this.trainRounds = params.trainRounds;
        this.curriculum = params.curriculum;
        console.log("Game parameters restored.")
    }

    /**
     * Handle the logic to restore the player game state when they reload the game - includes caching from server and from localStorage
     * @returns {any}
     */
    handleGameReload(){
        // The most recent layout is stored in the cache, along with the number of attempts they were on the last time a layout was loaded
        let lastRoundLayoutId = localStorage.getItem("layoutId");
        let lastAttemptNum = localStorage.getItem("attemptNum")
        if (lastRoundLayoutId != player.round.layoutId && !lastRoundLayoutId.startsWith("test")){
            // we have no server-side record of this round, cos they skipped before it was saved
            // so let's make a round, then save it, then make a new round
            player.newRound()
            player.round.layoutId = lastRoundLayoutId;
            player.saveRound(false)
            // Now the server side matches the client-side in terms of most recent round
            player.newRound(true)
            player.round.fromReload = true;
            if (this.isTest() || lastRoundLayoutId.startsWith("test")){
                return this.getLayoutId();
            } else {
                return lastRoundLayoutId;
            }
            
        } 
        // If out of restarts
        if (lastAttemptNum >= 2 || this.isTest() || lastRoundLayoutId.startsWith("test")){
            // Create an entry for the burnt round on the server
            if (lastRoundLayoutId.startsWith("test")){
                // Don't record a restart if it's a test, just skip straight through it
                player.newRound()
            } else {
                player.newRound(true)
            }
            player.round.layoutId = lastRoundLayoutId;
            player.saveRound(false)
            // in this condition the round is always skipped
            player.newRound()
            player.round.fromReload = true;
            return this.getLayoutId()
        } else {
            // Create an entry for the burnt round on the server
            player.newRound(true)
            player.round.layoutId = lastRoundLayoutId;
            player.saveRound(false)
            // And restart the current round
            player.newRound(true)
            player.round.fromReload = true;
            return lastRoundLayoutId
        }
    }

    preload(){

        const loadImg = (img) => {
            let newImg = new Image();
            newImg.src = img;
            return newImg;
        } 

        const PRE = METAPARAMS.IP + METAPARAMS.BASEPATH + "imgs/"
        assets.imgs["f_success"] = loadImg(`${PRE}f_success.png`)
        assets.imgs["f_restart"] = loadImg(`${PRE}f_restart.png`)
        assets.imgs["f_noleft"] = loadImg(`${PRE}f_noleft.png`)
        assets.imgs["f_new"] = loadImg(`${PRE}f_new.png`)
        assets.imgs["challenge"] = loadImg(`${PRE}challenge.png`)
        assets.imgs["char"] = loadImg(`${PRE}char.png`)

        assets.imgs["button_l"] = loadImg(`${PRE}button_l.png`)
        assets.imgs["button_r"] = loadImg(`${PRE}button_r.png`)
        assets.imgs["button_u"] = loadImg(`${PRE}button_u.png`)
        assets.imgs["button_d"] = loadImg(`${PRE}button_d.png`)
        assets.imgs["button_l_clicked"] = loadImg(`${PRE}button_l_clicked.png`)
        assets.imgs["button_r_clicked"] = loadImg(`${PRE}button_r_clicked.png`)
        assets.imgs["button_u_clicked"] = loadImg(`${PRE}button_u_clicked.png`)
        assets.imgs["button_d_clicked"] = loadImg(`${PRE}button_d_clicked.png`)

        // Shapes
        for (let s=1; s<19; s++){
            for (let c=1; c<19; c++){
                assets.imgs[`s${s}_c${c}`] = loadImg(`${PRE}shapes/s${s}_c${c}.png`)
            }
        }
    }

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
            return `level-c${this.testRounds[player.round.roundIndex-48][c]}-s${this.testRounds[player.round.roundIndex-48][s]}_${this.testRounds[player.round.roundIndex-48][2]}`
        } else if (this.isTransfer()){
            // load a transfer
            console.log(`transfer_${this.transferRounds[player.round.roundIndex-85]}`)
            return `transfer_${this.transferRounds[player.round.roundIndex-85]}`;
        } else {
            throw new Error(`Error generating a layout for round ${player.round.roundIndex}`);
        }
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

    /**
     * Main launch point for the game.
     */
    launch(){
        // And update the start time, since it was instantiated while the player may have been reading the instructions
        player.round.startTime = Date.now();

        initialiseGrid(player.round.layout);
    }
}