
const devSize = [49, 24.5, 13];

const margin = 3;
const wallWidth = 10;
const slotSize = 3;

const usbHoleSize = [wallWidth, 15, 8];


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
    
    const noSlotBox = difference(box, hole, usbHole);
    
    const slotPrecursor = cube({size: [boxSize[0], slotSize/Math.sqrt(2), slotSize/Math.sqrt(2)]}).
        rotateX(45).
        translate([0,slotSize/2,-slotSize/2]).
        scale([1, 1, 2]);
        
    const zAbove0 = cube({size: [200, 200, 200]}).translate([-100,-100,0]);
    
    const slot = intersection(slotPrecursor, zAbove0).translate([0, (wallWidth-slotSize)/2 ,0]);
    
    const slots = union(slot, slot.translate([0, boxSize[1]-wallWidth, 0]));
    
    const completeBox = union(noSlotBox, slots.translate([0,0,boxSize[2]]));
    
    const top = cube({size: [boxSize[0], boxSize[1], wallWidth]});
    const completeTop = difference(top, slots.rotateY(180).translate([boxSize[0],0,wallWidth]));
    
    return union(completeBox, completeTop.translate([0, boxSize[1]+2, 0]));
}
