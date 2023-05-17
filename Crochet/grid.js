class Grid {
	#num_rows;
	#num_cols;
	#cell_size;
	#cell_border_width;
	#cell_color;
	#cells;
	#tl;
	#br;
	#selection_start;
	#selection_bb;
	#selection_hue;

	constructor(num_rows, num_cols, cell_size, cell_border_width, cell_color) {
		this.#num_rows = num_rows;
		this.#num_cols = num_cols;
		this.#cell_size = cell_size;
		this.#cell_border_width = cell_border_width;
		this.#cell_color = cell_color;

		// Create the grid of cells
		const num_cells = this.#num_rows * this.#num_cols;
		this.#cells = Array(num_cells).fill(null);
		for (let i = 0; i < num_cells; i++) {
			const idx_x = i % this.#num_cols;
			const idx_y = Math.floor(i / this.#num_cols);
			const x = idx_x * (this.#cell_size + this.#cell_border_width) + this.#cell_size / 2 + this.#cell_border_width;
			const y = idx_y * (this.#cell_size + this.#cell_border_width) + this.#cell_size / 2 + this.#cell_border_width;
			this.#cells[i] = new Cell(x, y, this.#cell_size, this.#cell_border_width, this.#cell_color);
		}

		// Top left and bottom right corners of the grid to find the size of the grid
		this.#tl = p5.Vector.add(this.#cells[0].tl, createVector(this.#cell_border_width / 2, this.#cell_border_width / 2));
		this.#br = p5.Vector.sub(this.#cells[this.#cells.length - 1].br, createVector(this.#cell_border_width / 2, this.#cell_border_width / 2));
		this.width = this.#br.x - this.#tl.x;
		this.height = this.#br.y - this.#tl.y;

		this.#selection_bb = null; // Empty selection bounding box
		this.#selection_hue = 0;
	}

	set_selection_start(start_coords) {
		this.#selection_start = start_coords;
	}

	set_selection_end(end_coords) {
		const start_coords = this.#selection_start;

		// The two cells that define the selection bounding box
		const start_cell = this.#cells[start_coords.y * this.#num_cols + start_coords.x];
		const end_cell = this.#cells[end_coords.y * this.#num_cols + end_coords.x];

		// Top left and bottom right corners of the selection bounding box
		const tl_cell = start_cell.tl.x < end_cell.tl.x ? start_cell : end_cell;
		const br_cell = start_cell.br.x >= end_cell.br.x ? start_cell : end_cell;


		this.#selection_bb = {
			corner1: tl_cell.tl.copy(),
			corner2: br_cell.br.copy()
		};
	}

	clear_selection() {
		this.#selection_bb = null;
	}

	fill(idx_x, idx_y, color) {
		const idx = idx_y * this.#num_cols + idx_x;
		if (idx < 0 || idx >= this.#cells.length) {
			throw new Error(`Invalid cell index: ${idx} at (${idx_x}, ${idx_y})`);
		}
		this.#cells[idx].color = color;
	}

	draw(zoom_level) {
		// Draw the cells
		for (const cell of this.#cells) {
			cell.draw(zoom_level);
		}

		// Draw the selection bounding box
		if (this.#selection_bb !== null) {
			push();
			rectMode(CORNERS);
			colorMode(HSB);
			noFill();
			strokeWeight(5);
			stroke(this.#selection_hue, 100, 100);
			rect(this.#selection_bb.corner1.x * zoom_level, this.#selection_bb.corner1.y * zoom_level, this.#selection_bb.corner2.x * zoom_level, this.#selection_bb.corner2.y * zoom_level);
			pop();
		}
		this.#selection_hue = (this.#selection_hue + 1) % 360;
	}

	get_cell_coords_at(loc) {
		// Check if the point is inside the grid
		if (loc.x < this.#tl.x || loc.x > this.#br.x || loc.y < this.#tl.y || loc.y > this.#br.y) return null;

		// Find the cell that contains the point
		const idx_x = Math.floor((loc.x - this.#tl.x) / (this.#cell_size + this.#cell_border_width));
		const idx_y = Math.floor((loc.y - this.#tl.y) / (this.#cell_size + this.#cell_border_width));
		return { x: idx_x, y: idx_y };
	}

	get_color_at(coords) {
		if (coords === null) return null;
		const idx = coords.y * this.#num_cols + coords.x;
		return this.#cells[idx].color;
	}
}
