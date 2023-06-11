import { Vec2 } from 'raxis-core';
import { ECS, Without } from './ecs';
import { Root } from './graphics';
import { Time } from './time';
import type { EntityControls } from './entityControls';
import { TreeNode } from './treenode';

export class Transform {
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
	) {}
}

export class GameSettings {
	constructor(public speed: number = 1) {}
}

export function updateTransform(ecs: ECS) {
	if (!document.hasFocus()) return;

	const time: Time = ecs.getResource(Time);
	const { speed }: GameSettings = ecs.getResource(GameSettings);
	const transforms: Transform[] = ecs.queryComponents(Transform, Without(Root));

	transforms.forEach((t) => {
		t.last.pos.setFrom(t.pos);
		t.last.angle = t.angle;

		t.pos.add(t.vel.clone().mulScalar((time.delta * speed) / 1000));
		t.angle += ((time.delta * speed) / 1000) * t.avel;
	});
}

export function globalPos(entity: EntityControls): Vec2 {
	const [node, t] = entity.get(TreeNode, Transform);

	if (node.parent) {
		return globalPos(entity.ecs().controls(node.parent)).add(t.pos);
	} else {
		return new Vec2(0, 0);
	}
}
