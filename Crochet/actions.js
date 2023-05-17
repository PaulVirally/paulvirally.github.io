class FillAction {
	#coords
	#color;
	#old_color;

	constructor(coords, color) {
		this.#coords = coords;
		this.#color = color;
		this.#old_color = grid.get_color_at(this.#coords);
		this.is_useless = colors_equal(this.#color, this.#old_color);
		this.apply();
	}

	apply() {
		if (this.is_useless) return;
		grid.fill(this.#coords.x, this.#coords.y, this.#color);
	}

	undo() {
		if (this.is_useless) return;
		grid.fill(this.#coords.x, this.#coords.y, this.#old_color);
	}

	redo() {
		this.apply();
	}
}
