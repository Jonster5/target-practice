import { ECS, type ECSPlugin } from './ecs';

export class Time {
	constructor(public elapsed: number, public delta: number, public then: number, public lostfocus: boolean = false) {}
}

function startTime(ecs: ECS) {
	const time = ecs.getResource(Time);

	time.then = performance.now();
}

function updateTime(ecs: ECS) {
	const time = ecs.getResource(Time);
	const now = performance.now();

	time.delta = now - time.then;
	time.elapsed += time.delta;
	time.then = now;
}

function checkFocus(ecs: ECS) {
	if (document.hasFocus()) {
		return;
	} else {
		const time: Time = ecs.getResource(Time);
		time.then = 0;

		time.lostfocus = true;
	}
}

export const TimePlugin: ECSPlugin = {
	components: [],
	startup: [startTime],
	systems: [checkFocus, updateTime],
	resources: [new Time(0, 0, 0)],
};
