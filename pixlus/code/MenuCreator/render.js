import menuFile from "../menus/index.json" with {type: "json"};

var CachedMenus = {};

export default async function renderMenu(menuName=""){
	if(menuName in CachedMenus == false) await cacheMenu(menuName);
	let menuData = await CachedMenus[menuName]();
	await menuData.render();
}

async function cacheMenu(menuName){

	if(menuName in menuFile.menus == false) return false;

	let pathToMenu = menuFile.menus[menuName];

	let { default: generateCurrentMenu } = await import(`../menus/${pathToMenu}`);
	CachedMenus[menuName] = generateCurrentMenu;

	return (generateCurrentMenu);
}