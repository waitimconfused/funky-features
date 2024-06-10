export class Camera {
	pos = { x: 0, y: 0 };

	moveTo(x=0, y=0){
		this.pos.x = x;
		this.pos.y = y;

		return this;
	}
}
export default new Camera;