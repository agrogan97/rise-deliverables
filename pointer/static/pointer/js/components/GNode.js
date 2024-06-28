/**
 * Individual graph node (GNode) with node-specific attributes and methods. Allows us to change node image and function easily.
 * @param {number} id the uid of this node. Typically a combination of path type (dA, dB, t) and number in chain (1, 2, 3) etc. - may also be "start" or "end"
 * @param {string} concept The concept type attached to this node. Must be one of: "A", "B", "C", "D", "N", or "end". "N" represents a Neutral state which performs no function. "end" represents the terminal state. Note that references are also made to "player" and "playerPickup" - the first is used to replace a node image with the character image to show position, and the latter refers to a gif from the statis assets list that plays when a player collects an object. "player" and "playerPickup" are not used as inputs.
 * @param {Array<number>} connections An array of IDs of the other nodes that this node is connected to.
 * @param {string} row The row number on the tree structure this sits on. Included to prevent backtracking.
 */
class GNode{
    constructor(id, concept, connections, row){
        this.id = id
        this.concept = concept
        this.connections = connections
        this.connectionRefs = [];
        this.showAnimation = false;
        this.row = row

        // Set rules for game concepts
        this.GAME_CONCEPTS = {
            // NB: References to `this` won't be available outside of the game object
            A : function(s) {
                // console.log(`__plus_one__`)
                return s + 1  // Add 1 to the score
            },
            B : function(s) {
                // console.log(`__*-1__`)
                return s * (-1) // Flip the sign of the score
            },
            C: function(s=undefined) {
                // console.log(`__*2__`)
                return 2 * s // Multiply by 2
            },
            D : function(s) {
                // console.log(`__to_0__`)
                return 0
                // below: to reset to starting score
                try {
                    return graph.config.scores.start // Reset to 0
                } catch (error) {
                    return 0
                }
            },
            N : function(s) {
                return s // Nothing
            },
            end : function(s) {
                return s
            },
            end_complete : function(s) {
                return s
            },
            start : function(s) {
                return s
            }
        }

        // node image mapping
        this.imgMap = {
            'N' : game.roomImageOptions[0],
            'A' : game.roomImageOptions[1],
            'B' : game.roomImageOptions[2],
            'C' : game.roomImageOptions[3],
            'D' : game.roomImageOptions[4],
            'end' : assets["graphics"]["dropoff_grey"],
            'end_complete' : assets["graphics"]["dropoff"],
            'player' : assets["graphics"]["character"],
            'playerPickup' : assets["graphics"]["pickup"]
        }

        // Apply the image from the given concept
        this.setImage();

        // Checks if it's a transfer and if so loads the transfer set
        this.updateImgsForTransfer();
        
        // Assign the 'click radius' - i.e. the pixel radius around the central position where a click will register
        this.clickRadius = (this.img.img.width+this.img.img.height)/2;

        this.action = this.GAME_CONCEPTS[this.concept]
    }

    /**
     * Setter for connections array. Updates `this.connections`.
     * @param {Array<number} connections See class parameter `connections`
     */
    setConnections(connections){
        this.connections = connections
    }

    updateImgsForTransfer(){
        if (game.isTransfer()){
            this.imgMap['N'] = game.roomImageOptionsTransfer[0];
            this.imgMap['A'] = game.roomImageOptionsTransfer[1];
            this.imgMap['B'] = game.roomImageOptionsTransfer[2];
            this.imgMap['C'] = game.roomImageOptionsTransfer[3];
            this.imgMap['D'] = game.roomImageOptionsTransfer[4];
        }

        this.setImage();
    }

    /**
     * Utility method to filter out a specific connection from this.connections.
     * @param {number} id ID of the node to be removed
     */
    removeConnection(id){
        this.connections = this.connections.filter(i => i!=id)
    }

    /**
     * Remove this node as a connection from all currently connected nodes (eg if nodes 1 and 2 are connected, node2.clearConnections() will remove 2 as a connection from node 1, and also from node 2), and set `this.connections` and `this.connectionRefs` as empty arrays.
     */
    clearConnections(){
        // Remove all this node connections to and from
        this.connectionRefs.forEach(n => {
            // Remove reference to this.id from all connections
            n.connections = n.connections.filter(i => i!=this.id);
            n.connectionRefs = n.connectionRefs.filter(i => i!=this);
        })
        this.connections = [];
        this.connectionRefs = [];
    }

    /**
     * Set `this` as the current player node. Update image to show character image, and update current node in `player` using `player.update()` method.
     */
    makePlayerNode(){
        /*
        Make this the current player node, both visually by putting the character on it, and in player.gameState
        */
        this.originalConcept = this.concept
        this.concept = "player";
        this.img = new p5Image(this.imgMap["player"], 0, 0);
        player.updatePlayerIndex(this);
    }

    /**
     * Position setter method. Also calculates raw position as percentage for updating on screensize change
     * @param {p5.Vector<number>} pos Screen position in pixels. Updates `this.position`.
     */
    setPosition(pos){
        this.position = pos
        this.rawPosition = createVector(pos.x*100/width, pos.y*100/height)
    }

    /**
     * Update positioning based on changing screen size.
     */
    update(){
        this.position = createVector(width*(this.rawPosition.x/100), height*(this.rawPosition.y/100));
        this.img.update();
    }

    /**
     * Return a node to a neutral (default) state. This removes the attached function, and sets the image to the neutral image. It then calls the class method `clearConnections()`.
     */
    setToDefault(){
        /*
        After a node has been visited, we want to remove the attached function and set it to default
        This will clear the image and the attached concept function to make it neutral and unconnected
        */

        // If it's the start node, make it neutral once the player leaves. If not, keep the original image (so players can see what they've done)

        if (this.concept == "start"){
            this.img = new p5Image(this.imgMap['N'], 0, 0);
        } else {
            this.img = new p5Image(this.imgMap[this.originalConcept], 0, 0);
        }

        this.clearConnections();
    }

    /**
     * Refreshes all node images to match their initial config file concept descriptions. Useful for level restarts.
     */
    setImage(){
        if (this.concept == 'start'){
            this.img = new p5Image(this.imgMap["player"], 0, 0);
        } else {
            try {
                this.img = new p5Image(this.imgMap[this.concept], 0, 0);
            } catch (error) {
                console.log(this.concept)
            } 
        }
        // this.img = new p5Image(this.imgMap[this.concept], 0, 0)
    }

    /**
     * Update image to match the current concept (as this.concept). Useful for changing between greyed-out and coloured endstates
     */
    updateImage(){
        this.img = new p5Image(this.imgMap[this.concept], 0, 0)
    }
     
    /**
     * Play the pickup animation by setting the current image to "playerPickup", which references the gif stored in the asset array under "pickup". Also creates a timeout, so that after 1 second, `this.stopPickupAnimation()` is called.
     */
    playPickupAnimation(){
        this.showAnimation = true;
        this.startTime = millis();
        this.img = new p5Image(this.imgMap["playerPickup"], 0, 0)
        setTimeout(function(){this.stopPickupAnimation()}.bind(this), 1000);
    }

    /**
     * Stop the currently playing animation. If no animation is playing, it simply resets the current image to be the one associated with the current concept.
     */
    stopPickupAnimation(){
        this.img = new p5Image(this.imgMap["player"], 0, 0);
        this.showAnimation = false;
    }

    /**
     * Render instructions for p5js, including calls to render the node image, scaled down to 50% of the original size.
     */
    draw(){
        let pos = this.position;
        push();
        translate(pos.x, pos.y);
        scale(0.5);
        this.img.draw();
        pop();
    }
}