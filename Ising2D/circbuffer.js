class CircBuffer {
    #capacity;
    #data;
    #insertIdx;
    #isFull;

    constructor(capacity) {
        this.#capacity = capacity;
        this.#data = [];
        this.#insertIdx = 0;
        this.#isFull = false;
    }

    push(val) {
        if (this.#isFull) {
            // Change the value of the buffer if it's already filled up
            this.#data[this.#insertIdx] = val;
        }
        else {
            // Push the data if we haven't filled up the circular buffer
            this.#data.push(val);
        }
        
        // Increment the index into the buffer
        this.#insertIdx = (this.#insertIdx + 1) % this.#capacity;
        if (this.#insertIdx == 0) {
            // If we've wrapped around, then we've filled out the circular buffer
            this.#isFull = true;
        }
    }

    plot(sketch, minX, maxX, colorR, colorG, colorB) {
        sketch.stroke(colorR, colorG, colorB);
        for (let i = 0; i < this.#data.length - 1; ++i) {
            const x0 = remap(i, 0, this.#data.length, minX, maxX);
            const x1 = remap(i+1, 0, this.#data.length, minX, maxX);
            const y0 = this.#data[i];
            const y1 = this.#data[i+1];
            sketch.line(x0, y0, x1, y1);
        } 
    }
}
