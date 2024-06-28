function handleMovement(key){
    if (!player.canMove){
        // console.log(player.canMove); 
        return
    }

    let pos = player.position
    const dirMap = {up : -1, down : +1, left: -1, right: +1};
    const dimMap = {up : 'y', down: 'y', left: 'x', right: 'x'};
    let allowed = false;
    let timestamp = Date.now()
    // Handler for mapping key-press to movement direction. Updates function-level variable `pos` in the process.
    const step = (key) => {
        toggleChar(pos, 'hide');
        pos[dimMap[key]] += dirMap[key];
        toggleChar(pos, 'show');
        allowed = true;
    }

    const preview = (key) => {
        // Check to see what would be at the next step: eg. wall, door, etc.
        let nextPos = ((key == "up" || key == "down") ? {x: pos.x, y: pos.y + dirMap[key]} : {x: pos.x + dirMap[key], y: pos.y});
        if (isOutOfBounds(nextPos)) return {'wall' : true, 'door' : false, 'nextTool' : 'none', 'lock' : false, 'nextPos' : nextPos}
        return {'wall' : isWall(nextPos), 'door': isDoor(nextPos), 'lock' : board.grid[nextPos.y][nextPos.x].isLock, 'nextTool': board.grid[nextPos.y][nextPos.x].type, 'nextPos' : nextPos}
    }

    let tool = "none";
    let next = preview(key)

    // Checks for bounds and walls
    if (key == "up" && pos.y > 0){
        let next = preview(key)
        if (!next.wall) {
            if (next.door && !checkKey(next.nextTool)){}
            else {
                step("up");
                tool = useTool(pos, key);
            }
        } else if (next.wall && next.lock) {
            // Use lever
            tool = useTool(next.nextPos, key)
        }
    } else if (key == "down" && pos.y < game.parameters.numrows-1) {
        let next = preview(key)
        if (!next.wall) {
            if (next.door && !checkKey(next.nextTool)){}
            else {
                step("down");
                tool = useTool(pos, key);
            }
        } else if (next.wall && next.lock) {
            // Use lever
            tool = useTool(next.nextPos, key)
        }
    } else if (key == "left" && pos.x > 0){
        let next = preview(key)
        if (!next.wall) {
            if (next.door && !checkKey(next.nextTool)){} 
            else {
                step("left");
                tool = useTool(pos, key);
            }
        } else if (next.wall && next.lock) {
            // Use lever
            tool = useTool(next.nextPos, key)
        }
    } else if (key == "right" && pos.x < game.parameters.numcols-1){
        let next = preview(key)
        if (!next.wall) {
            if (next.door && !checkKey(next.nextTool)){
                // do nothing
            } else {
                step("right");
                tool = useTool(pos, key);
            }
        } else if (next.wall && next.lock) {
            // Use lever
            tool = useTool(next.nextPos, key)
        }
    }

    let response = {};
    response.allowed = allowed;
    response.direction = key;
    response.timestamp = timestamp;
    response.xloc = pos.x;
    response.yloc = pos.y;
    response.tool = board.grid[pos.y][pos.x].type;
    player.saveResponse(response)

    // and do a second update if we use a teleporter or catapult
    if (tool.startsWith('t') || tool.startsWith('c') || tool.startsWith('p')){
        let response = {};
        response.allowed = allowed;
        response.direction = key;
        response.timestamp = timestamp;
        response.xloc = pos.x;
        response.yloc = pos.y;
        response.tool = board.grid[pos.y][pos.x].type;
        player.saveResponse(response)
    }
    if (board.grid[player.position.y][player.position.x].isGoal){
        // goal state
        player.canMove = false;
        player.saveRound(true);
        game.timeoutId = setTimeout(function() {
            nextRound()
                .then(() => player.canMove = true)
        }, game.parameters.intersitialLength);
        showIntersitial();
    }
}

function useTool(pos, key){
    let tool = board.grid[pos.y][pos.x].type;
    let isGrabbed = board.grid[pos.y][pos.x].grabbed;
    const dirMap = {up : -1, down : +1, left: -1, right: +1};
    if (tool == "none"){return tool}
    // Decrease opacity while stood on tool
    board.obj[pos.y][pos.x].object.attr({"opacity":.2});

    if (tool.startsWith('t') && !isGrabbed){
        // -- Teleporter --
        // Find the matching teleporter elsewhere on the board
        let tPair = {};
        for (let i=0; i<game.parameters.numrows; i++){
            for (let j=0; j<game.parameters.numcols; j++){
                if (board.rooms[i][j] == tool && (!_.isEqual([i, j], [pos.y, pos.x]))){
                    tPair = {x: j, y: i};
                }
            }
        }
        if (_.isEqual(tPair, {})){return tool}
        // Update player position to new teleporter position
        toggleChar(player.position, 'hide')
        board.grid[pos.y][pos.x].grabbed = true;
        player.position = {x: tPair.x, y: tPair.y}
        board.grid[player.position.y][player.position.x].grabbed = true;
        hideTool(player.position);
        toggleChar(player.position, 'show')
    } else if (tool.startsWith('k') && !isGrabbed){
        // -- Key --
        player.hasKey = tool;
        board.grid[pos.y][pos.x].grabbed = true
        hideTool(player.position);
    } else if (tool.startsWith('d')){
        // -- Door --
        player.hasKey = false;
        board.grid[pos.y][pos.x].isWall = true;
    } else if (tool.startsWith('c')){
        // -- Catapult --
        // If repeating the last move would lead to a wall, then move is valid by definition
        let nextPos = ((key == "up" || key == "down") ? {x: pos.x, y: pos.y + dirMap[key]} : {x: pos.x + dirMap[key], y: pos.y});
        board.grid[pos.y][pos.x].grabbed = true
        if (isWall(nextPos) && !isGrabbed){
            // change position to the one after the next
            let catapultedPosition = ((key == "up" || key == "down") ? {x: nextPos.x, y: nextPos.y + dirMap[key]} : {x: nextPos.x + dirMap[key], y: nextPos.y});
            toggleChar(player.position, 'hide');
            player.position = {x: catapultedPosition.x, y: catapultedPosition.y};
            toggleChar(player.position, 'show');
        }
    } else if (tool.startsWith('p') && !isGrabbed && player.hasLock){
        // portal
        // If the player has collected an 'L' with the corresponding number suffix then this acts as a teleporter to the connected p tool
        // Find the matching portal elsewhere on the board
        let tPair = {};
        for (let i=0; i<game.parameters.numrows; i++){
            for (let j=0; j<game.parameters.numcols; j++){
                // If tool type is the same, we're not on the same spot, and lever suffix matches portal suffix
                if (board.rooms[i][j] == tool && (!_.isEqual([i, j], [pos.y, pos.x])) && checkLever(tool)){
                    tPair = {x: j, y: i};
                }
            }
        }
        // Return if we haven't found anything
        if (_.isEqual(tPair, {})){return tool}
        // Update player position to new portal position
        toggleChar(player.position, 'hide')
        board.grid[pos.y][pos.x].grabbed = true;
        player.position = {x: tPair.x, y: tPair.y}
        board.grid[pos.y][pos.x].grabbed = true;
        player.hasLock = false;
        hideTool(player.position);
        toggleChar(player.position, 'show')
    } else if (tool.startsWith('l') && !isGrabbed){
        // lock
        // The player has to 'bump into' the lock tool to collect it, but it acts like a wall and isn't passible
        board.grid[pos.y][pos.x].isWall = true;
        board.grid[pos.y][pos.x].grabbed = true;
        player.hasLock = tool;
        hideTool({x: pos.x, y: pos.y});
    }

    return tool
}

function hideTool(pos){
    board.obj[pos.y][pos.x].object.attr({"opacity": 0.2});
    board.obj[pos.y][pos.x].grabbed = true;
}

function checkKey(tool){
    // Key/door rules. Includes checking if:
    //  a) player has a key
    //  b) player has the key that matches this door
    // Returns true if this is a valid door for the player's key
    return ((player.hasKey != false) && (player.hasKey.endsWith(tool[tool.length-1])));
}

function checkLever(tool){
    // returns true if the pulled lever matches the attempted portal
    console.log(player.hasLock, tool, _.isEqual(player.hasLock.substring(1), tool.substring(1)))
    return ((player.hasLock != false) && (_.isEqual(player.hasLock.substring(1), tool.substring(1))))
}