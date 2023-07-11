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

function recalculateGridScreenProjections() {
    gridScreenTL = vectorToScreen(gridTL)
    gridScreenBR = vectorToScreen(gridBR)
}

var gridGraphics
tileWidth = 20
tileSep = tileWidth * 1.2
tileSepIndexBase = 3.2
gridTL = new p5.Vector(0,0)
gridBR = new p5.Vector(0,0)
gridScreenTL = new p5.Vector(1,1)
gridScreenBR = new p5.Vector(0,0)
function createGridGraphics() {
    console.log('creating grid graphics...')
    maxi = 3**dimension
    gridBR = new p5.Vector(coordToVector(indexToCoord(maxi-1)).x + tileWidth + 1, coordToVector(indexToCoord(maxi-1)).y + tileWidth + 1)
    gridGraphics = createGraphics(gridBR.x, gridBR.y)
    gridGraphics.background(0,0) // black, fully transparent
    gridGraphics.fill(0,0,0,50)
    for (let i=0; i < maxi; i++) {
        let vec = coordToVector(indexToCoord(i))
        gridGraphics.square(vec.x, vec.y, tileWidth)
    }

    recalculateGridScreenProjections()
    console.log('created grid graphics')
}

function resetScale() {// scaling factor of min main canvas dimension
    screenScale = 2*min(width, height)/(gridBR.x + gridBR.y) // mul: gridVec -> screenVec
    recalculateGridScreenProjections()
}

function touchMoved() {
    if (pointers.length !== 1) return

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

pinchSensitivity = 1/500
function pinchZoom(curr1, curr2, prev1, prev2) {
    // assume pointers don't move in gridspace

    let index = (Math.abs(curr1.clientX - curr2.clientX) - Math.abs(prev1.clientX - prev2.clientX)) * pinchSensitivity
    screenScale *= zoomBase ** index

    currMid = new p5.Vector(curr1.clientX + curr2.clientX, curr1.clientY + curr2.clientY).div(2)

    screenOffset.add(currMid.div(screenScale).mult(1 - zoomBase**index))
    recalculateGridScreenProjections()

}

// from https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events/Pinch_zoom_gestures
pointers = []
prevPointerPositions = []
prevDiff = -1
function pointerdownHandler(ev) {
    pointers.push(ev)
    prevPointerPositions.push({clientX: ev.clientX, clientY: ev.clientY, pointerId: ev.pointerId})
}

function pointermoveHandler(ev) {
    let index = pointers.findIndex(
        (storedPointer) => storedPointer.pointerId === ev.pointerId
    )
    prevPointerPositions[index] = pointers[index]
    pointers[index] = ev

    if (pointers.length === 2) {
        let currDiff = Math.abs(pointers[0].clientX - pointers[1].clientX)

        if (prevDiff > 0) {
            pinchZoom(pointers[0], pointers[1], prevPointerPositions[0], prevPointerPositions[1])
        }
        prevDiff = currDiff
    }
}

function pointerupHandler(ev) {
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
}
  

screenScale = 1
screenOffset = new p5.Vector(0,0)
gridOffset = new p5.Vector(0,0)
function setup() {
    createCanvas(windowWidth, windowHeight)
    canvas.onpointerdown = pointerdownHandler;
    canvas.onpointermove = pointermoveHandler;

    canvas.onpointerup = pointerupHandler;
    canvas.onpointercancel = pointerupHandler;
    canvas.onpointerout = pointerupHandler;
    canvas.onpointerleave = pointerupHandler;
    createGridGraphics()
    resetScale()
    noSmooth()
}

a = ''
function draw() {
    background(200)
    
    // image(gridGraphics, gridScreenTL.x + screenOffset.x + gridOffset.x*screenScale, gridScreenTL.y + screenOffset.y + gridOffset.y*screenScale, gridBR.x * screenScale, gridBR.y * screenScale, gridTL.x, gridTL.y, )
    image(gridGraphics, gridScreenTL.x, gridScreenTL.y, gridScreenBR.x - gridScreenTL.x, gridScreenBR.y - gridScreenTL.y, 0, 0)
}