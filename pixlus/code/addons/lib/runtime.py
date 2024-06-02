##
# This is just the general structure
# All code is non-working
##

plugins = {}
def loadPlugin(name="", type=""):
	plugins[name] = type

class PLUGIN:
	type = ""
	block = ""
plugin = PLUGIN

params = {}

def setParams(obj):
	global params
	params = obj

class game:
	class block:
		type = ""
		def setBlock(block=""): return None
		def getBlock(self, x=0, y=0, layer=0): return self

class player:
	class inventory:
		def give(item="", quantity=1):
			"""Add an item to the players invintory, with specified quantity"""
			return None
		def take(item="", quantity=1):
			"""Remove an item to the players invintory, with specified quantity"""
			return None
	def moveToWorld(worldName=""):
		return None

async def delay(seconds=1):
	"""Wait <seconds> before running the next line"""
	return True

# export function sleep(seconds=1) {
# 	let milliseconds = seconds * 1000;
# 	return new Promise(resolve => setTimeout(resolve, milliseconds));
# }