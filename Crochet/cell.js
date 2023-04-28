class Cell {
	#x;
	#y;
	#size;
	#border_width;
	#color;
	#tl;
	#tr;
	#bl;
	#br;
	constructor(x, y, size, border_width, color) {
		this.#x = x;
		this.#y = y;
		this.#size = size;
		this.#border_width = border_width;
		this.#color = color;

		// Corners including the border
		this.#tl = createVector(this.#x - this.#size/2 - this.#border_width/2, this.#y - this.#size/2 - this.#border_width/2);
		this.#tr = createVector(this.#x + this.#size/2 + this.#border_width/2, this.#y - this.#size/2 - this.#border_width/2);
		this.#br = createVector(this.#x + this.#size/2 + this.#border_width/2, this.#y + this.#size/2 + this.#border_width/2);
		this.#bl = createVector(this.#x - this.#size/2 - this.#border_width/2, this.#y + this.#size/2 + this.#border_width/2);
	}

	set fill(color) {
		this.#color = color;
	}

	draw() {
		push();

		// Draw the border (p5's rect has some issues with strokeWeight)
		strokeWeight(this.#border_width);
		stroke(0);
		line(this.#tl.x, this.#tl.y, this.#tr.x, this.#tr.y);
		line(this.#tr.x, this.#tr.y, this.#br.x, this.#br.y);
		line(this.#br.x, this.#br.y, this.#bl.x, this.#bl.y);
		line(this.#bl.x, this.#bl.y, this.#tl.x, this.#tl.y);

		// Draw the cell
		noStroke();
		fill(this.#color);
		rectMode(CORNER);
		rect(this.#tl.x + this.#border_width / 2, this.#tl.y + this.#border_width / 2, this.#size, this.#size);

		pop();
	}
}
