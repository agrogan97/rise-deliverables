var cwidth = window.innerWidth
var cheight = window.innerHeight
var assets = {}
var STATICBASE = `${IP_BASE}static/pointer/imgs/`
var STATICBASEFONTS = `${IP_BASE}static/pointer/fonts/`
var BASE = IP_BASE

var initWidth = window.screen.availWidth;
var initHeight = window.screen.availHeight;
var numRounds = 1;

// Game objects
var grid;
var graph;
var intersitial;
var showIntersitial;
var intersitialDuration = 0;
var showEndGame = false;
var titleLogo;
var restartLogo;
var skipLogo;
var loadingRound = false;
var showPhase2Intersitial = false;

var roomImageOptions;
var roomImageOptionsTransfer;
// Storage
var game;

// assets
var assets = {"graphics" : {}, "fonts" : {}, "rooms" : {}}

var isFullScreen = false;
var isShowingFullScreenWarning = false;

var blockLoop = false;

/**
 * p5js preloader for loading static files (imgs, gifs, and fonts) in advance. Files are stored in global variable `assets`. See https://p5js.org/reference/#/p5/loadImage for more information.
 */
function preload() {
    assets["graphics"]["arrow"] = loadImage(STATICBASE + 'arrow_rsz.png')
    // Rooms
    assets["rooms"]["room_red"] = loadImage(STATICBASE + 'rooms/room_red.png')
    assets["rooms"]["room_green"] = loadImage(STATICBASE + 'rooms/room_green.png')
    assets["rooms"]["room_blue"] = loadImage(STATICBASE + 'rooms/room_blue.png')
    assets["rooms"]["room_orange"] = loadImage(STATICBASE + 'rooms/room_orange.png')
    assets["rooms"]["room_6"] = loadImage(STATICBASE + 'rooms/Pointer_6.png')
    assets["rooms"]["room_7"] = loadImage(STATICBASE + 'rooms/Pointer_7.png')
    assets["rooms"]["room_8"] = loadImage(STATICBASE + 'rooms/Pointer_8.png')
    assets["rooms"]["room_9"] = loadImage(STATICBASE + 'rooms/Pointer_logo1.png')
    assets["rooms"]["room_10"] = loadImage(STATICBASE + 'rooms/Pointer_logo2.png')
    assets["rooms"]["room_11"] = loadImage(STATICBASE + 'rooms/Pointer_logo3.png')
    assets["rooms"]["room_12"] = loadImage(STATICBASE + 'rooms/Pointer_logo4.png')
    assets["rooms"]["room_13"] = loadImage(STATICBASE + 'rooms/Pointer_logo5.png')

    // character
    assets["graphics"]["character"] = loadImage(STATICBASE + 'character.png')
    // Logos and Intersitials
    assets["graphics"]["intersitial"] = loadImage(STATICBASE + 'roundComplete_60p.png')
    assets["graphics"]["logo"] = loadImage(STATICBASE + 'logoSmall.png')
    assets["graphics"]["restartLogo"] = loadImage(STATICBASE + 'restartLogo.png')
    assets["graphics"]["skipLogo"] = loadImage(STATICBASE + 'skipLogo.png')
    assets["graphics"]["dropoff"] = loadImage(STATICBASE + 'dropoff.png')
    assets["graphics"]["dropoff_grey"] = loadImage(STATICBASE + 'dropoff_grey.png')

    // Fonts
    assets["fonts"]["kalam-bold"] = loadFont(STATICBASEFONTS + "Kalam-Bold.ttf");
    assets["fonts"]["kalam-light"] = loadFont(STATICBASEFONTS + "Kalam-Light.ttf");
    assets["fonts"]["kalam-regular"] = loadFont(STATICBASEFONTS + "Kalam-Regular.ttf");
}

/**
 * p5js setup function for defining main components in the game, setting event listeners, and setting global variables. The game is kicked off by calling start() at the end of this function.
 */
function setup() {
    var canvas = createCanvas(window.innerWidth, window.innerHeight);
    canvas.parent("gameCanvas");
    frameRate(60);
    rectMode(CORNER);
    imageMode(CENTER);
    ellipseMode(CENTER);

    document.getElementById("gameCanvas").addEventListener("click", (e) => {
        if (!isFullScreen){
            requestFullScreen(document.documentElement)
            setTimeout(() => {
                isShowingFullScreenWarning = false;
                isFullScreen = true;
            }, 2000);
            
        }
    })

    game = new Game();
    game.createImageMappings();
    // grid = new Grid(15, 40);
    // let roomImages = _.chunk(_.sampleSize(assets.rooms, 10), 5);
    // roomImageOptions = roomImages[0];
    // roomImageOptionsTransfer = roomImages[1];
    graph = new Graph(20, 30);
    player = new Player();
    progressBar = new ProgressBar(0, 5);
    intersitial = new p5Image(assets["graphics"]["intersitial"], 50, 50)
    endGameIntersitial = new p5Image(assets["graphics"]["intersitial"], 50, 50)
    showIntersitial = false
    titleLogo = new p5Image(assets["graphics"]["logo"], 88, 8.5);
    restartLogo = new p5Image(assets["graphics"]["restartLogo"], 83.5,  25)
    skipLogo = new p5Image(assets["graphics"]["skipLogo"], 94,  25)

    
    // Vanilla touch event listener
    document.getElementById("gameCanvas").addEventListener("touchstart", (e) => {
        handleTouch(e.touches[0].clientX, e.touches[0].clientY)
    })

    document.getElementById("gameCanvas").addEventListener("click", (e) => {
        handleTouch(e.clientX, e.clientY)
    })

    document.getElementById("gameCanvas").addEventListener("click", (e) => {
        handleButtons(e.clientX, e.clientY)
    })

    // window.onblur = () => {
    //     endGame(false)
    // } 

    game.launch();
    }

/**
 * Event fired when a window resize is detected. See https://p5js.org/reference/#/p5/windowResized for more information.
 */
function windowResized(){
    try {
        resizeCanvas(windowWidth, windowHeight);
        graph.update();
        progressBar.update();
        titleLogo.update();
        restartLogo.update();
        skipLogo.update();
    } catch (error) {}
};

function endGame(ki){
        let uid = Game.getUrlParams()["id"]
        window.location.href = `${METAPARAMS.IP}pointer/end/?ki=${ki.toString()}&id=${uid.toString()}`;
        showEndGame = true
        blockLoop = true
}

function detectFullscreen(){
    return (document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement);
}

function requestFullScreen(element) {
    // Supports most browsers and their versions.
    var requestMethod = element.requestFullScreen || element.webkitRequestFullScreen || element.mozRequestFullScreen || element.msRequestFullScreen;

    if (requestMethod) { // Native full screen.
        requestMethod.call(element);
    } else if (typeof window.ActiveXObject !== "undefined") { // Older IE.
        var wscript = new ActiveXObject("WScript.Shell");
        if (wscript !== null) {
            wscript.SendKeys("{F11}");
        }
    }
}

/**
 * Callback that fires when a touch event is detected, and handles logic for determining what the proposed action is and if it's allowed. Contains much of the top-level core game flow logic.
 * @param {any} X X-coordinate of mouse click in pixels
 * @param {any} Y Y-coordiplayer.roundnate of mouse click in pixels
 */
function handleTouch(X, Y){
    // Block movements on intersitial
    if (!isFullScreen) {return}
    if (isShowingFullScreenWarning){return}
    if (loadingRound){return}
    if (showPhase2Intersitial){
        showPhase2Intersitial = false;
        return;
    }
    const clickP = createVector(X, Y);
    // Check which room was clicked
    const nodeClicked = graph.nodes.nodeList.filter(n => clickP.dist(n.position) < n.clickRadius);
    if (nodeClicked.length > 0){
        let distances = nodeClicked.map(n => clickP.dist(n.position))
        let node = nodeClicked[distances.indexOf(_.min(distances))];
        // Check if clicked node is connected to current node
        if (player.round.playerNode.connections.includes(node.id) && (node.row > player.round.playerNode.row) && (!showIntersitial)){
            progressBar.clearArrow();
            if (isShowingFullScreenWarning){return}
            // Show transition arrow
            progressBar.showTransitionArrow(player.round.score, node.action(player.round.score))
            // Check if attempting to end game
            if (node.id == "end" && (player.round.score == player.round.target)){
                player.saveRound(true).then(() => {
                    intersitialDuration = millis()
                    showIntersitial = true;
                    nextRound(false);
                })
            } else if (node.id == "end" && (player.round.score != player.round.target)){
                // Do nothing -- possibly record attempted click?
                player.saveResponse(`click_${node.id}`, false)
            } else {
                // Move normally
                let preMoveNode = player.round.playerNode;
                preMoveNode.setToDefault();
                player.computeNewScore(node)
                // Set current node as active
                node.makePlayerNode()
                player.saveResponse(`click_${node.id}`, true)
            }
            // Check if the end node is an option, and if score matches target light up node
            if ((player.round.score == player.round.target)){
                // Light up the end state
                graph.nodes.end.concept = "end_complete";
                graph.nodes.end.updateImage()
            } else {
                graph.nodes.end.concept = "end";
                graph.nodes.end.updateImage()
            }
        } else {
            // Record click but do nothing
            player.saveResponse(`click_${node.id}`, false)
        }
    } else {
        // Record if clicking randomly on the screen?
        // ...
    }
}

/**
 * Callback that fires if a button click event is detected. NB: buttons refer to the `restart` and `skip` buttons in the game.
 * @param {any} X X-coordinate of mouse click in pixels
 * @param {any} Y Y-coordinate of mouse click in pixels
 */
function handleButtons(X, Y){
    /*
    Listen for skip and restart button clicks and run callback the corresponding functions
    */

    const clickP = createVector(X, Y);
    const rsLogoPx = createVector(width*restartLogo.position.x/100, height*restartLogo.position.y/100);
    const skipLogoPx = createVector(width*skipLogo.position.x/100, height*skipLogo.position.y/100)
    if (rsLogoPx.dist(clickP) <= restartLogo.img.width*0.5){
        // Returning to block restart button - remove return to allow restarting
        return
        progressBar.clearArrow();
        if (player.round.playerIx != "start" && player.round.attemptNum < 2 && !game.isTest()){
            // If restart
            if(game.isTest()){
                // gets stuck skipping tests for whatever reason
                player.saveResponse(`skip`, true)
                player.saveRound(false);
                nextRound(false);
            }
            player.saveResponse(`restart`, true)
            player.saveRound(false, true)
            nextRound(true)
        }
    } else if (skipLogoPx.dist(clickP) <= skipLogo.img.width*0.5){
        progressBar.clearArrow();
        // If skip
        if (player.round.playerIx != "start"){
            player.saveResponse(`skip`, true)
            player.saveRound(false).then(() => {
                if (player.round.roundIndex != 95) {
                    nextRound(false);
                }
            })   
        }
        
    }
}

/**
 * The primary draw loop. Contains calls to all sub-component draw loops and renders all content to screen.
 */
function draw() {

    if (blockLoop) {return}

    if (isFullScreen){
        if (detectFullscreen() == undefined){
            isFullScreen = false
            setTimeout(() => {
                endGame(false)
                isFullScreen = false;
            }, 1000)
        }
    }

    clear();
    background("rgb(239, 214, 172");
    // background("rgba(113, 127, 150, 0.8)")
    // intersitial timer - stop displaying after 1500ms
    if (!isFullScreen){
        textSize(Math.floor(0.01484375*width))
        textFont(assets["fonts"]["kalam-regular"]);
        textAlign(CENTER)
        text(`Pointer must have your full attention. Exiting fullscreen will end the game. Click to launch fullscreen and the game will begin momentarily.`, width*0.5, height*0.5)
        // setTimeout(() => {
        //     isFullScreen = true
        // }, 2500)
    } else if (showIntersitial){
        intersitial.draw();
        if (millis() - intersitialDuration >= 1500){showIntersitial = false}
    } else if (showEndGame) {
        endGameIntersitial.draw();
        // endGame(true)
    } else if (loadingRound) { 
        textSize(Math.floor(0.01484375*width))
        textFont(assets["fonts"]["kalam-regular"]);
        textAlign(CENTER)
        text("Loading next round...", width*0.5, height*0.5);
    } else if (showPhase2Intersitial) {
        textSize(Math.floor(0.0197916666*width))
        textFont(assets["fonts"]["kalam-regular"]);
        textAlign(CENTER)
        fill('orange')
        text('Starting Phase 2', width*0.5, height*0.3)
        textSize(Math.floor(0.01484375*width))
        fill('black')
        text('Remember: the number of games you solve in this phase determines your bonus.', width*0.5, height*0.5)
        text('Click to start phase 2.', width*0.5, height*0.55)
    } else {
        graph.draw();
        progressBar.draw();
        textSize(Math.floor(0.0166666666*width))
        textFont(assets["fonts"]["kalam-regular"]);
        textAlign(RIGHT)
        fill('rgba(4, 21, 31, 1)')
        titleLogo.draw();
        if (game.isTraining()){
            text(`Phase 1: Round ${player.round.roundIndex+1}/${48}`, width*0.95, height*0.175)
        } else if (game.isTest() || game.isTransfer()){
            text(`Phase 2: Round ${player.round.roundIndex+1-48}/${47}`, width*0.95, height*0.175)
        }
        textSize(Math.floor(0.0125*width)); // 32
        fill('rgba(4, 21, 31, 1)')
        if (!game.isTest()){
            // text(`Restart (${player.round.attemptNum+1}/3)`, width*0.87, height*0.33);
            // restartLogo.draw();
        }
        skipLogo.draw();
        text(`Skip`, width*0.945, height*0.33)
    }
};