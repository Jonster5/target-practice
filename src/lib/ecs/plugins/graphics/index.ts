import { ECS } from '../../engine/ecs';
import { Time, TimeData } from '../time';
import { Transform } from '../transform';

export function checkGraphicsCompatibility(ecs: ECS) {
	const hasTime = !!ecs.getResource(Time);
	const hasTimeData = !!ecs.getResource(TimeData);

	const hasTransform = ecs.hasComponent(Transform);

	if (!hasTime || !hasTimeData) {
		throw new Error(`raxis-plugin-graphics requires plugin [raxis-plugin-time]`);
	}

	if (!hasTransform) {
		throw new Error(`raxis-plugin-graphics requires plugin [raxis-plugin-transform]`);
	}
}

export * from './canvas';
export * from './sprite';
