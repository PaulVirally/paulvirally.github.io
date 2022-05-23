// Wraps idx to maxSize
function wrap(idx, maxSize) {
    if (idx < 0) {
        // Note: |idx| < maxSize for this application, so we don't need to worry about maxSize + idx < 0;
        return maxSize + idx;
    }
    if (idx >= maxSize) {
        return idx % maxSize;
    }
    return idx;
}

// Clamps x to the (closed) range [min, max]
function clamp(x, min, max) {
    if (x < min) {
        return min;
    }
    if (x > max) {
        return max;
    }
    return x;
}

// Returns a random int in the (closed) range [min, max]
function randIntRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Returns number of 1s in an 8 bit number
function popcount8(x) {
    x -= ((x >> 1) & 0x55);
    x = (x & 0x33) + ((x >> 2) & 0x33);
    return (((x + (x >> 4)) & 0x0f) * 0x01);
}
