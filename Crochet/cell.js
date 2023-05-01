class Cell {
	#x;
	#y;
	#size;
	#border_width;
	constructor(x, y, size, border_width, color) {
		this.#x = x;
		this.#y = y;
		this.#size = size;
		this.#border_width = border_width;
		this.color = color;

		// Corners including the border
		this.tl = createVector(this.#x - this.#size/2 - this.#border_width/2, this.#y - this.#size/2 - this.#border_width/2);
		this.tr = createVector(this.#x + this.#size/2 + this.#border_width/2, this.#y - this.#size/2 - this.#border_width/2);
		this.br = createVector(this.#x + this.#size/2 + this.#border_width/2, this.#y + this.#size/2 + this.#border_width/2);
		this.bl = createVector(this.#x - this.#size/2 - this.#border_width/2, this.#y + this.#size/2 + this.#border_width/2);
	}

	draw(zoom_level) {
		// Draw the cell
		fill(this.color);
		rect((this.tl.x + this.#border_width / 2) * zoom_level, (this.tl.y + this.#border_width / 2) * zoom_level, this.#size * zoom_level, this.#size * zoom_level);
	}
}
