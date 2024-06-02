import blocks from "./assets/blocks/blocks.json" with {type: "json"};
export const assetFile = assets;

export const blockTextures = {};


export async function blockTextures_generate(){
	let blockTypeNames = Object.keys(blocks.types);

	for(let typeIndex = 0; typeIndex < blockTypeNames.length; typeIndex ++){
		let blockTypeName = blockTypeNames[typeIndex];

		let {default: blockVariants} = await import(`../../code/assets/blocks/${blocks.types[blockTypeName]}`, { with: { type: "json"} });

		blockTextures[blockTypeName] = blockVariants.block
	}
}