import { Component, ECS, type ECSPlugin } from '../engine';
import { Entity } from '../engine/entity';
import { Vec2 } from '../math/vec2';
import { Time, TimeData } from './time';
import { TreeNode } from './treenode';

export class Transform extends Component {
	constructor(
		public size: Vec2 = new Vec2(0, 0),
		public pos: Vec2 = new Vec2(0, 0),
		public angle: number = 0,
		public vel: Vec2 = new Vec2(0, 0),
		public avel: number = 0,
		public last: {
			pos: Vec2;
			angle: number;
		} = {
			pos: new Vec2(0, 0),
			angle: 0,
		}
	) {
		super();
	}
}

export function updateTransform(ecs: ECS) {
	const time = ecs.getResource(Time);
	const { speed } = ecs.getResource(TimeData);
	const transforms = ecs.queryComponents(Transform) as Transform[];

	transforms.forEach((t) => {
		t.last.pos.setFrom(t.pos);
		t.last.angle = t.angle;

		t.pos.add(t.vel.clone().mul((time.delta * speed) / 1000));
		t.angle += ((time.delta * speed) / 1000) * t.avel;
	});
}

export function globalPos(entity: Entity): Vec2 {
	const node = entity.get(TreeNode);
	const t = entity.get(Transform);

	if (node.parent) {
		return globalPos(entity.ecs.entity(node.parent)).add(t.pos);
	} else {
		return new Vec2(0, 0);
	}
}

export function checkTransformCompatibility(ecs: ECS) {
	const hasTime = !!ecs.getResource(Time);
	const hasTimeData = !!ecs.getResource(TimeData);

	if (!hasTime || !hasTimeData) {
		throw new Error(`raxis-plugin-transform requires plugin [raxis-plugin-time]`);
	}
}
