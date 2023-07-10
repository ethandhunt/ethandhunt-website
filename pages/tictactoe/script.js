dimension = 6

function coordToIndex(coord) {
    index = 0
    for (i=0; i<coord.length; i++) {
        index += (coord[i]-1) * 3**i
    }
    return index
}

function indexToCoord(index, d = dimension) {
    coords = []
    for (let i=0; i<d; i++) {
        coords.push(floor(index/3**i) % 3 + 1)
    }
    return coords
}

function dimSepCalc(d) {
    if (floor(d/2) == 1) {
        return dimSep
    }
    if (d<1) {
        throw Error('dimSepCalc negative d')
    }

    return dimSepCalc(d-2)*4
}

function coordToVector(coord) {
    vec = createVector(0,0)
    for (let i=0; i < coord.length; i += 2) {
        if (i < 2) {
            vec.x += (tileSep+tileWidth) * coord[i]
            vec.y += (tileSep+tileWidth) * coord[i+1] || 0
        } else {
            vec.x += dimSepCalc(i) * (coord[i]-1)
            vec.y += dimSepCalc(i) * (coord[i+1]-1) || 0
        }
    }
    return vec
}

var gridGraphics
tileSep = 5 // separation between tiles within a 2d/1d grid
tileWidth = 10
dimSep = (tileSep+tileWidth)*4 // separation between 2d grids (from top left)
function createGridGraphics() {
    console.log('creating grid graphics...')
    gridGraphics = createGraphics(width, height)
    gridGraphics.background(0,0) // black, fully transparent
    maxi = 3**dimension
    gridGraphics.fill(0,0,0,50)
    for (let i=0; i < maxi; i++) {
        vec = coordToVector(indexToCoord(i))
        gridGraphics.square(vec.x, vec.y, tileWidth)
    }
    console.log('created grid graphics')
}

function setup() {
    createCanvas(windowWidth, windowHeight)
    createGridGraphics()
}

function draw() {
    background(200)
    image(gridGraphics, 0, 0)
}