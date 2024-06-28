function initialiseGrid(layout=undefined){    
    let PRE = METAPARAMS.IP + METAPARAMS.BASEPATH + "imgs/"

    board = {};
    board.paper = {};
    board.paper.width  = window.innerWidth;
    board.paper.height = window.innerHeight;
    board.paper.centre = [0.5*window.innerWidth , 0.5*window.innerHeight];
    board.paper.rect   = [0,0,board.paper.width,board.paper.height];
    board.paper.object = drawPaper(board.paper.rect);
    board.background = {};
    board.background.width  = window.innerWidth;
    board.background.height = window.innerHeight;
    board.background.rect   = [0, 0,board.background.width,board.background.height];
    board.background.object = drawRect(board.paper.object, board.background.rect);
    board.background.object.attr({"fill": `url('${METAPARAMS.IP}${METAPARAMS.BASEPATH}imgs/background.png')`});
    board.background.object.attr({"opacity": 0});
    board.background.object.toBack()
    
    // APPEARANCE
    x = board.paper.centre[0];
    y = board.paper.centre[1];
    // size scaling
    if (game.deviceType=="mobile" || game.deviceType=="largeMobile") { // for mobile use maximum of screen 
        unit = board.paper.centre[1]/10;
    } else { // for desktop devices
        if (board.paper.centre[0]>board.paper.centre[1]) { 
            unit  = board.paper.centre[1]/8;  
        }
        else {
            unit  = board.paper.centre[0]/8; 
        }
    }
    
    // FEEDBACK - this refers to the success popups etc
    // size feedback
    let rect = undefined;
    if (game.deviceType=="mobile" || game.deviceType=="largeMobile") {
        rect = [x-unit*4,4.2/5*y-unit*1.8,unit*8,unit*3.6];
    } else{
        rect = [x-unit*4,y-unit*1.8,unit*8,unit*3.6];
    }

    // success feedback
    board.posfeedback = {};
    board.posfeedback.object  = drawImage(board.paper.object, PRE + "f_success.png", rect);
    // restart feedback
    board.resfeedback = {};
    board.resfeedback.object = drawImage(board.paper.object, PRE + "f_restart.png", rect);
    // no attempts left feedback
    board.nolfeedback = {};
    board.nolfeedback.object = drawImage(board.paper.object, PRE + "f_noleft.png", rect);
    // new game feedback
    board.newfeedback = {};
    board.newfeedback.object = drawImage(board.paper.object, PRE + "f_new.png", rect);
    hideFeedback();

    // PROGRESS
    // let rect = [x-unit*4,y-unit*1.8,unit*8,unit*3.6];
    rect = [x-unit*4,y-unit*2.5,unit*8,unit*4.5];
    board.challenge = {};
    board.challenge.object  = drawImage(board.paper.object, PRE + "challenge.png", rect);
    board.challenge.object.click(hideChallenge); 
    board.challenge.object.attr({"opacity": 0});

    //GRID
    let numrows = 11;
    let numcols = 11;
    width = unit;
    generateGrid(width, width, numrows, numcols);

    // INSTRUCTIONS
    board.dl = {};
    board.dr = {};
    board.uc = {};
    
    
    if (game.deviceType=="desktop") {
        // fonts
        board.font_bigsize   = 0.8*unit;
        board.font_medsize   = (2/5)*unit;
        board.font_tinysize  = (1/2)*(1/3)*unit;

        board.dr.centre = [board.paper.centre[0]+width*(numrows/2.7), board.paper.centre[1]-width*(numrows/2) - board.font_medsize];
        board.dl.centre = [board.paper.centre[0]-width*(numrows/3.5), board.paper.centre[1]-width*(numrows/2) - board.font_medsize];
        board.uc.centre  = [board.paper.centre[0], board.paper.centre[1] - width*(numrows/2) - 3*board.font_medsize];
        
        board.dr.text   = "Skip Round";
        game.curriculum[player.round.roundIndex] == "test" ? board.dl.text = "" : board.dl.text   = `Restart Round (${player.round.attemptNum+1}/3)`;
        // board.dl.text   = `Restart Round (${player.round.attemptNum+1}/3)`;

        key_dr = "n = ";
        key_dl = "r = ";
    }
    else {
        // fonts
        board.font_bigsize   = 0.8*unit;
        board.font_medsize   = (1/2)*unit;
        board.font_tinysize  = (1/2)*(1/3)*unit;

        // take into account button size
        board.dr.centre = [board.paper.centre[0]+width*(numrows/2.5), board.paper.centre[1]-width*(numrows/2) - (2/3)*(1.62*1.5*width) - board.font_medsize];
        board.dl.centre = [board.paper.centre[0]-width*(numrows/3.5), board.paper.centre[1]-width*(numrows/2) - (2/3)*(1.62*1.5*width) - board.font_medsize];
        board.uc.centre  = [board.paper.centre[0], board.paper.centre[1] - width*(numrows/2) - (2/3)*(1.62*1.5*width) - 3*board.font_medsize];
        
        game.curriculum[player.round.roundIndex] == "test" ? board.dl.text = "" : board.dl.text   = `Restart Round (${player.round.attemptNum+1}/3)`;
        // board.dl.text   = `Restart Round (${player.round.attemptNum+1}/3)`;
        board.dr.text   = "Skip Round";
        key_dr = "";
        key_dl = "";
    }

    op_dl = .5;
    board.uc.text   = `Round ${player.round.roundIndex+1}/${game.parameters.maxRounds}`
    board.dl.object = drawText(board.paper.object,board.dl.centre, board.dl.text);
    board.dl.object.attr({"font-size": board.font_medsize});
    board.dl.object.attr({"text-anchor": "left"});
    board.dl.object.attr({"font-family": '"Courier"'});
    board.dl.object.attr({"font-weight": "bold"});
    board.dl.object.attr({"opacity": op_dl});
    board.dr.object = drawText(board.paper.object,board.dr.centre, board.dr.text);
    board.dr.object.attr({"font-size": board.font_medsize});
    board.dr.object.attr({"text-anchor": "right"});
    board.dr.object.attr({"font-family": '"Courier"'});
    board.dr.object.attr({"font-weight": "bold"});
    board.dr.object.attr({"opacity": op_dl});
    board.uc.object = drawText(board.paper.object,board.uc.centre, board.uc.text);
    board.uc.object.attr({"font-size": board.font_bigsize});
    board.uc.object.attr({"font-family": '"Courier"'});
    board.uc.object.attr({"font-weight": "bolder"});
    board.uc.object.attr({"stroke": "#df8244"});
    board.uc.object.attr({"fill": "#f1ccb0"});
    board.uc.object.attr({"stroke-width": "1.7"});
    board.uc.object.attr({"text-anchor": "centre"});

    // Add click functionality to skip and restart text
    board.dl.object.click(() => {
        if (player.round.resp.allowed.length > 0) {restartOrSkipCallback("restart")}
    })
    board.dr.object.click(() => {
        if (player.round.resp.allowed.length > 0) {restartOrSkipCallback("skip")}
    })

    // Draw content onto grid
    drawOnGrid(numrows, numcols, layout);

    board.background.object.toBack()
}

function generateGrid(width, height, row, col) {
    board.grid = new Array(row);
    board.gridcontent = new Array(row);
    board.characterimg = new Array(row);
    board.goalimg = new Array(row);
    board.obj = new Array(row);
    let PRE = METAPARAMS.IP + METAPARAMS.BASEPATH + "imgs/";

    flag_restart = false; 

    let x;
    let y;
    if (game.deviceType == "desktop"){
        y = board.paper.centre[1] - (width * col / 2);}
    else {
        y = board.paper.centre[1] - (width * col / 2) - (2/3)*(1.62*1.5*width);
    }

    for(let i=0; i<row; i++){
        board.grid[i]         = new Array(col);
        board.gridcontent[i]  = new Array(col);
        board.characterimg[i] = new Array(col);
        board.goalimg[i]      = new Array(col);
        board.obj[i]          = new Array(col);

        x = board.paper.centre[0] - (width * col / 2);

        let border = .1*unit; 

        for(let j=0; j<col; j++){
            board.grid[i][j] = {};
            board.grid[i][j].rectangle = {};
            board.grid[i][j].rectangle.rect   = [x,y,width,height];
            board.grid[i][j].rectangle.object = drawRect(board.paper.object,board.grid[i][j].rectangle.rect);
            board.grid[i][j].rectangle.object.attr({"stroke-width":border});
            board.grid[i][j].isFull  = false;
            board.grid[i][j].isGoal  = false;
            board.grid[i][j].isWall  = false;
            board.grid[i][j].grabbed = false;
            board.grid[i][j].type    = 'none';

            // character
            board.characterimg[i][j] = {};
            board.characterimg[i][j].rect = [x+border,y+border,width-2*border,height-2*border];
            board.characterimg[i][j].object = drawImage(board.paper.object, PRE + "char.png", board.characterimg[i][j].rect);
            board.characterimg[i][j].object.attr({"opacity":0});

            board.obj[i][j] = {};

            x = x + width;
        }
        y = y + height;
    }
    // buttons if on mobile
    if (game.deviceType=="mobile" || game.deviceType=="largeMobile"){
        x = board.paper.centre[0];
        y = board.paper.centre[1] + (row/2)*width;

        board.buttons = new Array(4);
        let buttons = new Array(4);
        buttons = ['l','r','u','d'];
        let directionsVerbose = ['left', 'right', 'up', 'down']
        board.buttons.img = {};
        board.buttons.img_clicked = {};
        board.buttons.rect = {};

        for(let j=0; j<4; j++){
            board.buttons[j] = {};
        }

        let bheight = 1.5*width;
        board.buttons[0].rect = [x-(bheight*1.62)-(bheight*1.62)/2,y,bheight*1.62,bheight];
        board.buttons[1].rect = [x+(bheight*1.62)-(bheight*1.62)/2,y,bheight*1.62,bheight];
        board.buttons[2].rect = [x-(bheight*1.62)/2,y-(bheight*1.62)/2,bheight*1.62,bheight];
        board.buttons[3].rect = [x-(bheight*1.62)/2,y+(bheight*1.62)/2,bheight*1.62,bheight];

        for(let j=0; j<4; j++){
            board.buttons[j].img_clicked = drawImage(board.paper.object, `${PRE}button_${buttons[j]}_clicked.png`, board.buttons[j].rect);
            board.buttons[j].img_clicked.attr({"opacity":0});
            board.buttons[j].img = drawImage(board.paper.object, `${PRE}button_${buttons[j]}.png`, board.buttons[j].rect);
            board.buttons[j].img.attr({"opacity":100});
            // Register click listener
            board.buttons[j].img.click(() => {
                handleMovement(directionsVerbose[j]);
                board.buttons[j].img_clicked.attr({"opacity" : 1})
                board.buttons[j].img.attr({"opacity" : 0})
                setTimeout(function(){
                    board.buttons[j].img_clicked.attr({"opacity" : 0})
                    board.buttons[j].img.attr({"opacity" : 1})
                }.bind(this), 75)
            })
        }
    }
}

// Need to add all the new CDN links for the images here and also to the preloader - but not sure at this point if this is actually working1
function drawOnGrid(nrows, ncols, layout=undefined){
    let rooms = formatRoomsString(layout)
    let flag_transfer = game.isTransfer(); // Needs to be brought into a higher-level function like Game
    let ms = game.parameters.max_pairs + 1;
    let PRE = METAPARAMS.IP + METAPARAMS.BASEPATH + "imgs/shapes/"
    board.rooms = rooms;

    // Update round and attempt numbers:
    board.dl.text   = `Restart Round (${player.round.attemptNum+1}/3)`;
    board.uc.text   = `Round ${player.round.roundIndex+1}/${game.parameters.maxRounds}`
    
    for(let i=0; i<nrows; i++){
        for(let j=0; j<ncols; j++){
            if ((rooms[i][j])==='-'){
                // wall
                board.grid[i][j].isWall = true; 
                board.grid[i][j].rectangle.object.attr({"fill":"grey"});
            } else if ((rooms[i][j]).startsWith('t')){
                // teleporter
                for (let m=1; m<ms; m++){
                    if (rooms[i][j]===('t' + m)){
                        if (flag_transfer===false){
                            board.obj[i][j].object  = drawImage(board.paper.object, PRE + game.parameters.img_teleporter + game.parameters.c_order[m-1] + ".png", board.characterimg[i][j].rect);
                        } else {
                            board.obj[i][j].object  = drawImage(board.paper.object, PRE + "s" + game.parameters.s_order[m-1] + game.parameters.img_teleporter_t + ".png", board.characterimg[i][j].rect);
                        }
                    board.obj[i][j].object.attr({"opacity":1});
                    board.grid[i][j].isFull = true;
                    board.grid[i][j].type   = rooms[i][j];
                    }
                }
            } else if ((rooms[i][j]).startsWith('d')){
                // door
                for (let m=1; m<ms; m++){
                    if (rooms[i][j]===('d' + m)){
                        if (flag_transfer===false){
                            board.obj[i][j].object  = drawImage(board.paper.object, PRE + game.parameters.img_door + game.parameters.c_order[m-1] + ".png", board.characterimg[i][j].rect);
                        } else {
                            board.obj[i][j].object  = drawImage(board.paper.object, PRE + 's' + game.parameters.s_order[m-1] + game.parameters.img_door_t + ".png", board.characterimg[i][j].rect);
                        }
                    board.obj[i][j].object.attr({"opacity":1});
                    board.grid[i][j].isFull = true;
                    board.grid[i][j].type   = rooms[i][j];
                    board.grid[i][j].isWall = true; 
                    }
                }
            } else if ((rooms[i][j]).startsWith('k')){
                    // key
                    for (let m=1; m<ms; m++){
                        if (rooms[i][j]===('k' + m)){
                            if (flag_transfer===false){
                                board.obj[i][j].object  = drawImage(board.paper.object, PRE + game.parameters.img_key + game.parameters.c_order[m-1] + ".png", board.characterimg[i][j].rect);
                            } else {
                                board.obj[i][j].object  = drawImage(board.paper.object, PRE + 's' + game.parameters.s_order[m-1] + game.parameters.img_key_t + ".png", board.characterimg[i][j].rect);
                            }
                        board.obj[i][j].object.attr({"opacity":1});
                        board.grid[i][j].isFull = true;
                        board.grid[i][j].type   = rooms[i][j];
                        }
                    }
                } else if ((rooms[i][j]).startsWith('c')){
                    // catapult
                    for (let m=1; m<ms; m++){
                        if (rooms[i][j]===('c' + m)){
                            if (flag_transfer===false){
                                board.obj[i][j].object  = drawImage(board.paper.object, PRE + game.parameters.img_catapult + game.parameters.c_order[m-1] + ".png",   board.characterimg[i][j].rect);
                            } else {
                                board.obj[i][j].object  = drawImage(board.paper.object, PRE + 's' + game.parameters.s_order[m-1] + game.parameters.img_catapult_t + ".png",   board.characterimg[i][j].rect);
                            }
                        board.obj[i][j].object.attr({"opacity":1});
                        board.grid[i][j].isFull = true;
                        board.grid[i][j].type   = rooms[i][j];
                        }
                    }
                } else if ((rooms[i][j])==='i'){
                    // character
                    player.position = {x: j, y: i}
                    board.characterimg[i][j].object.attr({"opacity":1});
                } else if ((rooms[i][j])==='x'){
                    // goal
                    board.goalimg[i][j] = {};
                    board.goalimg[i][j].object = drawImage(board.paper.object, `${METAPARAMS.IP}${METAPARAMS.BASEPATH}imgs/goal.png`, board.characterimg[i][j].rect);
                    board.goalimg[i][j].object.attr({"opacity":1});
                    board.grid[i][j].isGoal = true;
                }
        }
    }
}

function drawPaper(rect) {
    return Raphael(rect[0],rect[1],rect[2],rect[3]);
}
  
function drawRect(paper, rect) {
    return paper.rect(rect[0],rect[1],rect[2],rect[3]);
}

function drawImage(paper, src, rect) {
    return paper.image(src,rect[0],rect[1],rect[2],rect[3]);
}

function drawText(paper, center, text) {
    return paper.text(center[0],center[1],text);
}

function drawPath(paper, path) {
    return paper.path(path);
}

function drawEllipsoid(paper, rect) {
    return paper.ellipse(rect[0]+rect[2],rect[1]+rect[3],2*rect[2],2*rect[3]);
}

function removePaper(){
    board.paper.object.remove();
}  

function hideFeedback() {
    board.posfeedback.object.attr({"opacity": 0});
    board.resfeedback.object.attr({"opacity": 0});  
    board.newfeedback.object.attr({"opacity": 0});
    board.nolfeedback.object.attr({"opacity": 0});
}

function hideChallenge() {
    board.background.object.toBack();
    board.background.object.attr({"opacity": 1});
    board.challenge.object.attr({"opacity": 0});
    board.challenge.object.toBack();
    // We include this because this here because the intersitial doesn't timeout on a challengd round,
    // so nextRound won't automatically be triggered
    nextRound();
}

/**
 * Format the string containing room layouts into the structure required to be read by the grid. This is an 12x11 array of rooms, with a final empty 12th row (I don't know why, some legacy reason)
 * @param {String} layout single string of layout information. This is how it's stored in the config table and received by the client.
 * @returns {Array} A 12x11 array of layout data, where each cell has a code indicating its purpose (eg. t1, d2, -, c3 etc.)
 */
function formatRoomsString(layout){
    // Mira's code expects A length-12 array where each row is an Array of cells
    // Currently we have it as a length-11 array where each row is a string
    // so we need to split each row by ','
    // and also add an empty 12th row it seems
    let rooms = layout.split("\n")
    rooms.forEach((row, ix) => rooms[ix] = rooms[ix].split(","))
    rooms.push(Array(""))
    return rooms
}

/**
 * Toggles whether or not the character image is visible at the specified position
 * @param {Object} pos object containing position coords as {x: _, y: _}
 * @param {String} toggle denotes if the player should be hidden or not. Keyword 'hide' indicates hidden, any other string indicates show.
 */
function toggleChar(pos, toggle){
    let setting = undefined;
    toggle == 'hide' ? setting = 0 : setting = 1;
    board.characterimg[pos.y][pos.x].object.attr({"opacity": setting})
}

/**
 * Detects if the room at the provided coordinates is a wall. Also filters out for doors, in which case returns false.
 * @param {Object} coords position object with keys `x` and `y`: i.e. {x: 5, y: 6}
 * @returns {boolean} if the room at the provided coords is a wall (and not a door)
 */
function isWall(coords){
    try {
        return (board.grid[coords.y][coords.x].isWall==true && !board.grid[coords.y][coords.x].type.startsWith('d'))    
    } catch (e) {
        return false
    }
}

function isDoor(coords){
    try {
        return (board.grid[coords.y][coords.x].type.startsWith('d'))
    } catch (e) {
        return false
    }
}

function clearGrid(){
    // taken verbatim from v1
   for (let i=0; i<game.parameters.numrows; i++){
    for (let j=0; j<game.parameters.numcols; j++){
        board.characterimg[i][j].object.attr({"opacity":0});
            board.grid[i][j].grabbed = false;
            board.grid[i][j].type = 'none';
            if (board.grid[i][j].isGoal){
                board.goalimg[i][j].object.remove();
                board.grid[i][j].isGoal = false;
            } 
            if (board.grid[i][j].isFull){
                board.obj[i][j].object.remove();
                board.grid[i][j].isFull = false;
            }
            if (board.grid[i][j].isWall){
            board.grid[i][j].isWall = false; 
            board.grid[i][j].rectangle.object.attr({"fill":"white"});
            }
        }
    } 
}

function restartOrSkipCallback(type){
    let response = player.newEmptyResponse();
    response.allowed = (type == "restart" && player.round.attemptNum == 2) ? false : true;
    response.timestamp = Date.now()
    response.xloc = player.position.x;
    response.yloc = player.position.y;
    response.direction = type
    response.tool = type;
    player.saveResponse(response);
    let bb = board;
    if (type == "restart" && player.round.attemptNum == 2){
        player.canMove = false
        player.saveRound(false)
        game.timeoutId = setTimeout(function(){
            nextRound(false)
            player.canMove = true
        }.bind(this), game.parameters.intersitialLength);
        showIntersitial(true, false);
        return
    } else {
        //skip or restart, either are allowed
        player.canMove = false;
        player.saveRound(false);
        game.timeoutId = setTimeout(function() {
            nextRound(type == "restart" ? true : false)
            player.canMove = true;
        }.bind(this), game.parameters.intersitialLength)
        showIntersitial(type == "restart" ? true : false, type == "skip" ? true : false);
        // nextRound(type == "restart" ? true : false);
    }
}

function showIntersitial(isRestart=false, isSkip=false){
    // Show the relevant intersitial for the round
    // Could be the challenge intersitial, success, or start over etc.
    const intersitials = {
        challenge : board.challenge,
        allowedRestart : board.resfeedback,
        blockedRestart : board.nolfeedback,
        success : board.posfeedback,
        skip: board.newfeedback
    }
    let mode = undefined;

    if (player.round.roundIndex == 4){
        // NB: this happens before the round is updated, so it's 1st test index - 1 (i.e. 4)
        mode = intersitials.challenge;
        clearTimeout(game.timeoutId); // We don't want a timeout on the challenge intersitial
        player.canMove = true;
    } else if (player.round.completed == true){
        mode = intersitials.success;
    } else if (isRestart && player.round.attemptNum < 2){
        mode = intersitials.allowedRestart;
    } else if (isRestart && player.round.attemptNum == 2){
        mode = intersitials.blockedRestart;
    } else if (isSkip) {
        mode = intersitials.skip;
    }

    if (mode !== undefined){
        board.background.object.attr({"opacity": 1});
        board.background.object.toFront();
        mode.object.attr({"opacity": 1});
        mode.object.toFront();
    }
    
}