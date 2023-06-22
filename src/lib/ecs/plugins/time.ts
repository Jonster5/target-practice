import { Component, ECS } from '../engine';

export class Time extends Component {
	constructor(public elapsed: number, public delta: number, public last: number) {
		super();
	}
}

export class TimeData extends Component {
	constructor(public speed: number = 1) {
		super();
	}
}

export function startTime(ecs: ECS) {
	const time = ecs.getResource(Time);

	time.last = performance.now();
}

export function updateTime(ecs: ECS) {
	const time = ecs.getResource(Time);
	const now = performance.now();

	time.delta = now - time.last;
	time.elapsed += time.delta;
	time.last = now;
}
