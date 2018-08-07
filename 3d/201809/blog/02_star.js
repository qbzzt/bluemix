function main () {
    const arm = cube({size: [20, 2, 10]}).translate([0, -1, 0]);
    const range = [0,1,2,3,4,5,6,7];
    const arms = range.map(x => rotate([0, 0, x*45], arm));

    return union(arms);
}

