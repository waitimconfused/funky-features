export var speed = 150;
	
export function Milliseconds(){
	return( performance.now() );
};

export default function getFrame(arg, customSpeed=speed){

	if(Array.isArray(arg)){

		// ( Math.round( Milliseconds() / speed ) % arg.length)
		let actuallFrame = Milliseconds() / customSpeed;
		actuallFrame = Math.floor(actuallFrame);
		actuallFrame = actuallFrame % arg.length;

		return arg[actuallFrame];
	}else if(Number.isInteger(arg)){
		let frameNumber = 0;

		if(arg > 0){
			let arrayOfNumberedFrames = [];
			for(let i = 0; i < arg; i++){
				arrayOfNumberedFrames.push(i);
			}
			let actuallFrame = Milliseconds() / customSpeed;
			actuallFrame = Math.floor(actuallFrame);
			actuallFrame = actuallFrame % arrayOfNumberedFrames.length;
			frameNumber = actuallFrame;
		}
		return frameNumber;
	}else if(typeof arg == "string"){
		return arg;
	}else{
		return 0;
	}
}