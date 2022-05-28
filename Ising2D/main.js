let cellSize = null;
let cellPadding = null;
let cellMargin = null;

let numRows = 30;
let numCols = 30;
let grid = null;

let temp = 2.269;
let speed = 100;
let field = 0;

const numPts = 2000; // Number of points to plot
let tempVals = new CircBuffer(numPts); // Will holds the temperature over time
let fieldVals = new CircBuffer(numPts); // Will hold the value of the external field over time
let magVals = new CircBuffer(numPts); // Will hold the value of the magnetization over time
let plotSize = null;

let isingSketch = new p5((sketch) => {
    sketch.setup = () => {
        // Figure out how big we can make the canvas
        const isingCanvasContainer = document.getElementById('isingCanvasContainer');
        const screenWidth = isingCanvasContainer.offsetWidth;
        const screenHeight = isingCanvasContainer.offsetHeight;

        // Setup the input controls (add the appropriate event listeners to them)
        setupControls(sketch, new p5.Vector(screenWidth, screenHeight, 1));

        // Create the canvas
        isingCanvas = sketch.createCanvas(screenWidth, screenHeight);
        isingCanvas.parent('isingCanvasContainer');


        // Reset the canvas and the grid
        resetIsingCanvas(sketch);
    };

    sketch.draw = () => {
        grid.update(temp, field, speed);
        grid.draw(sketch, cellSize, cellPadding, cellMargin);
        // console.log(grid.getMagnetization());
    };
});

let plotSketch = new p5((sketch) => {
    sketch.setup = () => {
        // Figure out how big we can make the canvas
        const plotCanvasContainer = document.getElementById('plotCanvasContainer');
        const screenWidth = plotCanvasContainer.offsetWidth;
        const screenHeight = plotCanvasContainer.offsetHeight;
        plotSize = new p5.Vector(screenWidth, screenHeight, 1);

        // Create the canvas
        plotCanvas = sketch.createCanvas(screenWidth, screenHeight);
        plotCanvas.parent('plotCanvasContainer');
    };

    sketch.draw = () => {
        // Clear out the sketch
        sketch.clear();

        // Add the data to the circular buffers, but first remap the data to fit in the plotting window (note that the remapping looks backwards, but this is to counteract the fact that the top left corner is the origin, and not the bottom left corner)
        const minY = plotSize.y * 0.1;
        const maxY = plotSize.y * 0.94;
        const minX = plotSize.x * 0.15;
        const maxX = plotSize.x * 0.85;
        magVals.push(remap(grid.getMagnetization(), -1, 1, maxY, minY));
        tempVals.push(remap(temp, 1, 5, maxY, minY));
        fieldVals.push(remap(field, -1, 1, maxY, minY));

        // Plot the data in the circular buffers
        magVals.plot(sketch, minX, maxX, 31, 119, 180);
        tempVals.plot(sketch, minX, maxX, 255, 127, 14);
        fieldVals.plot(sketch, minX, maxX, 44, 160, 44);

        // Scan line
        const currX = remap(magVals.getIdx(), 0, numPts, minX, maxX);
        sketch.stroke(214, 39, 40);
        sketch.line(currX, minY, currX, maxY);

        // Draw the legend
        // Magnetization
        sketch.textSize(12);
        sketch.stroke(31, 119, 180);
        sketch.line(plotSize.x * 0.05, plotSize.y * 0.05, plotSize.x * 0.15, plotSize.y * 0.05);
        sketch.noStroke();
        sketch.fill(0, 0, 0);
        sketch.text('Magnetization', plotSize.x * 0.17, plotSize.y * 0.05 + 4);

        // Temperature
        sketch.stroke(255, 127, 14);
        sketch.line(plotSize.x * 0.4, plotSize.y * 0.05, plotSize.x * 0.5, plotSize.y * 0.05);
        sketch.noStroke();
        sketch.fill(0, 0, 0);
        sketch.text('Temp', plotSize.x * 0.52, plotSize.y * 0.05 + 4);

        // External field
        sketch.stroke(44, 160, 44);
        sketch.line(plotSize.x * 0.63, plotSize.y * 0.05, plotSize.x * 0.73, plotSize.y * 0.05);
        sketch.noStroke();
        sketch.fill(0, 0, 0);
        sketch.text('Ext. Field', plotSize.x * 0.75, plotSize.y * 0.05 + 4);

        // Draw the axes
        // Magnetization and external field
        sketch.stroke(31, 119, 180);
        sketch.fill(31, 119, 180);
        sketch.line(minX, minY, minX, maxY);
        sketch.textSize(8);
        const dy = (maxY - minY)/8;
        for (let y = minY + dy; y < maxY - dy; y += dy) {
            sketch.stroke(31, 119, 180);
            sketch.line(minX - 5, y, minX, y);

            sketch.noStroke();
            const yVal = remap(y, maxY, minY, -1, 1);
            sketch.text(yVal.toFixed(2), minX - 23, y + 3);
        }
        sketch.push();
        sketch.textSize(12);
        sketch.translate(minX - 35, (minY + maxY)/2);
        sketch.rotate(-Math.PI/2);
        sketch.text('Magnetization & Ext. Field', -70, 0);
        sketch.pop();

        // Temperature
        sketch.stroke(255, 127, 14);
        sketch.line(maxX, minY, maxX, maxY);
        sketch.fill(255, 127, 14);
        for (let y = minY + dy; y < maxY - dy; y += dy) {
            sketch.stroke(255, 127, 14);
            sketch.line(maxX, y, maxX + 5, y);

            const yVal = remap(y, maxY, minY, 1, 5);
            sketch.noStroke();
            sketch.text(yVal.toFixed(2), maxX + 7, y + 3);
        }
        sketch.push();
        sketch.textSize(12);
        sketch.translate(maxX + 40, (minY + maxY)/2);
        sketch.rotate(-Math.PI/2);
        sketch.text('Temperature', -40, 0);
        sketch.pop();

        // Time
        sketch.stroke(0, 0, 0);
        sketch.line(minX, minY, maxX, minY);
        sketch.line(minX, maxY, maxX, maxY);
        sketch.fill(0, 0, 0);
        sketch.noStroke();
        sketch.textSize(12);
        sketch.text('Real Time', (maxX + minX)/2 - 30, maxY + 15);

    };
});

// Resets the cells on the Ising canvas
function resetIsingCanvas(sketch) {
    // Clear the canvas
    sketch.clear();

    // Check the size of the canvas
    const isingCanvasContainer = document.getElementById('isingCanvasContainer');
    const screenWidth = isingCanvasContainer.offsetWidth;
    const screenHeight = isingCanvasContainer.offsetHeight;
    const screenSize = new p5.Vector(screenWidth, screenHeight, 1);

    // Get the rows and columns from the sliders
    numRows = getSliderValue('rowSlider');
    numCols = getSliderValue('colSlider');
    
    // If the canvas is too small, reduce the number of rows and columns
    numRows = clamp(numRows, 0, screenHeight);
    numCols = clamp(numCols, 0, screenWidth);
    const gridDim = new p5.Vector(numCols, numRows, 1);

    // Remove the padding if we are at the maximum number of rows or columns
    // cellPadding = new p5.Vector(1, 1, 1);
    cellPadding = new p5.Vector(0, 0, 1); // TODO: Remove padding alltogether?
    if ((numRows == screenHeight) || (numCols == screenWidth)) {
        cellPadding = new p5.Vector(0, 0, 1);
    }

    // Figure out how big the cells should be
    cellSize = getCellSize(screenSize, gridDim);

    // If the cells are very small, remove the padding and recompute the cell size
    if ((cellSize.x <= 4) || (cellSize.y <= 4)) {
        cellPadding = new p5.Vector(0, 0, 1);
        cellSize = getCellSize(screenSize, gridDim);
    }

    // Figure out how much margin we have to add to center our grid in the screen
    cellMargin = getCellMargin(screenSize, gridDim);

    // Create a new grid
    grid = new Grid(numCols, numRows);

    // Draw the grid
    grid.draw(sketch, cellSize, cellPadding, cellMargin);
}

// Returns the margin to apply to the grid to center it in the screen
function getCellMargin(screenSize, gridDim) {
    const usedSize = p5.Vector.mult(gridDim, p5.Vector.add(cellSize, cellPadding));
    const margin = p5.Vector.sub(screenSize, usedSize).div(2);
    return margin;
}

// Returns the size each cell should be to be able to fit the whole canvas
function getCellSize(screenSize, gridDim) {
    const sizeVec = p5.Vector.div(screenSize, gridDim).sub(cellPadding);
    let size = Math.floor(Math.min(sizeVec.x, sizeVec.y)); // Make sure the cells are square to make it look nice
    size = size < 1 ? 1 : size; // Make sure the size is at least one
    return new p5.Vector(size, size, 1);
}

// Makes sure the two elements, master and slave, have the same value
function syncInputs(master, slave) {
    slave.value = master.value;
}

function setupSliderBox(name, min, value, max, step, onchange) {
    const slider = document.getElementById(name + 'Slider');
    const box = document.getElementById(name + 'Box');

    // Setup the min, max, and value of the elements
    slider.min = min;
    slider.value = value;
    slider.max = max;
    slider.step = step;
    box.value = value;

    // Make sure the box and the slider always show the same value
    slider.addEventListener('input', () => {syncInputs(slider, box)});
    box.addEventListener('input', () => {syncInputs(box, slider)});

    // Setup their onchange event (unless it is for field, speed, or temp, in which case just add another oninput event)
    let eventHook = 'change';
    if (['field', 'speed', 'temp'].includes(name)) {
        eventHook = 'input';
    }
    slider.addEventListener(eventHook, onchange);
    box.addEventListener(eventHook, onchange);
}

function getSliderValue(id) {
    const slider = document.getElementById(id);
    return parseFloat(slider.value);
}

function setSpeed() {
    speed = getSliderValue('speedSlider');
}

function setMaxSpeed() {
    const slider = document.getElementById('speedSlider');
    slider.max = Math.floor(0.5 * numRows * numCols);
}

function setField() {
    field = getSliderValue('fieldSlider');
}

function setTemp() {
    temp = getSliderValue('tempSlider');
}

// Add event listeners to the appropriate control elements
function setupControls(sketch, screenSize) {
    setupSliderBox('row', 1, numRows, screenSize.y, 1, () => {resetIsingCanvas(sketch); setMaxSpeed();});
    setupSliderBox('col', 1, numCols, screenSize.x, 1, () => {resetIsingCanvas(sketch); setMaxSpeed();});
    setupSliderBox('speed', 0, speed, Math.floor(0.5 * numRows * numCols), 1, setSpeed);
    setupSliderBox('field', -1, field, 1, 1e-3, setField);
    setupSliderBox('temp', 1, temp, 5, 1e-3, setTemp);

    // Manually reset the canvas with a reset button
    const resetButton = document.getElementById('resetButton');
    resetButton.addEventListener('click', () => {resetIsingCanvas(sketch)});

    // TODO: Add the lattice controller
}
