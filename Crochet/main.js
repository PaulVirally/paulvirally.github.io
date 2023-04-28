let grid;

function setup() {
	const canvas = createCanvas(windowWidth, windowHeight);
	canvas.parent('grid_container');

	grid = new Grid(15, 27, 50, 1, color(0, 0, 0, 0));
	grid.fill(15, 7, color(255, 0, 0, 127));
}

function draw() {
	grid.draw();
}
