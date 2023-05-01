class PaletteBox {
	#size;
	#color;
	#elt;

	constructor(size, color) {
		this.#size = size;
		this.#color = color;

		this.create_dom();
	}

	create_dom() {
		this.#elt = document.createElement('div');
		this.#elt.classList.add('palette_box');
		this.#elt.style.width = this.#size + 'px';
		this.#elt.style.height = this.#size + 'px';
		this.#elt.style.backgroundColor = this.#color.toString();
	}

	get_color() {
		return this.#color;
	}

	set_color(color) {
		this.#color = color;
	}

	get_elt() {
		return this.#elt;
	}
}
