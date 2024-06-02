import PlaceBlock from "../../play/behind/world_editor.js";
import { currentWorld, switchWorldTo } from "../../play/main.js";
import { cacheBlock } from "../../play/render.js";

export var params = {}

export function setParams(obj={}){
	params = obj;
}

export var game = {
	block: new class {
		type = params?.block?.type
		setBlock(block="") {
			this.type = params?.block?.type;
			PlaceBlock(block, params.block.pos.x, params.block.pos.y, params.block.pos.layer);
			return null;
		}
		getBlock(x, y, layer) {
			this.type = params?.block?.type;
			if(!x && !y && !layer) {
				return this;
			}
			let worldData = localStorage.getItem(`world.${currentWorld}`);
			worldData = JSON.parse(worldData);
			let blockName = worldData[layer-1][y][x];
			let json = cacheBlock(blockName);
			json.type = blockName;
			json.pos = { x, y, layer };
			return json;
		}
	}
}

export var player = {
	inventory: new class {
		give(item="", quantity=1) {
			return null;
		}
		take(item="", quantity=1) {
			return null;
		}
	},
	moveToWorld: switchWorldTo
}