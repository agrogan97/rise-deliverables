async function nextRound(isRestart=false){
    if (player.round.roundIndex >= 91 && (!isRestart || player.round.attemptNum == 2)){
        board.paper.object.remove();
        board.paper.object.clear();
        board = {}
        paper = {}
        game.registerComplete()
            .catch(res => console.log("Error in registering complete:", res.status))
            .then(res => {console.log("Roomworld Complete", res.status)})
            game.loadWebContent("end");
    }
    if (isRestart){
        board.paper.object.clear();
        // reload current level
        player.newRound(isRestart)
        // clearGrid()
        initialiseGrid(player.round.layout)
        // drawOnGrid(game.parameters.numrows, game.parameters.numcols, player.round.layout)
    } else {
        board.paper.object.clear();
        // Create new round storage
        player.newRound()
        // Get a new layout from the server
        return game.roundRequestHandler(game.getLayoutId())
            .then(() => {
                console.log(`Round: ${player.round.roundIndex} -- Layout: ${player.round.layoutId}`)
                // clearGrid();
                initialiseGrid(player.round.layout)
        })
    }
}