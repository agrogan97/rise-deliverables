function runExperiment(){
    /*
        Summary:
                - This initialises the outline of the board and creates the board object
                - It then calls nextTrial() which populate the grid with the round-based layout
    */

    board = {};

    // BOARD
    // paper (paper)
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
    board.background.object.attr({"fill": `url('${METAPARAMS.BASEPATH}imgs/background.png')`});
    board.background.object.attr({"opacity": 1});
    board.background.object.toBack();
    
    // APPEARANCE
    x = board.paper.centre[0];
    y = board.paper.centre[1];
    // size scaling
    if (mobile==1) { // for mobile use maximum of screen 
    unit = board.paper.centre[1]/10;

    } else { // for desktop devices
    if (board.paper.centre[0]>board.paper.centre[1]) { 
        unit  = board.paper.centre[1]/8;  
    }
    else {
        unit  = board.paper.centre[0]/8; 
    }
    }
    
    // FEEDBACK
    // size feedback
    if (mobile==1) {
        var rect = [x-unit*4,4.2/5*y-unit*1.8,unit*8,unit*3.6];
    } else{
        var rect = [x-unit*4,y-unit*1.8,unit*8,unit*3.6];
    }
    // success feedback
    board.posfeedback = {};
    board.posfeedback.object  = drawImage(board.paper.object, METAPARAMS.BASEPATH + "imgs/f_success.png", rect);
    // restart feedback
    board.resfeedback = {};
    board.resfeedback.object = drawImage(board.paper.object, METAPARAMS.BASEPATH + "imgs/f_restart.png", rect);
    // no attempts left feedback
    board.nolfeedback = {};
    board.nolfeedback.object = drawImage(board.paper.object, METAPARAMS.BASEPATH + "imgs/f_noleft.png", rect);
    // new game feedback
    board.newfeedback = {};
    board.newfeedback.object = drawImage(board.paper.object, METAPARAMS.BASEPATH + "imgs/f_new.png", rect);
    hideFeedback();

    // PROGRESS
    var rect = [x-unit*4,y-unit*1.8,unit*8,unit*3.6];
    board.challenge = {};
    board.challenge.object  = drawImage(board.paper.object, METAPARAMS.BASEPATH + "imgs/challenge.png", rect);
    board.challenge.object.click(hideChallenge); 
    board.challenge.object.attr({"opacity": 0});

    //GRID
    coding.numrows = 11;
    coding.numcols = 11;
    width = unit;
    generateGrid(width, width, coding.numrows, coding.numcols);

    // INSTRUCTIONS
    board.dl = {};
    board.dr = {};
    board.uc = {};
    
    
    if (mobile==0) {
        // fonts
        board.font_bigsize   = 0.8*unit;
        board.font_medsize   = (2/5)*unit;
        board.font_tinysize  = (1/2)*(1/3)*unit;

        board.dr.centre = [board.paper.centre[0]+width*(coding.numrows/2.7), board.paper.centre[1]-width*(coding.numrows/2) - board.font_medsize];
        board.dl.centre = [board.paper.centre[0]-width*(coding.numrows/3.5), board.paper.centre[1]-width*(coding.numrows/2) - board.font_medsize];
        board.uc.centre  = [board.paper.centre[0], board.paper.centre[1] - width*(coding.numrows/2) - 3*board.font_medsize];
        
        board.dr.text   = "Skip Round";
        board.dl.text   = "Restart Round (1/3)";

        key_dr = "n = ";
        key_dl = "r = ";
    }
    else {
        // fonts
        board.font_bigsize   = 0.8*unit;
        board.font_medsize   = (1/2)*unit;
        board.font_tinysize  = (1/2)*(1/3)*unit;

        // take into account button size
        board.dr.centre = [board.paper.centre[0]+width*(coding.numrows/2.5), board.paper.centre[1]-width*(coding.numrows/2) - (2/3)*(1.62*1.5*width) - board.font_medsize];
        board.dl.centre = [board.paper.centre[0]-width*(coding.numrows/3.5), board.paper.centre[1]-width*(coding.numrows/2) - (2/3)*(1.62*1.5*width) - board.font_medsize];
        board.uc.centre  = [board.paper.centre[0], board.paper.centre[1] - width*(coding.numrows/2) - (2/3)*(1.62*1.5*width) - 3*board.font_medsize];
        
        board.dl.text   = "Restart Round (1/3)";
        board.dr.text   = "Skip Round";
        key_dr = "";
        key_dl = "";
    }

    op_dl = .5;
    board.uc.text   = "Round 1/92";
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
    

    // RESPONSES
    registerControls()

    // START
    nextTrial();
};

function registerControls(){
    /*
        Register game functionality
    */
    if (!coding.registeredControls){
        if (mobile==0) {
            // Attach an event listener to the window
            window.addEventListener('keydown', (e) => {
                switch(e.key){
                    case 'ArrowUp':
                        handleUp();
                        break;
                    case 'ArrowDown':
                        handleDown();
                        break;
                    case 'ArrowLeft':
                        handleLeft();
                        break;
                    case 'ArrowRight':
                        handleRight();
                }
           })
            // board.dl.object.click(restartGame);
            // board.dr.object.click(newGame);
            // coding.isSkipBlocked = false;
        }
        else {
            // board.dl.object.click(restartGame);
            // board.dr.object.click(newGame);
            // coding.isSkipBlocked = false;
            board.buttons[0].img.click(handleLeft);
            board.buttons[1].img.click(handleRight);
            board.buttons[2].img.click(handleUp);
            board.buttons[3].img.click(handleDown);
        }
        coding.registeredControls = true;
    }
}

function reregisterClicks(){
    /*
    Summary:
            - Function to re-register the Skip Game click listener when its been deactivated.
            - It's deactivated at the start of every level, and reactivated after the user has moved a space
    */
        board.dl.object.click(restartGame);
        board.dr.object.click(newGame);
        coding.isSkipBlocked = false;
}

function removeClicks(){
    /*
    Summary:
            - Function to remove the click listeners from the Skip Game and restart buttons
            - Called before every new attempt to stop auto-button clicking before the user has moved
    */

    board.dr.object.unclick(newGame);
    board.dl.object.unclick(restartGame);
    coding.isSkipBlocked = true;
}