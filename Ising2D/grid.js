class Lattice {
    static Square = 'square';

    constructor(type) {
        this.type = type
    }
}

class Grid {
    #width;
    #height;
    #cells;
    #changes;
    #magnetization;

    constructor(width, height, latticeType=Lattice.Square) {
        this.#width = width;
        this.#height = height;
        this.latticeType = latticeType;

        // Construct an array where each bit holds the spin (up = 1, down = 0)
        const area = this.#width * this.#height;
        const numBytes = Math.ceil(area / 8);
        this.#cells = Uint8Array.from({length: numBytes}, () => randIntRange(0, 255));
        this.#cells[this.#cells.length - 1] = this.#cells.at(-1) & (0xff >> (area % 8)) // This is just to make the magnetiation count a little bit easier

        // To improve rendering performance, we only draw what changed since the last time we drew
        // Since the very first time we havent drawn anything, every cell is considered changed
        this.#changes = Array.from({length: area}, (_, i) => [i % this.#width, Math.floor(i / this.#width)]);

        // The initial magnetization, this will get updated after every call to `update`
        const spinUpNum = this.#cells.map(popcount8).reduce((sum, x) => sum+x, 0); // Number of spins that are up
        const spinDownNum = area - spinUpNum;
        this.#magnetization = spinUpNum - spinDownNum;
    }

    // Returns the (signed) normalized magnetization (i.e., a value between -1 and 1)
    getMagnetization() {
        return this.#magnetization / (this.#width * this.#height);
    }

    // Go through `numSpins` spins and flip them conditionally (one interation of Metropolis Hastings)
    update(temp, field, numSpins=1) {
        for (let i = 0; i < numSpins; ++i) {
            const x = randIntRange(0, this.#width - 1);
            const y = randIntRange(0, this.#height - 1);
            const spin = this.#getSpin(x, y);
            const dE = 2*this.getSpinEnergy(x, y) + 2*field*spin;

            // Flip If it is energetically favourable or with probability exp(-dE/T)
            if ((dE < 0) || (Math.random() < Math.exp(-dE/temp))) {
                this.#flipSpin(x, y);
                this.#changes.push([x, y]); // Make sure we know to draw the flipped spin

                // If the flipped spin is spin up, the magnetization goes up, otherwise it goes down
                if (-1*spin > 0) {
                    this.#magnetization += 2;
                }
                else {
                    this.#magnetization -= 2;
                }
            }
        }
    }

    // Draws the grid where the size of each cell is defined by `size` and the pading between cells is defined by `padding`
    draw(size=createVector(1, 1), padding=createVector(0, 0), margin=createVector(0, 0)) {
        if (this.latticeType === Lattice.Square) {
            this.#drawSquare(size, padding, margin);
        }
    }

    // Returns the energy contribution of the spin at the location (x, y)
    getSpinEnergy(x, y) {
        if (this.latticeType === Lattice.Square) {
            return this.#getSpinEnergySquare(x, y);
        }
    }

    // Returns the spin (up = 1, down = -1) at the coordinate (x, y)
    #getSpin(x, y) {
        // If this.cells were an array of bools, then intIdx would be the index into that array for the point (x, y)
        const intIdx = x + y * this.#width;

        // arrIdx is the index into the cell array and bitIdx is the index into the byte ar arrIdx of the cell array
        const arrIdx = Math.floor(intIdx / 8);
        const bitIdx = intIdx % 8;

        const _byte = this.#cells[arrIdx];
        const bit = (_byte & (1 << bitIdx)) >> bitIdx;
        return ((bit * 2) - 1); // Remap 0 => -1, and 1 => 1
    }

    // Flips the spin at the coordinates (x, y)
    #flipSpin(x, y) {
        // If this.cells were an array of bools, then intIdx would be the index into that array for the point (x, y)
        const intIdx = x + y * this.#width;

        // arrIdx is the index into the cell array and bitIdx is the index into the byte ar arrIdx of the cell array
        const arrIdx = Math.floor(intIdx / 8);
        const bitIdx = intIdx % 8;

        // Flip the spin
        this.#cells[arrIdx] ^= (1 << bitIdx);
    }

    // Returns the energy contribution of the spin at the location (x, y) on a square lattice
    #getSpinEnergySquare(x, y) {
        // Get all the neighbours
        const n1 = this.#getSpin(wrap(x - 1, this.#width), y);
        const n2 = this.#getSpin(wrap(x + 1, this.#width), y);
        const n3 = this.#getSpin(x, wrap(y - 1, this.#height));
        const n4 = this.#getSpin(x, wrap(y + 1, this.#height));

        return this.#getSpin(x, y) * (n1 + n2 + n3 + n4);
    }

    // Draws the grid as a square lattice
    #drawSquare(size, padding, margin) {
        for (const [idxX, idxY] of this.#changes) {
            const spin = this.#getSpin(idxX, idxY);
            const fillColor = spin > 0 ? color(255) : color(0);
            noStroke();
            fill(fillColor);

            const x = (idxX * size.x) + ((idxX + 1) * padding.x);
            const y = (idxY * size.y) + ((idxY + 1) * padding.y);
            rect(x + margin.x, y + margin.y, size.x, size.y);
        }

        // Now that we've draw everything, we can reset the changes to be empty
        this.#changes = [];
    }
}
