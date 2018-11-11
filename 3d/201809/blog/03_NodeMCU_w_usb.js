
const devSize = [49, 24.5, 13];

const margin = 3;
const wallWidth = 10;

const usbHoleSize = [wallWidth, 10, 8];


function main () {
    const holeSize = devSize.map(l => l+2*margin);
    const boxSize = [
        holeSize[0]+2*wallWidth, 
        holeSize[1]+2*wallWidth,
        holeSize[2]+wallWidth,        
    ];
    
    const box = cube({size: boxSize});
    const hole = cube({size:holeSize}).
        translate([wallWidth, wallWidth, wallWidth]);
        
    const usbHole = cube({size: usbHoleSize}).
        translate([0,(boxSize[1]-usbHoleSize[1])/2,wallWidth]);        
    
    const completeBox = difference(box, hole, usbHole);

    return completeBox;
}
