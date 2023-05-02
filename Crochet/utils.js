function colors_equal(c1, c2) {
	const l1 = c1.levels;
	const l2 = c2.levels;
	return l1[0] === l2[0] && l1[1] === l2[1] && l1[2] === l2[2] && l1[3] === l2[3];
}
