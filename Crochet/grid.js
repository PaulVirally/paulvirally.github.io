class Grid {
	#num_rows;
	#num_cols;
	#cell_size;
	#cell_border_width;
	#cell_color;
	#cells;
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
	}

	fill(idx_x, idx_y, color) {
		const idx = idx_y * this.#num_cols + idx_x;
		console.log(idx);
		this.#cells[idx].fill = color;
	}

	draw() {
		for (const cell of this.#cells) {
			cell.draw();
		}
	}
}
