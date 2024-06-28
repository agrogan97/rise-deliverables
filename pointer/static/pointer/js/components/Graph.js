/** 
* Module for constructing a graph of connected GNodes
* @summary A graph instance can be constructued from a config file, which allows levels to be designed in advance and saved in a reproducable way.
* @param {number} x - x-boundary of the graph as a % of the total screen width from the LHS boundary
* @param {number} y - y-boundary of the graph as a % of the total screen height from the upper boundary
*/
class Graph {
    constructor(x, y){
        this.rawPosition = createVector(x, y);
        this.position = createVector(width*(this.rawPosition.x/100), height*(this.rawPosition.y/100));
        this.endPosition = createVector(width*0.9, height*0.9);
        this.nodeList = [];
        this.nodes = {}
        this.nodes.nodeList = [];

        // Styles
        this.connectionColourDefault = "rgba(50, 50, 62, 1)";
        this.connectionColourHighlight = "rgba(213, 100, 100, 1)";
        this.connectionWeightDefault = 5;
        this.connectionWeightHighlight = 8;

        // Whether the real or decoy paths are solid/dashed should be random per game, so assign on graph construction
        [this.realPath, this.decoyPath] = _.shuffle(['solid', 'dashed'])

        this.update();

    }

    /** 
    * @summary Constructs a graph from a provided config file. This sets the `nodes` attribute, and creates GNode object instances that store their connection IDs, connection references, and concept function type.
    * @param {Object} config - a config file as JSON. Requires the keys: `target`, `distractorA`, `distractorB`, `start`, and `end`.
    * @param {boolean} apply - a flag to tell the drawing loop that the graph is ready to be drawn.
    */
    setConfig(config, apply=true){
        // --- Updated version for new config files ---
        // Make empty nodes object ready to populate with GNodes
        this.nodes = {
            curriculumLevel: config.curriculumLevel,
            difficultyLevel: config.difficultyLevel,
            id : config.givenName,
            nodeList : [],
            scores : {
                start : config.scores.start,
                target : config.scores.goal,
                all : config.scores.all,
            },
            start : undefined,
            end : undefined
        }

        // Add all nodes to the nodeList
        config.nodes.forEach(node => {
            this.nodes.nodeList.push(new GNode(node.id, node.concept, node.connections, node.level))
        })

        // Set start and end as easily grabbable values
        this.nodes.start = this.nodes.nodeList[0];
        this.nodes.end = this.nodes.nodeList[this.nodes.nodeList.length-1];

        // Arrange nodes in triangle pattern
        this.positionNodes(this.nodes);

        // Create array for each that stores connections as objects too, to reduce work done in the draw loop
        this.nodes.nodeList.forEach(node => {
            node.connectionRefs = [];
            node.connections.forEach(conn => {
                let foundConns = this.nodes.nodeList.filter(nl => nl.id==conn)
                foundConns.length == 1 ? node.connectionRefs.push(foundConns[0]) : new Error(`Trying to find connection node with id: ${conn} - found either None, or multiple. Please check level config file.`)
            })
        })

        // Store raw config
        this.config = config;
        this.apply = apply;

    }

    /**
     * Restart the current level, keeping the existing level configuration and positions, and restoring all previous connections. Called from within global restart() function.
     */
    restartWithConfig(){
        this.setConfig(gg.curriculum[player.gameState.round])
        this.nodes.nodeList.forEach(n => n.setImage());
    }

    /** 
    * Set positions for each of the nodes on the screen, with some constraints applied.
    * @summary Nodes are placed in tree-structures where number of rows increases with level difficulty, and number of columns increases with row. This method assigns positions to nodes based on the tree structure (thus level) and the size of the node-list.
    * @param {Array<GNode>} nodes this.nodes object, created from running this.setConfig. Contains all the information including level difficulty (for building correct treet structure)
    */
    positionNodes(nodes){
        // nodes is the this.nodes object, so we have ID etc attached too
        /*
        {
            "id" : "level_0_n_0",
            "nodes":[
                {"id":"start","connections":["2","3"],"concept":"start"},
                {"id":"2","connections":["1","4","5"],"concept":"B"},
                {"id":"3","connections":["1","5","6"],"concept":"N"},
                {"id":"4","connections":["2","7"],"concept":"A"},
                {"id":"5","connections":["2","3","7"],"concept":"D"},
                {"id":"6","connections":["3","7"],"concept":"D"},
                {"id":"end","connections":["4","5","6"],"concept":"end"}],

            "scores":{
                "start": 0,
                "goal": 1,
                "all": [
                    {
                        "path":["1","2","4","7"],
                        "score":1
                    },
                    {
                        "path":["1","2","5","7"],
                        "score":0
                    },
                    {
                        "path":["1","3","5","7"],
                        "score":0
                    },
                    {
                        "path":["1","3","6","7"],
                        "score":0
                    }
                ]
            }
        }
        */

        // Layout is based on level
        // const treeStructures = {
        //     1 : [1, 2, 1],
        //     2 : [1, 3, 1],
        //     3 : [1, 2, 3, 1],
        //     4 : [1, 3, 4, 1],
        //     5 : [1, 2, 3, 4, 1]
        // }
        // const structure = treeStructures[nodes.difficultyLevel]; // this may have to change in the future, but keeping it like this for piloting

        
        // Format the tree structure from the rows entry in nodes.nodeList
        let treeStructure = nodes.nodeList.map(node => node.row)
        let structureSet = {}
        // This creates a set of number of unique entries, like Counter in Python
        for (let i=0; i<treeStructure.length; i++){
            structureSet[treeStructure[i]] = 1 + (structureSet[treeStructure[i]] || 0);
        }
        let structure = Object.values(structureSet);


        // Allocate space according to number of rows and size of max row in specific tree structure
        const spacing = createVector(
            (this.endPosition.x - this.position.x)/(_.max(structure)+1),
            (this.endPosition.y - this.position.y)/(structure.length+1)
        )

        let nodeCount = 0;

        structure.forEach((row, ix) => {
            // Start at position.x + (endPosition.x-position.x)/2
            let middleX = this.position.x + (this.endPosition.x - this.position.x)/2
            _.range(0, row, 1).forEach(col => {
                // Compute how many need to sit on either side of the center line - eg. for nCol = 2, this is nCol/2 = 1, or nCol = 3, nCol/3 = 1.5
                let onEachSide = row/2;
                // Now if we have 2 cols, we go to the left by onEachSide*spacing.x = 1*spacing.x  -- if it's 3, -1.5*spacing.x, then for each new col, we hadd spacing.x to this
                let baseX = middleX - onEachSide*spacing.x;
                // And apply based on column index
                let pos = createVector(
                    baseX + col*spacing.x,
                    this.position.y + spacing.y*ix*1.5
                )
                nodes.nodeList[nodeCount].setPosition(pos);
                nodeCount++;
            })
        })
    }


    /**
     * Resize graph for changing screen size - including all nodes and node images
     */
    update(){
        this.position = createVector(width*(this.rawPosition.x/100), height*(this.rawPosition.y/100));
        this.endPosition = createVector(width*0.9, height*0.9);
        this.nodes.nodeList.forEach(n => n.update())
    }

    /** 
    * @summary Render loop to draw the graph on screen and apply stroke weight/colour for current player position and dashed/solid lines for decoy/non-decoy 
    * @param {ParamDataTypeHere} parameterNameHere - Brief description of the parameter here. Note: For other notations of data types, please refer to JSDocs: DataTypes command.
    * @return {ReturnValueDataTypeHere} Brief description of the returning value here.
    */
    draw(){
        
        // Draw each of the connections between the nodes according to their connections
        this.nodes.nodeList.forEach(node => {
            // Add lines between this node and all nodes in node.connections
            let pos = node.position
            push();
            translate(pos.x, pos.y)
            node.connectionRefs.forEach((conn, ix) => {
                stroke(this.connectionColourDefault);
                strokeWeight(this.connectionWeightDefault);
                line(0, 0, conn.position.x - pos.x, conn.position.y - pos.y)
            })
            pop();
        })

        // Draw each of the nodes on the graph
        if (this.apply){
            this.nodes.nodeList.forEach(n => n.draw());
        }
    }
}