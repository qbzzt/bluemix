
const devSize = [49, 24.5, 13];

const margin = 3;
const wallWidth = 10;
const slotSize = wallWidth/2;
const slotHeightFactor = 2;

const usbHoleSize = [wallWidth, 15, 20];

// The hole in the top for wires to go through
const wireHoleSize = [devSize[0], 1+margin, 20];


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
        scale([1, 1, slotHeightFactor]);
        
    const zAbove0 = cube({size: [200, 200, 200]}).translate([-100,-100,0]);
    
    const slot = intersection(slotPrecursor, zAbove0).translate([0, (wallWidth-slotSize)/2 ,0]);
    
    const backSlot = slot.rotateZ(90).translate([boxSize[0],0,0]).scale([1,boxSize[1]/boxSize[0],1]);

    const frontSlot = difference(backSlot.translate([-boxSize[0]+wallWidth,0,0]), usbHole.translate([0,0,-20]));    
    
    const slots = union(slot, 
        slot.translate([0, boxSize[1]-wallWidth, 0]),
        backSlot, 
        frontSlot);
        
    const completeBox = union(noSlotBox, slots.translate([0,0,boxSize[2]]));
    
    const top = cube({size: [boxSize[0], boxSize[1], wallWidth]});
    
    const wireHole = cube({size: wireHoleSize}).
        translate([(boxSize[0]-wireHoleSize[0])/2,0,0]);
        
    const wireHoles = union(wireHole.translate([0,wallWidth,0]), 
                            wireHole.translate([0,boxSize[1]-wallWidth-wireHoleSize[1],0]));
    
    const completeTop = difference(top, 
        slots.rotateY(180).translate([boxSize[0],0,wallWidth]),
        wireHoles);
    
    return union(completeBox, completeTop.translate([0, boxSize[1]+2, 0]));
}
