class Cell {
	#x;
	#y;
	#size;
	#border_width;
	#color;
	constructor(x, y, size, border_width, color) {
		this.#x = x;
		this.#y = y;
		this.#size = size;
		this.#border_width = border_width;
		this.#color = color;

		// Corners including the border
		this.tl = createVector(this.#x - this.#size/2 - this.#border_width/2, this.#y - this.#size/2 - this.#border_width/2);
		this.tr = createVector(this.#x + this.#size/2 + this.#border_width/2, this.#y - this.#size/2 - this.#border_width/2);
		this.br = createVector(this.#x + this.#size/2 + this.#border_width/2, this.#y + this.#size/2 + this.#border_width/2);
		this.bl = createVector(this.#x - this.#size/2 - this.#border_width/2, this.#y + this.#size/2 + this.#border_width/2);
	}

	set fill(color) {
		this.#color = color;
	}

	draw(zoom_level) {
		push();

		// Draw the border (p5's rect has some issues with strokeWeight)
		strokeWeight(this.#border_width);
		stroke(0);
		line(this.tl.x * zoom_level, this.tl.y * zoom_level, this.tr.x * zoom_level, this.tr.y * zoom_level);
		line(this.tr.x * zoom_level, this.tr.y * zoom_level, this.br.x * zoom_level, this.br.y * zoom_level);
		line(this.br.x * zoom_level, this.br.y * zoom_level, this.bl.x * zoom_level, this.bl.y * zoom_level);
		line(this.bl.x * zoom_level, this.bl.y * zoom_level, this.tl.x * zoom_level, this.tl.y * zoom_level);

		// Draw the cell
		noStroke();
		fill(this.#color);
		rectMode(CORNER);
		rect((this.tl.x + this.#border_width / 2) * zoom_level, (this.tl.y + this.#border_width / 2) * zoom_level, this.#size * zoom_level, this.#size * zoom_level);

		pop();
	}
}
