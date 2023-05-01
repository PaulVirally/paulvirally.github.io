let grid;
let curr_color;
let grid_canvas;
let cam;
let curr_tool;
let undo_stack = [];
let mini_undo_stack = [];
let redo_stack = [];

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

function create_palette_boxes() {
	const palette_container = select('#palette_container').elt;
	const box_size = max(1, palette_container.clientHeight - 2);
	const num_boxes = floor(palette_container.clientWidth / box_size);
	for (let i = 0; i < num_boxes; i++) {
		const box = new PaletteBox(box_size, color(random(255), random(255), random(255)));
		const elem = box.get_elt();
		elem.addEventListener('click', () => {
			for (const child of palette_container.children) {
				child.classList.remove('active');
			}
			elem.classList.add('active');
			curr_color = box.get_color();
		});
		elem.addEventListener('dblclick', () => {
			// TODO: Create a colour picker menu
			box.set_color(color(random(255), random(255), random(255)));
			elem.style.backgroundColor = box.get_color().toString();
			if (elem.classList.contains('active')) {
				curr_color = box.get_color();
			}
		});

		if (i === floor(num_boxes / 2)) {
			elem.classList.add('active');
			curr_color = box.get_color();
		}
		palette_container.appendChild(elem);
	}
}

function setup() {
	// Setup the grid canvas TODO: Fix the canvas size
	const grid_container = select('#grid_container').elt;
	grid_canvas = createCanvas(grid_container.clientWidth, grid_container.clientHeight);
	grid_canvas.parent(grid_container);

	// Setup the tool buttons
	const move_button = select('#pan_').elt;
	const pencil_button = select('#pencil').elt;
	move_button.addEventListener('click', () => switch_tools(Tool.pan_));
	pencil_button.addEventListener('click', () => switch_tools(Tool.pencil));
	curr_tool = Tool.pencil;
	switch_tools(Tool.pencil);

	// Setup the undo/redo buttons
	const undo_button = select('#undo').elt;
	const redo_button = select('#redo').elt;
	undo_button.addEventListener('click', undo);
	redo_button.addEventListener('click', redo);

	grid = new Grid(60, 60, 50, 1, color(0, 0, 0, 0));

	// Setup the camera
	const min_tl = createVector(-grid_canvas.width / 2, -grid_canvas.height / 2);
	const max_br = createVector(grid.width - grid_canvas.width / 2, grid.height - grid_canvas.height / 2);
	cam = new Camera(min_tl, max_br);
	cam.move_to(grid.width / 2 - grid_canvas.width / 2, grid.height / 2 - grid_canvas.height / 2);

	// Setup the palette
	create_palette_boxes();
}

function draw() {
	grid_canvas.
	clear();
	cam.update();
	grid.draw(cam.get_zoom_level()); // FIXME: The grid zooms with respect to (0, 0). Maybe it should zoom with respect to the camera's position?
}

function undo() {
	if (undo_stack.length === 0) return;

	const action = undo_stack.pop();
	if (Array.isArray(action)) {
		for (const a of action) {
			a.undo();
		}
	}
	else {
		action.undo();
	}

	redo_stack.push(action);
	// Enable the redo button if the redo stack is not empty
	const redo_button = select('#redo').elt;
	redo_button.classList.remove('disabled');

	// Disable the undo button if the undo stack is empty
	if (undo_stack.length === 0) {
		const undo_button = select('#undo').elt;
		undo_button.classList.add('disabled');
	}
}

function redo() {
	if (redo_stack.length === 0) return;

	const action = redo_stack.pop();
	if (Array.isArray(action)) {
		for (const a of action) {
			a.redo();
		}
	}
	else {
		action.redo();
	}

	undo_stack.push(action);
	// Enable the undo button if the undo stack is not empty
	const undo_button = select('#undo').elt;
	undo_button.classList.remove('disabled');

	// Disable the redo button if the redo stack is empty
	if (redo_stack.length === 0) {
		const redo_button = select('#redo').elt;
		redo_button.classList.add('disabled');
	}
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
	if (ev.button !== 0) return;
	if (ev.target !== grid_canvas.elt) return;
	if (!(ev.type === 'mousemove' || ev.type === 'mousedown' || ev.type === 'mouseup')) return;

	if (ev.type === 'mouseup') {
		// Add the mini undo stack to the undo stack
		undo_stack.push(mini_undo_stack);
		mini_undo_stack = [];

		// Make sure the undo button is enabled
		const undo_button = select('#undo').elt;
		undo_button.classList.remove('disabled');

		// Clear out the redo stack
		redo_stack = [];
		const redo_button = select('#redo').elt;
		redo_button.classList.add('disabled');
		return
	}

	// Fill the cell that was clicked
	const click_coords = p5.Vector.add(createVector(ev.offsetX, ev.offsetY), cam.get_pos()).mult(1/cam.get_zoom_level());
	const coords = grid.get_cell_coords_at(click_coords);
	if (coords) {
		const action = new FillAction(coords, curr_color);
		if (action.is_useless) return;
		mini_undo_stack.push(action);
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
