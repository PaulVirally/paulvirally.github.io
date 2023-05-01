class Grid {
	#num_rows;
	#num_cols;
	#cell_size;
	#cell_border_width;
	#cell_color;
	#cells;
	#tl;
	#br;

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
	}

	fill(idx_x, idx_y, color) {
		const idx = idx_y * this.#num_cols + idx_x;
		if (idx < 0 || idx >= this.#cells.length) {
			throw new Error(`Invalid cell index: ${idx} at (${idx_x}, ${idx_y})`);
		}
		this.#cells[idx].color = color;
	}

	draw(zoom_level) {
		for (const cell of this.#cells) {
			cell.draw(zoom_level);
		}
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
