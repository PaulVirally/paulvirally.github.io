let grid;
let curr_color;
let grid_canvas;
let cam;
let curr_tool;

const Tool = Object.freeze({
	pan_: Symbol('pan_'),
	pencil: Symbol('pencil'),
});

function switch_tools(tool) {
	// Make the old tool inactive
	const old_tool_str = curr_tool.toString().slice(7, -1);
	const old_button = document.getElementById(old_tool_str);
	old_button.classList.remove('active');

	// Make the new tool the current tool
	const new_tool_str = tool.toString().slice(7, -1);
	const new_button = document.getElementById(new_tool_str);
	new_button.classList.add('active');
	curr_tool = tool;

	// Make the canvas cursor reflect the current tool
	if (curr_tool === Tool.pan_) {
		grid_canvas.elt.style.cursor = 'grab';
	}
	else if (curr_tool === Tool.pencil) {
		grid_canvas.elt.style.cursor = 'crosshair';
	}
}

function setup() {
	// Setup the grid canvas TODO: Fix the canvas size
	const grid_container = document.getElementById('grid_container');
	grid_canvas = createCanvas(grid_container.clientWidth, grid_container.clientHeight);
	grid_canvas.parent(grid_container);

	// Setup the tool buttons
	const move_button = document.getElementById('pan_');
	const pencil_button = document.getElementById('pencil');
	move_button.addEventListener('click', () => switch_tools(Tool.pan_));
	pencil_button.addEventListener('click', () => switch_tools(Tool.pencil));
	curr_tool = Tool.pencil;
	switch_tools(Tool.pencil);

	// Setup the undo/redo buttons
	const undo_button = document.getElementById('undo');
	const redo_button = document.getElementById('redo');
	undo_button.addEventListener('click', undo);
	redo_button.addEventListener('click', redo);

	curr_color = color(255, 0, 0);
	grid = new Grid(60, 60, 50, 1, color(0, 0, 0, 0));

	// Setup the camera
	const min_tl = createVector(-grid_canvas.width / 2, -grid_canvas.height / 2);
	const max_br = createVector(grid.width - grid_canvas.width / 2, grid.height - grid_canvas.height / 2);
	cam = new Camera(min_tl, max_br);
	cam.move_to(grid.width / 2 - grid_canvas.width / 2, grid.height / 2 - grid_canvas.height / 2);
}

function draw() {
	grid_canvas.
	clear();
	cam.update();
	grid.draw(cam.get_zoom_level());
}

function undo() {
	console.log('Undo');
}

function redo() {
	console.log('Redo');
}

// FIXME: I hate how this feels
function handle_move(ev) {
	// Make sure we are dealing with a left click in side the grid container
	if (ev.button !== 0) return;
	if (ev.target !== grid_canvas.elt) return;

	if (ev.type === 'mousemove' || ev.type === 'mousedown') {
		// Pan the camera
		const click_coords_screen = createVector(ev.offsetX, ev.offsetY);
		cam.add_drag_pt(click_coords_screen);
	}
	else if (ev.type === 'mouseup') {
		// Stop panning the camera
		cam.clear_dragging();
	}
}

function handle_pencil(ev) {
	// Make sure we left clicked inside the grid container
	if (!(ev.type === 'mousemove' || ev.type === 'mousedown')) return;
	if (ev.button !== 0) return;
	if (ev.target !== grid_canvas.elt) return;

	// Fill the cell that was clicked
	const click_coords = p5.Vector.add(createVector(ev.offsetX, ev.offsetY), cam.get_pos()).mult(1/cam.get_zoom_level());
	const coords = grid.get_cell_coords_at(click_coords);
	if (coords) {
		grid.fill(coords.x, coords.y, curr_color);
	}
}

function mouse_event_hanlder(ev) {
	if (curr_tool === Tool.pan_) {
		handle_move(ev);
	}
	else if (curr_tool === Tool.pencil) {
		handle_pencil(ev);
	} 
}

function mousePressed(ev) {
	mouse_event_hanlder(ev);
}

function mouseDragged(ev) {
	mouse_event_hanlder(ev);
}

function mouseReleased(ev) {
	mouse_event_hanlder(ev);
}

function mouseWheel(ev) {
	ev.deltaY > 0 ? cam.zoom_out() : cam.zoom_in();
}
