import { ECS, type ECSPlugin } from './ecs';

export class Time {
	constructor(public elapsed: number, public delta: number, public then: number) {}
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

export const TimePlugin: ECSPlugin = {
	components: [],
	startup: [startTime],
	systems: [updateTime],
	resources: [new Time(0, 0, 0)],
};
