import { EventInfo, EventType } from '../interfaces';

export class EventInfoStack implements EventInfo {
	private _stack: any[];
	constructor() {
		let that = this;
		that._stack = [];
	}

	public push(info: any): void {
		let that = this;
		that._stack.push(info);
	}
	public pop(): void {
		let that = this;
		that._stack.pop();
	}
	public isTriggeredBy(propertyName: string, target: any): boolean {
		let that = this;
		let path = target.getPath();
		let fp = path ? path + '.' + propertyName : propertyName;
		for (let i = 0, len = that._stack.length; i < len; i++) {
			let info = that._stack[i];
			if (info && info.eventType === EventType.propChanged) {
				if (fp === info.path) return true;
			}
		}
		return false;
	}
	public destroy() {
		let that = this;
		that._stack = null;
	}
}
