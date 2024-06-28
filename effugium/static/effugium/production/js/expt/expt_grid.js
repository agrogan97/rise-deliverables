function generateGrid(width, height, row, col) {
    board.grid = new Array(row);
    board.gridcontent = new Array(row);
    board.characterimg = new Array(row);
    board.goalimg = new Array(row);
    board.obj = new Array(row);

flag_restart = false;

var x;
if (mobile==0){
    var y = board.paper.centre[1] - (width * col / 2);}
    else {
    var y = board.paper.centre[1] - (width * col / 2) - (2/3)*(1.62*1.5*width);
    }

    
    for(i=0; i<row; i++){

    board.grid[i]         = new Array(col);
    board.gridcontent[i]  = new Array(col);
    board.characterimg[i] = new Array(col);
    board.goalimg[i]      = new Array(col);
    board.obj[i]          = new Array(col);

    x = board.paper.centre[0] - (width * col / 2);

    var border = .1*unit; 

    for(j=0; j<col; j++){
    board.grid[i][j] = {};
    board.grid[i][j].rectangle = {};
    board.grid[i][j].rectangle.rect   = [x,y,width,height];
    board.grid[i][j].rectangle.object = drawRect(board.paper.object,board.grid[i][j].rectangle.rect);
    board.grid[i][j].rectangle.object.attr({"stroke-width":border});
    board.grid[i][j].isfull  = false;
    board.grid[i][j].isgoal  = false;
    board.grid[i][j].iswall  = false;
    board.grid[i][j].grabbed = false;
    board.grid[i][j].type    = 'none';

    // character
    board.characterimg[i][j] = {};
    board.characterimg[i][j].rect = [x+border,y+border,width-2*border,height-2*border];
    board.characterimg[i][j].object = drawImage(board.paper.object, METAPARAMS.BASEPATH + "imgs/char.png", board.characterimg[i][j].rect);
    board.characterimg[i][j].object.attr({"opacity":0});

    board.obj[i][j] = {};

    x = x + width;
    }
    y = y + height;
}
// buttons if on mobile
if (mobile==1){
    x = board.paper.centre[0];
    y = board.paper.centre[1] + (coding.numrows/2)*width;

    board.buttons = new Array(4);
    var buttons = new Array(4);
    buttons = ['l','r','u','d'];
    board.buttons.img = {};
    board.buttons.img_clicked = {};
    board.buttons.rect = {};

    for(j=0; j<4; j++){
    board.buttons[j] = {};
    }

    var bheight = 1.5*width;
    board.buttons[0].rect = [x-(bheight*1.62)-(bheight*1.62)/2,y,bheight*1.62,bheight];
    board.buttons[1].rect = [x+(bheight*1.62)-(bheight*1.62)/2,y,bheight*1.62,bheight];
    board.buttons[2].rect = [x-(bheight*1.62)/2,y-(bheight*1.62)/2,bheight*1.62,bheight];
    board.buttons[3].rect = [x-(bheight*1.62)/2,y+(bheight*1.62)/2,bheight*1.62,bheight];

    for(j=0; j<4; j++){
    board.buttons[j].img_clicked = drawImage(board.paper.object, METAPARAMS.BASEPATH + "imgs/button_" + buttons[j] + "_clicked.png", board.buttons[j].rect);
    board.buttons[j].img_clicked.attr({"opacity":0});
    board.buttons[j].img = drawImage(board.paper.object, METAPARAMS.BASEPATH + "imgs/button_" + buttons[j] + ".png", board.buttons[j].rect);
    board.buttons[j].img.attr({"opacity":100});
    }
}
}

function populateGrid(){

    row = coding.numrows;
    col = coding.numcols;
    ms  = max_pairs+1; // total number of pairing variable

    // run draw on grid with existing layout if loading from cache
    if (RELOADED_STATE){
        requestLayout(coding.layout).then(function(value){
            rooms = value;
            drawOnGrid(value);
            sdata.attempted_layouts[sdata.attempted_layouts.length-1][1] = true
            })
        return
    }
    
function requestLayout(file) {
    /*
        Summary:
                - Request file from remote server, returning a JS Promise
    */
    return new Promise(function(resolve, reject){
    const req = new XMLHttpRequest();
    req.onload = function() {
        let valArray = []
        let r = this.responseText;
        let splr = r.split("\n")
        for (var en in splr){
        let nv = splr[en].split("\r")[0].split(",")
        // nv[nv.length-1].replace("\\r", "")
        valArray.push(nv);
        }
        resolve(valArray);
    };
    req.onerror = reject;
    // req.open("GET", `${METAPARAMS.IP}${METAPARAMS.BASEPATH}layout/${file}.txt`);
    let query = (new URL(window.location.href)).searchParams;
    if (query.get("layout") == null || query.get("layout") == "null"){
        req.open("GET", `${METAPARAMS.IP}${METAPARAMS.BASEPATH}layout/${file}.txt`);
    } else {
        const getFile = query.get("layout")
        req.open("GET", `${METAPARAMS.IP}${METAPARAMS.BASEPATH}layout/${getFile}.txt`);
    }
    
    req.send();
    })
}

function generateLayout(type) {
    /*
        Summary:
                - Generate filename based on type, from `test`, `train` and `transfer`
    */
    function newLayout(type) {
    switch(type) {
        case "train":
        // Train
        function _runTrain() {            
            let count_layout = parameters.levels_def[coding.level][coding.level_count];
            let rand_layout = Math.floor(Math.random() * 25) + 1;
            let frm = 'r' + coding.level.toString() + '_' + count_layout.toString() + '_' + rand_layout.toString()
            sdata.attempted_layouts.push([frm, false]);
            return(frm);
        }
        return _runTrain()
        case "test":
        // Test
        function _runTest() { 
            let frm = 'test_' + parameters.levels_test[coding.test].toString();
            sdata.attempted_layouts.push([frm, false]);
            return(frm); 
        };
        return _runTest()
        case "transfer":
        // Transfer
        function _runTransfer() {
            let frm = 'transfer_' + parameters.levels_transfer[coding.transf_count].toString()
            sdata.attempted_layouts.push([frm, false]);
            return(frm); 
            };
        return _runTransfer()
        default:
        return undefined
    }
    }

    // NB: saving to global var `sdata` happens in expt_launcher.js
    let tmpLayout = newLayout(type)
    if (tmpLayout === undefined) { throw "Bad level layout type"}
    while (sdata.trial_layout.includes(tmpLayout)) {
    tmpLayout = newLayout(type)
    }
    coding.layout = tmpLayout;
    // return tmpLayout;
}

if (flag_transfer===false){
    if (flag_test === false) {
    if (flag_restart === false) {
        // training level 
        generateLayout("train")
        requestLayout(coding.layout).then(function(value){
        rooms = value;
        drawOnGrid(value);
        sdata.attempted_layouts[sdata.attempted_layouts.length-1][1] = true
        })
        if (!RELOADED_STATE){ coding.level_count ++};
    }
    else { // restart - draw the same layout
        flag_restart = false;
        requestLayout(coding.layout).then(function(value){
        rooms = value;
        drawOnGrid(value);
        })
    }
    }
    else { // test game 
    generateLayout("test")
        requestLayout(coding.layout).then(function(value){
        rooms = value;
        drawOnGrid(value);
        sdata.attempted_layouts[sdata.attempted_layouts.length-1][1] = true
    })
    }
} else { // transfer game
    if (flag_restart === false)  {
        generateLayout("transfer")
        requestLayout(coding.layout).then(function(value){
        rooms = value;
        drawOnGrid(value);
        sdata.attempted_layouts[sdata.attempted_layouts.length-1][1] = true
        })
        if (!RELOADED_STATE){coding.transf_count ++};
    }
    else { // restart transfer game
        flag_restart = false;
        requestLayout(coding.layout).then(function(value){
        rooms = value;
        drawOnGrid(value);
        })
    }
}

}

function drawOnGrid(value){
let rooms = value;
for(i=0; i<row; i++){
    for(j=0; j<col; j++){
    if ((rooms[i][j])==='-'){
        // wall
        board.grid[i][j].iswall = 1; 
        board.grid[i][j].rectangle.object.attr({"fill":"grey"});
        }
        else if ((rooms[i][j]).startsWith('t')){
        // teleoprter
        for (m=1; m<ms; m++){
            if (rooms[i][j]===('t' + m)){
            if (flag_transfer===false){
            if (parameters.img_tool=='c') {
                board.obj[i][j].object  = drawImage(board.paper.object, METAPARAMS.BASEPATH + "imgs/shapes/s" + parameters.s_order[m-1] + parameters.img_teleporter, board.characterimg[i][j].rect);
            } else {
            board.obj[i][j].object  = drawImage(board.paper.object, METAPARAMS.BASEPATH + "imgs/shapes/" + parameters.img_teleporter + parameters.c_order[m-1] + '.png', board.characterimg[i][j].rect);
            }
        } else {
            if (parameters.img_tool=='s') {
            board.obj[i][j].object  = drawImage(board.paper.object, METAPARAMS.BASEPATH + 'imgs/shapes/s' + parameters.s_order[m-1] + parameters.img_teleporter_t, board.characterimg[i][j].rect);
            } else {
            board.obj[i][j].object  = drawImage(board.paper.object, METAPARAMS.BASEPATH + 'imgs/shapes/' + parameters.img_teleporter_t + parameters.c_order[m-1] + '.png', board.characterimg[i][j].rect);
            }
        }
        board.obj[i][j].object.attr({"opacity":1});
        board.grid[i][j].isfull = true;
        board.grid[i][j].type   = rooms[i][j];
        }
    }
    }
    else if ((rooms[i][j]).startsWith('d')){
        // door
        for (m=1; m<ms; m++){
            if (rooms[i][j]===('d' + m)){
            if (flag_transfer===false){
            if (parameters.img_tool=='c') {
                board.obj[i][j].object  = drawImage(board.paper.object, METAPARAMS.BASEPATH + 'imgs/shapes/s' + parameters.s_order[m-1] + parameters.img_door, board.characterimg[i][j].rect);
            } else {
                board.obj[i][j].object  = drawImage(board.paper.object, METAPARAMS.BASEPATH + 'imgs/shapes/' + parameters.img_door + parameters.c_order[m-1] + '.png', board.characterimg[i][j].rect);
            }
            } else {
            if (parameters.img_tool=='s') {
                board.obj[i][j].object  = drawImage(board.paper.object, METAPARAMS.BASEPATH + 'imgs/shapes/s' + parameters.s_order[m-1] + parameters.img_door_t, board.characterimg[i][j].rect);
            } else {
                board.obj[i][j].object  = drawImage(board.paper.object, METAPARAMS.BASEPATH + 'imgs/shapes/' + parameters.img_door_t + parameters.c_order[m-1] + '.png', board.characterimg[i][j].rect);
            }
            }
            board.obj[i][j].object.attr({"opacity":1});
            board.grid[i][j].isfull = true;
            board.grid[i][j].type   = rooms[i][j];
            board.grid[i][j].iswall = 1; 
        }
        }
    }
    else if ((rooms[i][j]).startsWith('k')){
        // key
        for (m=1; m<ms; m++){
            if (rooms[i][j]===('k' + m)){
            if (flag_transfer===false){
            if (parameters.img_tool=='c') {
                board.obj[i][j].object  = drawImage(board.paper.object, METAPARAMS.BASEPATH + 'imgs/shapes/s' + parameters.s_order[m-1] + parameters.img_key, board.characterimg[i][j].rect);
            } else {
                board.obj[i][j].object  = drawImage(board.paper.object, METAPARAMS.BASEPATH + 'imgs/shapes/' + parameters.img_key + parameters.c_order[m-1] + '.png', board.characterimg[i][j].rect);
            }
            } else {
            if (parameters.img_tool=='s') {
                board.obj[i][j].object  = drawImage(board.paper.object, METAPARAMS.BASEPATH + 'imgs/shapes/s' + parameters.s_order[m-1] + parameters.img_key_t, board.characterimg[i][j].rect);
            } else {
                board.obj[i][j].object  = drawImage(board.paper.object, METAPARAMS.BASEPATH + 'imgs/shapes/' + parameters.img_key_t + parameters.c_order[m-1] + '.png', board.characterimg[i][j].rect);
            }
            }
            board.obj[i][j].object.attr({"opacity":1});
            board.grid[i][j].isfull = true;
            board.grid[i][j].type   = rooms[i][j];
        }
        }
    }
    else if ((rooms[i][j]).startsWith('c')){
        // catapult
        for (m=1; m<ms; m++){
            if (rooms[i][j]===('c' + m)){
            if (flag_transfer===false){
            if (parameters.img_tool=='c') {
                board.obj[i][j].object  = drawImage(board.paper.object, METAPARAMS.BASEPATH + 'imgs/shapes/s' + parameters.s_order[m-1] + parameters.img_catapult, board.characterimg[i][j].rect);
            } else {
                board.obj[i][j].object  = drawImage(board.paper.object, METAPARAMS.BASEPATH + 'imgs/shapes/' + parameters.img_catapult + parameters.c_order[m-1] + '.png', board.characterimg[i][j].rect);
            }
            } else {
            if (parameters.img_tool=='s') {
                board.obj[i][j].object  = drawImage(board.paper.object, METAPARAMS.BASEPATH + 'imgs/shapes/s' + parameters.s_order[m-1] + parameters.img_catapult_t, board.characterimg[i][j].rect);
            } else {
                board.obj[i][j].object  = drawImage(board.paper.object, METAPARAMS.BASEPATH + 'imgs/shapes/' + parameters.img_catapult_t + parameters.c_order[m-1] + '.png', board.characterimg[i][j].rect);
            }
            }
            board.obj[i][j].object.attr({"opacity":1});
            board.grid[i][j].isfull = true;
            board.grid[i][j].type   = rooms[i][j];
        }
        }
    }
    else if ((rooms[i][j])==='i'){
        // character
        coding.xloc = j;
        coding.yloc = i;
        board.characterimg[coding.yloc][coding.xloc].object.attr({"opacity":1});
    }
    else if ((rooms[i][j])==='x'){
        // goal
        board.goalimg[i][j] = {};
        board.goalimg[i][j].object = drawImage(board.paper.object, METAPARAMS.BASEPATH + "imgs/goal.png", board.characterimg[i][j].rect);
        board.goalimg[i][j].object.attr({"opacity":1});
        board.grid[i][j].isgoal = true;
        }
    }
    }
}

function resetGrid(){

    coding.xloc = 0;
    coding.yloc = 0;
    for (i=0; i<coding.numrows; i++){
        for(j=0; j<coding.numcols; j++){
            board.characterimg[i][j].object.attr({"opacity":0});
            board.grid[i][j].grabbed = false;
            board.grid[i][j].type = 'none';
            if (board.grid[i][j].isgoal){
                board.goalimg[i][j].object.remove();
                board.grid[i][j].isgoal = false;
            } 
            if (board.grid[i][j].isfull){
                board.obj[i][j].object.remove();
                board.grid[i][j].isfull = false;
            }
            if (board.grid[i][j].iswall){
            board.grid[i][j].iswall = false; 
            board.grid[i][j].rectangle.object.attr({"fill":"white"});
            }
        }
    }

    populateGrid();
}



