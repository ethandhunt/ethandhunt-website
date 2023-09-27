dimension = 6

// coordinate things
//  index - index of position in an array
//  coord - array of position, depends on spatial dimensions, annoying
//  vector - p5.Vector, position on gridGraphics, probably better to call gridVec or grid
//  screen - p5.Vector, position on screen after transformations, probably better to call screenVec or screenPos

function coordToIndex(coord) {
    let index = 0
    for (i=0; i<coord.length; i++) {
        index += (coord[i]-1) * 3**i
    }
    return index
}

function indexToCoord(index, d = dimension) {
    let coords = []
    for (let i=0; i<d; i++) {
        coords.push(floor(index/3**i) % 3 + 1)
    }
    return coords
}

function coordToVector(coord) {
    let vec = gridTL.copy()
    for (let i=0; i < coord.length; i += 2) {
        vec.x += 1 + tileSep * tileSepIndexBase ** floor(i/2) * (coord[i]-1)
        vec.y += 1 + tileSep * tileSepIndexBase ** floor(i/2) * (coord[i+1]-1) || 0
    }
    return vec
}

function vectorToScreen(vec) {
    let screenVec = vec.copy()
    screenVec.add(screenOffset)
    screenVec.mult(screenScale)
    return screenVec
}

function screenToVector(vec) {
    // literally just perform inverse transformations in reverse order
    let gridVec = vec.copy()
    gridVec.div(screenScale)
    gridVec.sub(screenOffset)
    return gridVec
}

function screenToCoord(vec) {
    vec = screenToVector(vec)
    xOff = vec.x
    yOff = vec.y

    coord = []
    for (i=dimension-1; i >= 0; i--) {
        if (i%2 == 0) {
            coord.unshift(min(floor(xOff/tileDimXSpacing[floor(i/2)]) + 1, 3))
            xOff %= tileDimXSpacing[floor(i/2)]
        } else {
            coord.unshift(min(floor(yOff/tileDimXSpacing[floor(i/2)]) + 1, 3))
            yOff %= tileDimYSpacing[floor(i/2)]
        }
    }
    return coord
}

function recalculateGridScreenProjections() {
    gridScreenTL = vectorToScreen(gridTL)
    gridScreenBR = vectorToScreen(gridBR)

}

function redrawPieces() {} // implement later

function placePiece(coord, type) {
    boardPieces[coordToIndex(coord)] = type
    if (type < icons.length) {
        vec = coordToVector(coord)
        piecesGraphics.fill(icon_tints[type], 100)
        piecesGraphics.rect(vec.x, vec.y, tileWidth, tileWidth)
        piecesGraphics.image(icons[type], vec.x, vec.y, tileWidth, tileWidth, 0, 0)
    } else {
        vec = coordToVector(coord)
        piecesGraphics.fill(icon_tints[type%icon_tints.length], 100)
        piecesGraphics.rect(vec.x, vec.y, tileWidth, tileWidth)
        piecesGraphics.fill(255)
        piecesGraphics.textSize(tileWidth)
        piecesGraphics.textAlign(CENTER, CENTER)
        piecesGraphics.text(type, vec.x+tileWidth/2, vec.y+tileWidth/2)
    }
}

var piecesGraphics

boardPieces = [] // -1 is blank
var turn

function resetBoard() {
    boardPieces = Array.from({length: 3**dimension}, (v, i) => -1) // [-1, -1,...]

    piecesGraphics = createGraphics(gridBR.x, gridBR.y)
    piecesGraphics.background(0,0)

    turn = 0
}

var gridGraphics

tileDimXSpacing = []
tileDimYSpacing = []

tileWidth = 50
tileSep = tileWidth * 1.2
tileSepIndexBase = 3.2
tileBorderWidth = tileWidth * 0.05
gridTL = new p5.Vector(0,0)
gridBR = new p5.Vector(0,0)
gridScreenTL = new p5.Vector(1,1)
gridScreenBR = new p5.Vector(0,0)
function createGridGraphics() {
    console.log('creating grid graphics...')
    maxi = 3**dimension
    gridBR = new p5.Vector(coordToVector(indexToCoord(maxi-1)).x + tileWidth + 1, coordToVector(indexToCoord(maxi-1)).y + tileWidth + 1)
    

    gridGraphics = createGraphics(gridBR.x, gridBR.y)

    gridGraphics.fill(0,0,0,50)
    gridGraphics.strokeWeight(tileBorderWidth)
    for (let i=0; i < maxi; i++) {
        let vec = coordToVector(indexToCoord(i))
        gridGraphics.square(vec.x, vec.y, tileWidth)
    }

    tileDimXSpacing = Array.from({length: floor(dimension/2 + 0.5)}, (v, i) => 1 + tileSep * tileSepIndexBase ** i)
    tileDimYSpacing = Array.from({length: floor(dimension/2)}, (v, i) => 1 + tileSep * tileSepIndexBase ** i)

    push()
    colorMode(HSB)
    icon_tints = Array.from({length: dimension}, (v,i) => color(i*255/(dimension-1), 255, 255, 0.5))
    pop()

    recalculateGridScreenProjections()
    console.log('created grid graphics')
}

highlightingQueue = []
// {type: 'hover'|'aligned', coord: coord}

function highlighting() {
    for (let i=0; i < highlightingQueue.length; i++) {
        let q = highlightingQueue[i]
        if (q.type == 'hover') {
            push()
            fill(255, 100)
            let vec = vectorToScreen(coordToVector(q.coord))
            rect(vec.x, vec.y, tileWidth*screenScale, tileWidth*screenScale)
            pop()
        } else if (q.type == 'aligned') {
            
        }
    }
}

function resetScale() {// scaling factor of min main canvas dimension
    screenScale = 2*min(width, height)/(gridBR.x + gridBR.y) // mul: gridVec -> screenVec
    recalculateGridScreenProjections()
}

function touchMoved() {
    if (pointers.length !== 1 || pointerUpFlag > 0) return

    screenOffset.add((mouseX-pmouseX)/screenScale, (mouseY-pmouseY)/screenScale)
    recalculateGridScreenProjections()
}

scrollSensitivity = -1/500
function mouseWheel(event) {
    zoomIn(event.delta*scrollSensitivity)
}

zoomBase = 2
function zoomIn(index) {
    // I wrote this
    // I don't really know why it works
    mousePos = new p5.Vector(mouseX, mouseY)

    screenScale *= zoomBase ** index
    screenOffset.add(mousePos.div(screenScale).mult(1 - zoomBase**index))

    recalculateGridScreenProjections()
}

pinchSensitivity = 1/350
function pinchZoom(curr1, curr2, prev1, prev2) {
    // assume pointers don't move in gridspace (except idk how to do midpoint adjustment)

    let index = (Math.abs(curr1.clientX - curr2.clientX) - Math.abs(prev1.clientX - prev2.clientX)) * pinchSensitivity
    screenScale *= zoomBase ** index

    currMid = new p5.Vector(curr1.clientX + curr2.clientX, curr1.clientY + curr2.clientY).div(2)

    screenOffset.add(currMid.div(screenScale).mult(1 - zoomBase**index))
    recalculateGridScreenProjections()

}

// from https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events/Pinch_zoom_gestures
pointers = []
prevPointerPositions = []
pointerTravel = []
prevDiff = -1
function pointerdownHandler(ev) {
    pointers.push(ev)
    prevPointerPositions.push({clientX: ev.clientX, clientY: ev.clientY, pointerId: ev.pointerId})
    pointerTravel.push(0)
}

// problems: pointerId changes after releasing (on mobile), visible when zooming after moving after zooming without taking pointer off canvas
function pointermoveHandler(ev) {
    let index = pointers.findIndex(
        (storedPointer) => storedPointer.pointerId === ev.pointerId
    )
    if (index !== -1) {
        pointerTravel[index] += Math.abs(dist(pointers[index].clientX, pointers[index].clientY, ev.clientX, ev.clientY))
    }
    prevPointerPositions[index] = pointers[index]
    pointers[index] = ev

    if (pointers.length === 2) {
        let currDiff = Math.abs(pointers[0].clientX - pointers[1].clientX)

        if (prevDiff > 0) {
            pinchZoom(pointers[0], pointers[1], prevPointerPositions[0], prevPointerPositions[1])
        }
        prevDiff = currDiff
    }

    if (pointers.length == 0 && pointerUpFlag <= 0) {
        // desktop, cursor movement while mouse isn't pressed
        let mousePos = new p5.Vector(mouseX, mouseY)
        let coord = screenToCoord(mousePos)
        let tileTL = coordToVector(coord)
        let mouseVec = screenToVector(mousePos)

        // remove previous hover highlight
        for (let i=0; i < highlightingQueue.length; i++) {
            if (highlightingQueue[i].type == 'hover') {
                highlightingQueue.splice(i, 1)
                i--
            }
        }

        if (mouseVec.x - tileTL.x < tileWidth &&
            mouseVec.y - tileTL.y < tileWidth &&
            boardPieces[coordToIndex(coord)] === -1) {
                // add new hover highlight
                highlightingQueue.push({type: 'hover', coord: coord})
        }
    }
    pointerUpFlag -= 1
}

travelThreshold = 10
pointerUpFlag = 0 // wait 2 pointermoveHandler events before allowing movement or highlighting
function pointerupHandler(ev) {
    pointerUpFlag = 2
    if (pointers.length === 1 && pointerTravel[0] < travelThreshold) { // piece placement
        // desktop && mobile
        let mousePos = new p5.Vector(mouseX, mouseY)
        let coord = screenToCoord(mousePos)
        let tileTL = coordToVector(coord)
        let mouseVec = screenToVector(mousePos)

        if (mouseVec.x - tileTL.x < tileWidth &&
            mouseVec.y - tileTL.y < tileWidth) {
                if (boardPieces[coordToIndex(coord)] === -1) {
                    // empty piece at coord
                    placePiece(coord, turn)
                    turn += 1
                    turn %= dimension

                    // remove previous hover highlight
                    for (let i=0; i < highlightingQueue.length; i++) {
                        if (highlightingQueue[i].type == 'hover') {
                            highlightingQueue.splice(i, 1)
                            i--
                        }
                    }
                } else {
                    // player piece at coord
                    // highlight this coords aligned positions
                }
            }
    }

    pointercancellishHandler(ev)
}

function pointercancellishHandler(ev) {
    removeEvent(ev)

    if (pointers.length < 2) {
        prevDiff = -1
    }
}

function removeEvent(ev) {
    // Remove pointer from pointers array
    let index = pointers.findIndex(
        (pointers) => ev.pointerId === ev.pointerId,
    )
    pointers.splice(index, 1)
    prevPointerPositions.splice(index, 1)
    pointerTravel.splice(index, 1)
}

var icons = []
function preload() {
    icon_x = loadImage('tictactoe/icon_x.png')
    icon_o = loadImage('tictactoe/icon_o.png')
    icon_delta = loadImage('tictactoe/icon_delta.png')
    icon_nabla = loadImage('tictactoe/icon_nabla.png')
    icons = [
        icon_x,
        icon_o,
        icon_delta,
        icon_nabla
    ]
}

screenScale = 1
screenOffset = new p5.Vector(0,0)
gridOffset = new p5.Vector(0,0)
function setup() {
    createCanvas(windowWidth, windowHeight)
    canvas.onpointerdown = pointerdownHandler;
    canvas.onpointermove = pointermoveHandler;

    canvas.onpointerup = pointerupHandler;

    canvas.onpointercancel = pointercancellishHandler;
    // canvas.onpointerout = pointercancellishHandler;
    // canvas.onpointerleave = pointercancellishHandler;
    createGridGraphics()
    resetScale()
    resetBoard()
    noSmooth()
    textFont('monospace')
}

function imageTransformed(img) {
    image(img, gridScreenTL.x, gridScreenTL.y, gridScreenBR.x - gridScreenTL.x, gridScreenBR.y - gridScreenTL.y, 0, 0)
}

function draw() {
    background(200)
    text(frameCount, 0, 10)
    text(frameRate(), 0, 20)
    text(pointers.length, 0, 30)

    imageTransformed(gridGraphics)
    imageTransformed(piecesGraphics)

    highlighting()
}

var socket = new WebSocket('ws://' + window.location.host + '/wstest')
socket.onopen = function (ev) {
    console.log('socket.onopen', ev)
    socket.send('a')
}
socket.onmessage = function (ev) {
    console.log('socket.onmessage', ev)
}
socket.onclose = function (ev) {
    console.log('socket.onclose', ev)
}