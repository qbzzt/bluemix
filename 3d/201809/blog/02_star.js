const spread = 45;
const armNumber = Math.floor(360/spread);

function main () {
    const arm = cube({size: [20, 2, 10]}).translate([0, -1, 0]);
    const range = [...Array(armNumber).keys()];
    const arms = range.map(x => rotate([0, 0, x*spread], arm));

    return union(arms);
}

