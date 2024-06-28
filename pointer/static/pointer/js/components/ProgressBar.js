/**
 * Class for the progress bar that indicates current player score and round target score. Creates instances of the `Block` class.
 * @param {number} x position of progress bar image as % of available screen width from left-hand side
 * @param {number} y position of progress bar image as % of available screen height from top of screen
 * @returns {any}
 */
class ProgressBar {
    constructor(x, y) {
        this.initPos = createVector(x, y)
        this.position = createVector(this.initPos.x*width/100, this.initPos.y*height/100);
        this.target = 0;
        this.arrowOffset = createVector(0, 0)
        this.showTransition = false;
        this.transitionArrow = {
            A : undefined,
            B : undefined
        }
        this.transitionArrowOpacity = 1;

        // Progress bar built with p5js params
        this.randomOffsets = _.range(0, 15).map(m =>_.range(4).map(i => random(-12, 12)));
        this.randomOffsets = _.range(0, 15).map(m =>_.range(4).map(i => random(0, 0)));
        this.progressBlocks = [];
        this.buildProgressBar();

    }

    /**
     * The progress bar is built using p5js vertices, with the Block class. This method builds positions for the blocks by taking into account the number of divisions, spacing, and boundaries dynamically, to keep spacing consistent. A random modifier is also applied to vary the shapes of the blocks.
     * @param {number} [divs=11] The number of divisions (blocks) to create. Eg. for a -5 to +5 score bar, it would be 11 divisions (inclusive of 0)
     */
    buildProgressBar(divs=21){
        const divisions = divs
        const dims = createVector(100, 10) // in %
        // Define the dimension of the space in terms of its upper LHS and lower RHS boundaries
        let LHBounds = createVector(this.position.x, this.position.y)
        const RHBounds = createVector(this.position.x + (dims.x*width/100), this.position.y + (dims.y*height/100))
        // Number of segments to break the space into
        let singleWidth = ((RHBounds.x - LHBounds.x)*0.75)/(divisions);
        let singleHeight = ((RHBounds.y - LHBounds.y));
        // const xSpacing = ((RHBounds.x - LHBounds.x)*0.25)/(divisions); // plus 2 adds spacing to the ends too
        const xSpacing = 0 // plus 2 adds spacing to the ends too
        LHBounds.x += (width*0.05)
        let middle = createVector(RHBounds.x - LHBounds.x, RHBounds.y - LHBounds.y);
        let ix = -(divisions-1)/2;
        for (let i=0; i<divisions; i++){
            // Get upper and lower bounds of score from the number of divs (remembering the 0th div)
            let bb = [-1*((divs-1)/2), ((divs-1)/2)]
            this.progressBlocks.push(new Block(LHBounds.x + i*(singleWidth) + (i+2)*xSpacing, LHBounds.y, singleWidth, singleHeight, ix, 0, bb, this.randomOffsets[i]));
            ix++;
        }

        push();
        noFill();
        translate(LHBounds.x, LHBounds.y)
        rect(0, 0, RHBounds.x-LHBounds.x, RHBounds.y - LHBounds.y)
        pop();
    }

    /**
     * Place the pointer vertically under and towards the desired value on the progress bar
     * @param {any} value The score value to set the pointer at 
     */
    markPointer(value){
        if (typeof(value) == 'string'){
            value = parseInt(value);
        }
        let block = this.progressBlocks.filter(pb => pb.index == value)[0]
        push();
        fill('rgba(255, 134, 0, 1)')
        // noStroke();
        strokeWeight(Math.floor(0.001171875 *width)); // ~3
        let trDims = {sm: Math.floor(0.0058594*width), md: Math.floor(0.009765625*width), lg: Math.floor(0.02734375*width)} // 15, 25, 70
        // translate(block.centreX, this.position.y + block.dims.y*1.25);
        translate(block.centreX, this.position.y*2);
        circle(0, 0, width*0.01953125)
        pop();
    }

    showTransitionArrow(start, target){
        if (start == target) {return}
        this.transitionArrowOpacity = 1;
        let startBlock = this.progressBlocks.filter(pb => pb.index == start)[0]
        let targetBlock = this.progressBlocks.filter(pb => pb.index == target)[0]
        this.transitionArrow = {A: startBlock, B: targetBlock};
        this.setTransitionArrow();
        this.showTransition = true;
    }

    setTransitionArrow(){
        // show a transition arrow between blocks A and B (input params)
        let A = this.transitionArrow.A;
        let B = this.transitionArrow.B;
        const baseY = this.position.y + A.dims.y/4
        const triangleStartX = (B.centreX - A.centreX)
        // const baseY = 1000
        push();
        noStroke();
        fill(`rgba(255, 134, 0, ${this.transitionArrowOpacity})`)
        translate(A.centreX, baseY)
        if (B.centreX > A.centreX){
            rect(0, A.dims.y/8, (B.centreX - A.centreX)-A.dims.x/2, A.dims.y/4)
            triangle(
                triangleStartX - A.dims.x/2, 0, 
                triangleStartX - A.dims.x/2, A.dims.y/2, 
                triangleStartX, A.dims.y/4)
        } else {
            rect(0, A.dims.y/8, (B.centreX - A.centreX)+A.dims.x/2, A.dims.y/4)
            triangle(
                    triangleStartX + A.dims.x/2, 0, 
                    triangleStartX + A.dims.x/2, A.dims.y/2, 
                    triangleStartX, A.dims.y/4)
        }
        
        pop();
    }

    clearArrow(){
        this.transitionArrowOpacity = 0;
        this.showTransition = false;
    }

    /**
     * Update dimensions and position if screen-size changes
     */
    update(){
        this.position = createVector(this.initPos.x*width/100, this.initPos.y*height/100);
        this.progressBlocks = [];
        this.buildProgressBar()
    }

    /**
     * Renderer for all blocks defined by this.buildProgressBar(), and the pointer. Note that we can swap whether the progress bar or the pointer is used for target/score respectively in here by changing the scores stored in `onPb` and `onPointer`.
     */
    draw() {
        let onPb = player.round.target;
        let onPointer = player.round.score;
        if (onPb == undefined) {onPb = 0}
        if (onPointer == undefined) {onPointer = 0}
        this.progressBlocks.forEach(pb => pb.draw(onPb));
        this.markPointer(onPointer)
        // Display an arrow showing the transition between scores that just occurred, and slowly fade it out
        if (this.showTransition) {
            this.setTransitionArrow();
            this.transitionArrowOpacity -= 0.005;
            if (this.transitionArrowOpacity <= 0){
                this.transitionArrowOpacity = 0
                this.showTransition = false;
            }
        }
    }
}

/**
 * The individual units that make up the progress bar, and display a specific score value which the player can use when all blocks are lined up.
 * @param {number} x The x-position of the top-left corner of this block in pixels
 * @param {number} y The y-position of the top-left corner of this block in pixels
 * @param {number} w The width of this block in pixels
 * @param {number} h The height of this block in pixels
 * @param {number} index A unique index for this block to make it identifiable within the progress bar
 * @param {Array<number>} bounds An array containing the upper and lower score bounds, as [upper, lower]
 * @param {any} score The current score (player or target) to be displayed as a series of coloured blocks by the progress bar
 */
class Block{
    constructor(x, y, w, h, index, score, bounds, randomOffset){
        this.position = createVector(x, y);
        this.dims = createVector(w, h)
        this.index = index;
        this.score = score;
        this.bounds = bounds;
        this.centreX = x;
        this.defaultColour = "rgba(241, 242, 246, 1)";
        this.positiveColour = 'rgba(97, 255, 126, 1)';
        this.negativeColour = 'rgba(214, 40, 57, 1)';
        this.zeroColour = 'rgba(39, 24, 126, 1)';
        // this.randomOffset = _.range(4).map(i => random(-12, 12));
        // this.randomOffset = _.range(4).map(i => random(0, 0));
        this.randomOffset = randomOffset
        this.textColour = 'black';
        this.textSizeRatio = 0.01796875; // Equivalent to font-size 46 on 2560x1315 screen
    }

    /**
     * Determine the colour of this block in the progress bar using the current score. Positive scores are coloured with this.positiveColour, negative with this.negativeColour.
     */
    getColour(){
        if (this.score == this.index){
            if (this.index > 0){
                this.colour = this.zeroColour;
            } else if (this.index < 0){
                this.colour = this.zeroColour;
            } else if (this.index == 0){
                this.colour = this.zeroColour;
            }
        } else {
            this.colour = this.defaultColour;
        }
    }

    /**
     * Render loop that draws this specific block. Together, all blocks make up the progress bar. Colour is set based on current score (target or player, depending on global settings).
     * @param {number} score the score being displayed on the progress bar. If score is > (for +ve) or < (for -ve) than score, it will adopt a colour, otherwise be neutral.
     */
    draw(score){
        this.score = score;
        this.getColour();
        push();
        translate(this.position.x, this.position.y);
        fill(this.colour);
        // noStroke();
        strokeWeight(3);
        beginShape();
        vertex(-this.dims.x/2, 0);
        vertex(this.dims.x/2, 0)
        vertex(this.dims.x/2, this.dims.y)
        vertex(-this.dims.x/2, this.dims.y)
        vertex(-this.dims.x/2, 0);
        endShape(CLOSE);
        textSize(Math.floor(this.textSizeRatio*width));
        let t = ''
        this.index > 0 ? t = `+${this.index}` : t = `${this.index}`;
        // if ( (this.index >= 0) && (this.score > 0) && (this.index <= this.score)  ) {
        //     fill('white')
        // } else if ( (this.index <= 0) && (this.score < 0) && (this.index >= this.score) ) {
        //     fill('white')
        // } else if (this.score == 0 && this.index == 0) {
        //     fill('white')
        // } else {
        //     fill('black')
        // }
        // this.index == this.score ? fill('white') : fill('black');
        fill('black')
        text(t, this.dims.x/6, 4*this.dims.y/3)
        // text(t, 0, 4*this.dims.y/3)
        pop();
    }
}