export var world = [];
export var worldWidth = 4;
export var worldLength = 10;
export var worldHeight = 5;

for(let y = 0; y < worldLength; y ++){
	for(let x = 0; x < worldWidth; x ++){
		world.push("grass");
	}
}

for(let z = 0; z < worldHeight-1; z ++){
	for(let y = 0; y < worldLength; y ++){
		for(let x = 0; x < worldWidth; x ++){
			world.push("empty");
		}
	}
}

setBlock(0, 0, 0, "dirt")
setBlock(1, 0, 0, "dirt")
setBlock(2, 0, 0, "dirt")
setBlock(3, 0, 0, "dirt")

setBlock(0, 0, 1, "dirt_slab")
setBlock(1, 0, 1, "dirt_slab")
setBlock(2, 0, 1, "dirt_slab")
setBlock(3, 0, 1, "dirt_slab")

setBlock(2, 3, 0, "grass_path-north-east-south-west")
setBlock(2, 4, 0, "grass_path-north-south-west")
setBlock(2, 2, 0, "grass_path-north-east-south")
setBlock(1, 3, 0, "grass_path-east-south-west")
setBlock(3, 3, 0, "grass_path-north-east-west")
setBlock(1, 4, 0, "grass_path-south-west")
setBlock(1, 2, 0, "grass_path-east-south")
setBlock(3, 2, 0, "grass_path-north-east")
setBlock(3, 4, 0, "grass_path-north-west")
setBlock(2, 1, 0, "grass_path-north-south")
setBlock(3, 1, 0, "grass_path-north")
setBlock(1, 1, 0, "grass_path-south")
setBlock(0, 3, 0, "grass_path-east-west")
setBlock(0, 2, 0, "grass_path-east")
setBlock(0, 4, 0, "grass_path-west")

setBlock(2, 7, 0, "grass_water-north-east-south-west")
setBlock(2, 8, 0, "grass_water-north-south-west")
setBlock(2, 6, 0, "grass_water-north-east-south")
setBlock(1, 7, 0, "grass_water-east-south-west")
setBlock(3, 7, 0, "grass_water-north-east-west")
setBlock(1, 8, 0, "grass_water-south-west")
setBlock(1, 6, 0, "grass_water-east-south")
setBlock(3, 6, 0, "grass_water-north-east")
setBlock(3, 8, 0, "grass_water-north-west")
setBlock(2, 5, 0, "grass_water-north-south")
setBlock(3, 5, 0, "grass_water-north")
setBlock(1, 5, 0, "grass_water-south")
setBlock(0, 7, 0, "grass_water-east-west")
setBlock(0, 6, 0, "grass_water-east")
setBlock(0, 8, 0, "grass_water-west")

setBlock(0, 9, 1, "tree_round-big")
setBlock(1, 9, 1, "tree_round-small")
setBlock(2, 9, 1, "tree_pointy-big")
setBlock(3, 9, 1, "tree_pointy-small")

export function indexFromXYZ(x=0, y=0, z=0){
	return (x) + (y * worldWidth) + (z * worldWidth * worldLength);
}

export function setBlock(x=0, y=0, z=0, block=""){
	let index = indexFromXYZ(x, y, z);
	world[index] = block;
}

export function getBlock(x=0, y=0, z=0){
	let index = indexFromXYZ(x, y, z);

	let block = world[index];

	let formatedBlock = block;

	if(block == "windmill_blade"){
		let frameCount = 2;
		let speed = 3;
		let timer = performance.now() / 1000;
		formatedBlock += `[${ Math.ceil( timer * speed % frameCount ) }]`;
	}

	return formatedBlock;
}