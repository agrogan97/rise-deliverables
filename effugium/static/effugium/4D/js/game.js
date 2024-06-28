var assets = {
    imgs : {}
}

// Define a new Game control instance
game = new Game();
// Define a new Player instance
player = new Player();
// Get initial layoutId and launch game when promise resolves
game.createPlayer()
.then(() => {
    game.roundRequestHandler(game.getLayoutId())
})
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

/*
Still to do:
    - Run through main test points locally
    - Deploy to server and run through main test points overall
    
    - also still need some test levels from Mira
*/

// shapes
// colours