
// Response methods
function handleLeft()  { handleResponse('Left', 0); }
function handleRight() { handleResponse('Right',1); }
function handleUp()    { handleResponse('Up'   ,2); }
function handleDown()  { handleResponse('Down' ,3); }

function handleResponse(key,category) {
    coding.allowed  = 0;
    coding.tool  	= '';
    if(coding.answering){
        if(isnan(category)) {
            handleNoResponse();
        } else {
            // move around (if allowed)
            if(key == 'Right'){
                if (coding.xloc < coding.numcols - 1){
                    if ((coding.xloc+1)<coding.numcols) {
                        if (board.grid[coding.yloc][coding.xloc+1].iswall==false){
                            if (mobile==1){ // button animation
                                board.buttons[1].img.attr({"opacity":0});
                                board.buttons[1].img_clicked.attr({"opacity":100});
                                setTimeout(function(){board.buttons[1].img_clicked.attr({"opacity":0}); board.buttons[1].img.attr({"opacity":100});}, 100);
                            }
                            board.characterimg[coding.yloc][coding.xloc].object.attr({"opacity": 0});
                            coding.xloc += 1;
                            if (coding.isSkipBlocked) {
                                reregisterClicks();
                                coding.isSkipBlocked = false;
                            }
                            coding.allowed = 1;
                        }
                    } else {
                        // And check if attempted move is into a wall
                        if (board.grid[coding.yloc][coding.xloc+1].iswall==false) {
                            if (mobile==1){ // button animation
                                board.buttons[1].img.attr({"opacity":0});
                                board.buttons[1].img_clicked.attr({"opacity":100});
                                setTimeout(function(){board.buttons[1].img_clicked.attr({"opacity":0}); board.buttons[1].img.attr({"opacity":100});}, 100);
                            }
                            board.characterimg[coding.yloc][coding.xloc].object.attr({"opacity": 0});
                            coding.xloc += 1;
                            if (coding.isSkipBlocked) {
                                reregisterClicks();
                                coding.isSkipBlocked = false;
                            }
                            coding.allowed = 1;
                        }
                    }
                    
                }
            }
            else if(key == 'Left'){
                if (coding.xloc > 0){
                    if ((coding.xloc-1)>0) {
                        if (board.grid[coding.yloc][coding.xloc-1].iswall==false){
                            if (mobile==1){ // button animation
                                board.buttons[0].img.attr({"opacity":0});
                                board.buttons[0].img_clicked.attr({"opacity":100});
                                setTimeout(function(){board.buttons[0].img_clicked.attr({"opacity":0}); board.buttons[0].img.attr({"opacity":100});}, 100);
                            }
                            board.characterimg[coding.yloc][coding.xloc].object.attr({"opacity": 0});
                            coding.xloc -= 1;
                            if (coding.isSkipBlocked) {
                                reregisterClicks();
                                coding.isSkipBlocked = false;
                            }
                            coding.allowed = 1;
                        } 
                    } else {
                        if (board.grid[coding.yloc][coding.xloc-1].iswall==false){
                            if (mobile==1){ // button animation
                                board.buttons[0].img.attr({"opacity":0});
                                board.buttons[0].img_clicked.attr({"opacity":100});
                                setTimeout(function(){board.buttons[0].img_clicked.attr({"opacity":0}); board.buttons[0].img.attr({"opacity":100});}, 100);
                            }
                            board.characterimg[coding.yloc][coding.xloc].object.attr({"opacity": 0});
                            coding.xloc -= 1;
                            if (coding.isSkipBlocked) {
                                    reregisterClicks();
                                    coding.isSkipBlocked = false;
                                }
                            coding.allowed = 1;
                        }
                    }
                }
            }
            else if(key == 'Up'){
                if (coding.yloc > 0) {
                    if ((coding.yloc-1) > 0) {
                        if (board.grid[coding.yloc-1][coding.xloc].iswall==false) {
                            if (mobile==1){ // button animation
                                board.buttons[2].img.attr({"opacity":0});
                                board.buttons[2].img_clicked.attr({"opacity":100});
                                setTimeout(function(){board.buttons[2].img_clicked.attr({"opacity":0}); board.buttons[2].img.attr({"opacity":100});}, 100);
                            }
                            board.characterimg[coding.yloc][coding.xloc].object.attr({"opacity": 0});
                            coding.yloc -= 1;
                            if (coding.isSkipBlocked) {
                                reregisterClicks();
                                coding.isSkipBlocked = false;
                            }
                            coding.allowed = 1;
                        }
                    } else {
                        if (board.grid[coding.yloc-1][coding.xloc].iswall==false){
                            if (mobile==1){ // button animation
                                board.buttons[2].img.attr({"opacity":0});
                                board.buttons[2].img_clicked.attr({"opacity":100});
                                setTimeout(function(){board.buttons[2].img_clicked.attr({"opacity":0}); board.buttons[2].img.attr({"opacity":100});}, 100);
                            }
                            board.characterimg[coding.yloc][coding.xloc].object.attr({"opacity": 0});
                            coding.yloc -= 1;
                            if (coding.isSkipBlocked) {
                                    reregisterClicks();
                                    coding.isSkipBlocked = false;
                                }
                            coding.allowed = 1;
                        }
                    }
                    
                }
            }
            else if(key == 'Down'){
                if (coding.yloc < coding.numrows - 1) {
                    if ((coding.yloc+1)<coding.numrows) {
                        if (board.grid[coding.yloc+1][coding.xloc].iswall==false) {
                            if (mobile==1){ // button animation
                                board.buttons[3].img.attr({"opacity":0});
                                board.buttons[3].img_clicked.attr({"opacity":100});
                                setTimeout(function(){board.buttons[3].img_clicked.attr({"opacity":0}); board.buttons[3].img.attr({"opacity":100});}, 100);
                            }
                            board.characterimg[coding.yloc][coding.xloc].object.attr({"opacity": 0});
                            coding.yloc += 1;
                            if (coding.isSkipBlocked) {
                                reregisterClicks();
                                coding.isSkipBlocked = false;
                            }
                            coding.allowed = 1;
                        }
                    } else {
                        if (board.grid[coding.yloc+1][coding.xloc].iswall==false){
                            if (mobile==1){ // button animation
                                board.buttons[3].img.attr({"opacity":0});
                                board.buttons[3].img_clicked.attr({"opacity":100});
                                setTimeout(function(){board.buttons[3].img_clicked.attr({"opacity":0}); board.buttons[3].img.attr({"opacity":100});}, 100);
                            }
                            board.characterimg[coding.yloc][coding.xloc].object.attr({"opacity": 0});
                            coding.yloc += 1;
                            if (coding.isSkipBlocked) {
                                    reregisterClicks();
                                    coding.isSkipBlocked = false;
                                }
                            coding.allowed = 1;
                        }
                    }
                    
                }
            }
            // use tools
            if (board.grid[coding.yloc][coding.xloc].isfull){
                if (board.grid[coding.yloc][coding.xloc].grabbed==false){
                    coding.tool = board.grid[coding.yloc][coding.xloc].type;
                    grabObject(coding.yloc,coding.xloc,key);
                    saveResponse(key,category);
                    if (board.grid[coding.yloc][coding.xloc].isfull){
                        if (board.grid[coding.yloc][coding.xloc].grabbed==false){
                            coding.tool = board.grid[coding.yloc][coding.xloc].type;
                            grabObject(coding.yloc,coding.xloc,key);
                            category = NaN;
                            coding.allowed = NaN;
                            saveResponse(NaN,category);
                            if (board.grid[coding.yloc][coding.xloc].isfull){
                                if (board.grid[coding.yloc][coding.xloc].grabbed==false){
                                    coding.tool = board.grid[coding.yloc][coding.xloc].type;
                                    grabObject(coding.yloc,coding.xloc,key);
                                    category = NaN;
                                    coding.allowed = NaN;
                                    saveResponse(NaN,category);

                                }
                            }
                            
                        }
                    }
                } else {
                    saveResponse(key,category);
                }
            } else {
                saveResponse(key,category);
            }
            if (board.grid[coding.yloc][coding.xloc].isgoal){
                solvedGame();
            }
            board.characterimg[coding.yloc][coding.xloc].object.attr({"opacity": 100});
            
        }
    }
}

function grabObject(yloc, xloc, key){
    board.obj[yloc][xloc].object.attr({"opacity":.2})
    coding.grabbed += 1;
    board.grid[coding.yloc][coding.xloc].grabbed = true;

    // teleporter 
    if (board.grid[coding.yloc][coding.xloc].type.startsWith('t')) {
        for(i=0; i<coding.numrows; i++){
            for(j=0; j<coding.numcols; j++){
                if (i!=coding.yloc || j!=coding.xloc) {
                    if (board.grid[i][j].type===board.grid[coding.yloc][coding.xloc].type) {
                        coding.xloc = j;
                        coding.yloc = i;
                        board.characterimg[coding.yloc][coding.xloc].object.attr({"opacity": 100});
                        board.obj[coding.yloc][coding.xloc].object.attr({"opacity": .2});
                        board.grid[coding.yloc][coding.xloc].grabbed = true;
                        return; 
                    }	  	
                }
            }
        }
    }
    // key
    if (board.grid[coding.yloc][coding.xloc].type.startsWith('k')) {
        for(i=0; i<coding.numrows; i++){
            for(j=0; j<coding.numcols; j++){
                if (board.grid[i][j].type===('d'+board.grid[coding.yloc][coding.xloc].type.charAt(1))) {
                    board.grid[i][j].iswall = false;
                    return;  	
                }
            }
        }
    }
    // door (close it when passing through)
    if (board.grid[coding.yloc][coding.xloc].type.startsWith('d')) {
        board.grid[coding.yloc][coding.xloc].iswall = true;
    }
    // catapult
    cat_steps = 1;
    if (board.grid[coding.yloc][coding.xloc].type.startsWith('c')) {
        if(key == 'Right'){
            if (((coding.xloc+cat_steps) < (coding.numcols))){
                board.characterimg[coding.yloc][coding.xloc].object.attr({"opacity": 0});
                coding.xloc += cat_steps;
            }
            else {
                board.characterimg[coding.yloc][coding.xloc].object.attr({"opacity": 100});
            }
        }
        else if(key == 'Left'){
            if ((coding.xloc > 0)){
                board.characterimg[coding.yloc][coding.xloc].object.attr({"opacity": 0});
                coding.xloc -= cat_steps;
            }
            else {
                board.characterimg[coding.yloc][coding.xloc].object.attr({"opacity": 100});
            }
        }
        else if(key == 'Up'){
            if ((coding.yloc > 0)){
                board.characterimg[coding.yloc][coding.xloc].object.attr({"opacity": 0});
                coding.yloc -= cat_steps;
            }
            else {
                board.characterimg[coding.yloc][coding.xloc].object.attr({"opacity": 100});
            }
        }
        else if(key == 'Down'){
            if (((coding.yloc+cat_steps) < (coding.numrows))){
                board.characterimg[coding.yloc][coding.xloc].object.attr({"opacity": 0});
                coding.yloc += cat_steps;
            }
            else {
                board.characterimg[coding.yloc][coding.xloc].object.attr({"opacity": 100});
            }
        }
        
    }
}

function handleNoResponse() {
    if(!isFullscreen() && startedexperiment && !finishedexperiment) {
        finishExperiment_noresponse();
    }
}

function saveResponse(key,category) {
    var resp_timestamp = getTimestamp();
    var resp_rt 	   = getSecs(coding.timestamp);
    sdata.resp[coding.index].timestamp.push(resp_timestamp);  // time stamp
    sdata.resp[coding.index].reactiontime.push(resp_rt);  // RT
    sdata.resp[coding.index].direction.push(category); // move direction
    sdata.resp[coding.index].xloc.push(coding.xloc); // new x location
    sdata.resp[coding.index].yloc.push(coding.yloc); // move direction
    sdata.resp[coding.index].allowed.push(coding.allowed); // is move allowed
    sdata.resp[coding.index].tool.push(coding.tool); // tool
    sdata.resp[coding.index].layout = coding.layout;

    coding.timestamp = resp_timestamp; // reset timestamp after move
    disp('move saved');
}

