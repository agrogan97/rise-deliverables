var assets = {
    imgs : {}
}

// Define a new Game control instance
game = new Game();
// Define a new Player instance
player = new Player();

// -- Validate player IP:
responseContents = undefined; 
game.validateParticipant()
    .then(async x => {
        responseContents = await x.json();
        return x
    })
    .catch(e => {
        game.loadWebContent("invalid")
    })
    .then(x => {
        if (x.status == 200){
            // Load appropriate HTML for device type, from game.deviceType
            if (game.deviceType == "mobile" || game.deviceType == "largeMobile"){
                // load mobile instructions
                game.loadWebContent("instructions_rise_mobile");
            } else {
                // load desktop
                game.loadWebContent("instructions_rise_desktop");
            }
        } else {
            console.log("Invalid URL")
            // Load unable to validate
            game.loadWebContent("invalid")
            // TODO
            // ... If invalid, don't attempt to load further content
        }
    })
    .then(() => {
        let layoutId = undefined;
        if (responseContents != undefined && responseContents != "New User" && !_.isEqual(responseContents.data, {})){
            player.data = responseContents.data
            player.riseTracking = responseContents.riseTracking
            player.round = _.last(player.data)
            player.level = player.round.level;
            game.restoreParameters(responseContents.gameParameters);
            // .replace(/'/g, '"')
            if (player.round.roundIndex >= 91 && player.round.attemptNum >=1 ){
                game.loadWebContent("end");
                game.registerComplete()
                    .catch(res => console.log("Error in registering complete:", res.status))
                    .then(res => {console.log("Roomworld Complete", res.status)})
                    
            }
            layoutId = game.handleGameReload();
        } else {
            layoutId = game.getLayoutId()
        }
        // console.log(player.round.roundIndex, player.round.attemptNum)
        game.roundRequestHandler(layoutId)
        .then(() => {
            // if(player.round.roundIndex == 91 && player.round.attemptNum == 2){
            //     game.loadWebContent("end");
            //     game.registerComplete()
            // }
            document.getElementById("startButton").addEventListener("click", e => {
                game.launch();
                game.loadWebContent("empty")
                document.addEventListener("keydown", (e) => {
                    const clickMap = {
                        "ArrowUp" : "up",
                        "ArrowDown" : "down",
                        "ArrowLeft" : "left",
                        "ArrowRight" : "right"
                    }
                    if (Object.keys(clickMap).includes(e.key) && !e.repeat){handleMovement(clickMap[e.key])}
                })
            })
        })
    })