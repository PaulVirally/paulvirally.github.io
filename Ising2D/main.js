let cellSize = null;
let cellPadding = null;
let cellMargin = null;

let numRows = 30;
let numCols = 30;
let grid = null;

let temp = 2.269;
let speed = 100;
let field = 0;

function setup() {
    // Figure out how big we can make the canvas
    const isingCanvasContainer = document.getElementById('isingCanvasContainer');
    const screenWidth = isingCanvasContainer.offsetWidth;
    const screenHeight = isingCanvasContainer.offsetHeight;

    // Setup the input controls (add the appropriate event listeners to them)
    setupControls(createVector(screenWidth, screenHeight, 1));

    // Create the canvas
    isingCanvas = createCanvas(screenWidth, screenHeight);
    isingCanvas.parent('isingCanvasContainer');


    // Reset the canvas and the grid
    resetIsingCanvas();
}

function draw() {
    grid.update(temp, field, speed);
    grid.draw(cellSize, cellPadding, cellMargin);
    // console.log(grid.getMagnetization());
}

// Resets the cells on the Ising canvas
function resetIsingCanvas() {
    // Clear the canvas
    clear();

    // Check the size of the canvas
    const isingCanvasContainer = document.getElementById('isingCanvasContainer');
    const screenWidth = isingCanvasContainer.offsetWidth;
    const screenHeight = isingCanvasContainer.offsetHeight;
    const screenSize = createVector(screenWidth, screenHeight, 1);

    // Get the rows and columns from the sliders
    numRows = getSliderValue('rowSlider');
    numCols = getSliderValue('colSlider');
    
    // If the canvas is too small, reduce the number of rows and columns
    numRows = clamp(numRows, 0, screenHeight);
    numCols = clamp(numCols, 0, screenWidth);
    const gridDim = createVector(numCols, numRows, 1);

    // Remove the padding if we are at the maximum number of rows or columns
    cellPadding = createVector(1, 1, 1);
    if ((numRows == screenHeight) || (numCols == screenWidth)) {
        cellPadding = createVector(0, 0, 1);
    }

    // Figure out how big the cells should be
    cellSize = getCellSize(screenSize, gridDim);

    // If the cells are very small, remove the padding and recompute the cell size
    if ((cellSize.x <= 4) || (cellSize.y <= 4)) {
        cellPadding = createVector(0, 0, 1);
        cellSize = getCellSize(screenSize, gridDim);
    }

    // Figure out how much margin we have to add to center our grid in the screen
    cellMargin = getCellMargin(screenSize, gridDim);

    // Create a new grid
    grid = new Grid(numCols, numRows);

    // Draw the grid
    grid.draw(cellSize, cellPadding, cellMargin);
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
    let size = Math.floor(min(sizeVec.x, sizeVec.y)); // Make sure the cells are square to make it look nice
    size = size < 1 ? 1 : size; // Make sure the size is at least one
    return createVector(size, size, 1);
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
    return parseInt(slider.value);
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
function setupControls(screenSize) {
    setupSliderBox('row', 1, numRows, screenSize.y, 1, () => {resetIsingCanvas(); setMaxSpeed();});
    setupSliderBox('col', 1, numCols, screenSize.x, 1, () => {resetIsingCanvas(); setMaxSpeed();});
    setupSliderBox('speed', 0, speed, Math.floor(0.5 * numRows * numCols), 1, setSpeed);
    setupSliderBox('field', -1, field, 1, 1e-3, setField);
    setupSliderBox('temp', 1, temp, 5, 1e-3, setTemp);

    // Manually reset the canvas with a reset button
    const resetButton = document.getElementById('resetButton');
    resetButton.addEventListener('click', resetIsingCanvas);

    // TODO: Add the lattice controller
}
