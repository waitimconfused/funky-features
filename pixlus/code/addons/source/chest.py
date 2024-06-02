from ..lib.runtime import game, player

def place():
	print("PLACED!")

def interact():
	this_block = game.block.getBlock()

	if(this_block.type == "chest"):
		player.inventory.give("diamond", 1)
		print(game.block.getBlock())
		game.block.setBlock("chest:opened")
		print("Opened Chest")

	else:
		print(game.block.getBlock())
		game.block.setBlock("chest")
		print("Closed Chest")