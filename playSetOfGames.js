var playSetOfGames = function() {
    var games = [
        ["U4","R4","D4","U4","S2","L4","D2","R2","D2","S10"],
        ["U4","R4","D4","S2","U2","L2","D2","S10"],
        ["U4","R4","D2","S2","D2","U4","L2","S10"],
        ["U4","S2","R4","D4","U2","L2","D2","U2","L2","S10"],
        ["U4","R4","D2","S7","U2","L4","D2","S6","R2","D2","S10"],
        ["U4","R4","D4","U2","S2","U2","L4","S4","D4","U2","R2","D2","U2","L2","U2","R4","S10"]
    ]
    
    var winner = {}

    for (var i = 0; i < games.length; i++) {
        var result = []
        playGame(games[i], result)
        if (result[0] == 'no') {
            if (!winner.index) replaceWinner(winner, i, result)
            else if (result[1] > winner.score) replaceWinner(winner, i, result)
            else if (result[1] == winner.score && result[2] < winner.time) replaceWinner(winner, i, result)
        }
    }

    return winner
}

var replaceWinner = function(winner, index, result) {
    winner.index = index
    winner.score = result[1]
    winner.time = result[2]
    winner.location = result[3]
}


var playGame = function(moves, result) {
    var walls = ["0,0-6,0","0,0-0,6","6,0-6,6","0,6-6,6","2,1-2,2","4,1-4,2","2,4-4,4"]
    var treasures = ["3,1:10","5,1:20"]
    var guards = ["3,3"]

    var wallsObj = buildWalls(walls)
    var treasuresObj = buildTreasures(treasures)
    var guardsObj = buildGuards(guards)
    
    var coords  = [1, 1]
    var time = [0, 0]
    var wallsHit = 0
    var score = 0

    for (var i = 0; i < moves.length; i++) {
        var direction = moves[i][0]
        var move = Number(moves[i].slice(1))
        var currentX = coords[0]
        var currentY = coords[1]
        if (direction == "S") {
            for (var j = 0; j < move; j++) {
                var check = advanceGuards([currentX,currentY], guardsObj, wallsObj, time)
                if (check) {
                    caught(result)
                    return false
                }
            }
            continue
        }
        if (direction == "R") {
            var destX = currentX + move
            var destY = currentY
            movingCoord = 0
            positive = true
        }
        else if (direction == "L") {
            var destX = currentX - move
            var destY = currentY
            movingCoord = 0
            positive = false
        }
        else if (direction == "U") {
            var destX = currentX
            var destY = currentY + move
            movingCoord = 1
            positive = true
        }
        else {
            var destX = currentX
            var destY = currentY - move
            movingCoord = 1
            positive = false
        }
        if (movingCoord) {
            while(currentY != destY) {
                if (positive) {
                    if (wallsObj[currentX] && wallsObj[currentX].includes(currentY + 1)) {
                        var currentWallsHit = destY - currentY
                        wallsHit+=currentWallsHit
                        break
                    }
                    currentY++
                    var check = advanceGuards([currentX,currentY], guardsObj, wallsObj, time)
                    if (check) {
                        caught(result)
                        return false
                    }
                }
                else {
                    if (wallsObj[currentX] && wallsObj[currentX].includes(currentY - 1)) {
                        var currentWallsHit = -1 * (destY - currentY)
                        wallsHit+=currentWallsHit
                        break
                    }
                    currentY--
                    var check = advanceGuards([currentX,currentY], guardsObj, wallsObj, time)
                    if (check) {
                        caught(result)
                        return false
                    }
                }
                var check = checkForGuards([currentX,currentY], guardsObj, wallsObj)
                    if (check) {
                        caught(result)
                        return false
                    }
                if (treasuresObj[currentX] && treasuresObj[currentX][currentY]) {
                    score+=treasuresObj[currentX][currentY]
                    time[1] = time[0]
                    delete treasuresObj[currentX][currentY]
                }
            }
            coords[movingCoord] = currentY
        }
        else {
            while(currentX != destX) {
                if (positive) {
                    if (wallsObj[currentX + 1] && wallsObj[currentX + 1].includes(currentY)) {
                        wallsHit+=(destX - currentX)
                        break
                    }
                    currentX++
                    var check = advanceGuards([currentX,currentY], guardsObj, wallsObj, time)
                    if (check) {
                        caught(result)
                        return false
                    }
                }
                else {
                    if (wallsObj[currentX - 1] && wallsObj[currentX - 1].includes(currentY)) {
                        wallsHit+=(destX - currentX)
                        break
                    }
                    currentX--
                    var check = advanceGuards([currentX,currentY], guardsObj, wallsObj, time)
                    if (check) {
                        caught(result)
                        return false
                    }
                }
                var check = checkForGuards([currentX,currentY], guardsObj, wallsObj)
                    if (check) {
                        caught(result)
                        return false
                    }
                if (treasuresObj[currentX] && treasuresObj[currentX][currentY]) {
                    score+=treasuresObj[currentX][currentY]
                    time[1] = time[0]
                    delete treasuresObj[currentX][currentY]
                }
            }
            coords[movingCoord] = currentX
        }
    }
    endGame([currentX,currentY], time, score, result)
    return true

};

var buildWalls = function(walls) {
    var wallsObj = {}

    for (var i = 0; i < walls.length; i++) {
        wall = walls[i].split("-")
        start = wall[0].split(",")
        end = wall[1].split(",")
        
        var y = Number(start[1])
        if (start[0] == end[0]) {
            for (var j = y; j <= Number(end[1]); j++) {
                if (wallsObj[start[0]]) {
                    if (!wallsObj[start[0]].includes(j)) wallsObj[start[0]].push(j)
                } 
                else wallsObj[start[0]] = [j]
            }
        }
        else {
            for (var j = Number(start[0]); j <= Number(end[0]); j++) {
                if (wallsObj[j]) {
                    if (!wallsObj[j].includes(y)) wallsObj[j].push(y)
                }
                else wallsObj[j] = [y]
            }
        }
    }
    return wallsObj
}

var buildTreasures = function(treasures) {
    var treasuresObj = {}

    for (var i = 0; i < treasures.length; i++) {
        treasureX = Number(treasures[i].split(":")[0].split(",")[0])
        treasureY = Number(treasures[i].split(":")[0].split(",")[1])
        treasureVal = Number(treasures[i].split(":")[1])
        if (!treasuresObj[treasureX]) treasuresObj[treasureX] = {}
        treasuresObj[treasureX][treasureY] = treasureVal
    }

    return treasuresObj
}

var buildGuards = function(guards) {
    var guardsObj = []

    for (var i = 0; i < guards.length; i++) {
        x = Number(guards[i].split(",")[0])
        y = Number(guards[i].split(",")[1])
        guard = { x, y, direction: "S", move: 0 }
        guardsObj.push(guard)
    }

    return guardsObj
}

var checkForGuards = function(currentCoords, guardsObj, wallsObj) {
    for (var i = 0; i < guardsObj.length; i++) {
        guard = guardsObj[i]
        if (currentCoords[0] != guard.x && currentCoords[1] != guard.y) continue
        if (currentCoords[0] == guard.x && currentCoords[1] == guard.y) return guard
        if (currentCoords[0] == guard.x) {
            if (currentCoords[1] > guard.y) {
                for (var j = currentCoords[1] - 1; j > guard.y; j--) {
                    if (wallsObj[currentCoords[0]] && wallsObj[currentCoords[0]].includes(j)) break
                }
                if (j == guard.y) guard.direction = "U"
            }
            else {
                for (var j = currentCoords[1] + 1; j < guard.y; j++) {
                    if (wallsObj[currentCoords[0]] && wallsObj[currentCoords[0]].includes(j)) break
                }
                if (j == guard.y) guard.direction = "D"
            }
        }
        else {
            if (currentCoords[0] > guard.x) {
                for (var j = currentCoords[0] - 1; j > guard.x; j--) {
                    if (wallsObj[j] && wallsObj[j].includes(currentCoords[1])) break
                }
                if (j == guard.x) guard.direction = "R"
            }
            else {
                for (var j = currentCoords[0] + 1; j < guard.x; j++) {
                    if (wallsObj[j] && wallsObj[j].includes(currentCoords[1])) break
                }
                if (j == guard.x) guard.direction = "L"
            }
        }
    }
    return false
}

var advanceGuards = function(currentCoords, guardsObj, wallsObj, time) {
    time[0]++
    for (var i = 0; i < guardsObj.length; i++) {
        guard = guardsObj[i]
        if (currentCoords[0] == guard.x && currentCoords[1] == guard.y) return guard
        if (guard.direction == "S") continue
        if (!guard.move) {
            guard.move = 1
            continue
        }
        if (guard.direction == "L" || guard.direction == "R") {
            if (guard.direction == "L") guard.x--
            else guard.x++
            if (!wallsObj[guard.x] || !wallsObj[guard.x].includes(guard.y + 1) || !wallsObj[guard.x].includes(guard.y - 1)) {
                guard.direction = "S"
                checkForGuards(currentCoords, guardsObj, wallsObj)
            }
        }
        else {
            if (guard.direction == "D") guard.y--
            else guard.y++
            if (!wallsObj[guard.x + 1] || !wallsObj[guard.x + 1].includes(guard.y) || !wallsObj[guard.x - 1] || !wallsObj[guard.x - 1].includes(guard.y)) {
                guard.direction = "S"
                checkForGuards(currentCoords, guardsObj, wallsObj)
            }
        }
        guard.move = 0
        if (currentCoords[0] == guard.x && currentCoords[1] == guard.y) return guard
    }
    return false
}

var caught = function(result) {
    result.push("yes")
}

var endGame = function(currentCoords, time, score, result) {
    result.push("no")
    result.push(score)
    result.push(time[1])
    result.push(currentCoords)
}
