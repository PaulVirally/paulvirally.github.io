class Camera {
	#pos;
	#target_delta_pos;
	#prev_drag_pt;
	#min_tl;
	#max_br;
	#zoom_level;

	constructor(min_tl, max_br) {
		this.#pos = createVector(0, 0);
		this.#target_delta_pos = createVector(0, 0);
		this.#prev_drag_pt = null;
		this.#min_tl = min_tl;
		this.#max_br = max_br;
		this.#zoom_level = 0;
	}

	get_pos() {
		return this.#pos.copy();
	}

	move_to(x, y) {
		x = constrain(x, this.#min_tl.x, this.#max_br.x);
		y = constrain(y, this.#min_tl.y, this.#max_br.y);
		this.#pos.set(x, y);
	}

	zoom_out() {
		this.#zoom_level = constrain(this.#zoom_level - 1, -30, 30);
	}

	zoom_in() {
		this.#zoom_level = constrain(this.#zoom_level + 1, -30, 30);
	}

	get_zoom_level() {
		const amount = map(abs(this.#zoom_level), 0, 30, 1, 5);
		if (this.#zoom_level < 0) {
			return 1 / amount;
		}
		return amount;
	}

	clear_dragging() {
		this.#prev_drag_pt = null;
		this.#target_delta_pos.set(0, 0);
	}

	add_drag_pt(pt) {
		if (this.#prev_drag_pt) {
			this.#target_delta_pos = p5.Vector.sub(this.#prev_drag_pt, pt).mult(9);
		}
		this.#prev_drag_pt = pt.copy();
	}

	update() {
		let new_pos = p5.Vector.lerp(this.#pos, this.#pos.copy().add(this.#target_delta_pos), 0.1);
		this.#target_delta_pos.mult(0.9);
		this.move_to(new_pos.x, new_pos.y);

		translate(-this.#pos.x, -this.#pos.y);
	}
}
