export var block = new class {

	type = "";
	variant = "";

	actions = {
		build: function(){},
		interact: function(){}
	}

	getObjectValue_fromKeys(keys=[""]){
		let value = keys.reduce((obj, key) => (obj || {})[key], this);
		return value;
	}
	setObjectValue_fromKeys(keys=[""], newValue=""){
		keys.reduce((obj, key, index, keys) => {
			if(index == keys.length - 1){
				obj[key] = newValue; // set new value
			}else{
				return (obj || {})[key];
			}
		}, this);
		return this;
	}

	get(key=[""]){
		return this.getObjectValue_fromKeys(key);
	}

	set(key, value){
		this.setObjectValue_fromKeys(key.split("."), value);
	}

	constructor(posX=0, posY=0, layer=0){

	}

}(0, 0, 0);

export var player = new class {
	inventory = {
		items: [],
		removeItem: function(item){
			let indexOfItem = this.items.indexOf(item);
			if(indexOfItem == -1) return;
			this.items.splice(indexOfItem, 1);
		},
		give: function(item){
			this.items.push(item);
		}
	};
	getObjectValue_fromKeys(keys=[""]){
		let value = keys.reduce((obj, key) => (obj || {})[key], this);
		return value;
	}
	setObjectValue_fromKeys(keys=[""], newValue=""){
		keys.reduce((obj, key, index, keys) => {
			if(index == keys.length - 1){
				obj[key] = newValue; // set new value
			}else{
				return (obj || {})[key];
			}
		}, this);
		return this;
	}

	get(key){
		return this.getObjectValue_fromKeys(key.split("."));
	}

	set(key, value){
		this.setObjectValue_fromKeys(key.split("."), value);
	}
}