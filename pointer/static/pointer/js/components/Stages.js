function nextRound(isRestart=false){
    if (player.round.playerIndex != "start"){
        if (player.round.roundIndex >= (game.maxRounds-1) && (!isRestart || player.round.attemptNum == 2)){
            // end game
            player.saveRound().then(() => {
                endGame(true)
            })
            showEndGame = true;
            console.log(player.data)
            return
        }
        if (isRestart){
            player.newRound(isRestart)
            // rebuild graph
            graph.setConfig(player.round.layout)
            player.round.playerNode = graph.nodes.start
        } else {
            // get new round from server and load
            player.newRound(isRestart)
            // Listen for if new phase and show intersitial
            if (game.isNewPhase()){
                showPhase2Intersitial = true;
            }
            game.roundRequestHandler(game.getLayoutId())
            .then(() => {
                graph.setConfig(player.round.layout);
                player.round.playerNode = graph.nodes.start
            })
        }
    }
}