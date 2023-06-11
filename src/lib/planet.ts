import { Vec2 } from 'raxis-core';
import { With, type ECS } from './engine/ecs';
import { Root, Sprite } from './engine/graphics';
import { Transform } from './engine/transform';
import { TreeNode, addChildren } from './engine/treenode';

export class Planet {
	constructor(public mass: number) {}
}

export function makePlanet(ecs: ECS) {
	const root = ecs.controls(ecs.queryEntities(With(Root))[0]);

	const p1 = ecs
		.entity()
		.add(
			new Planet(1e7),
			new Transform(new Vec2(500, 500), new Vec2(-500, 0), 0, new Vec2(0, 0)),
			new Sprite('ellipse', 'lightblue'),
			new TreeNode()
		);

	const p2 = ecs
		.entity()
		.add(
			new Planet(1e6),
			new Transform(new Vec2(100, 100), new Vec2(500, 200)),
			new Sprite('ellipse', 'skyblue'),
			new TreeNode()
		);

	addChildren(root, p1, p2);
}

export const G: number = 6.6743;

export function getGAcc(m1: number, p1: Transform, p2: Transform): Vec2 {
	const g = (G * m1) / Math.max(p2.pos.distanceToSq(p1.pos), p1.size.x / 2);

	const dir = p1.pos.clone().sub(p2.pos).normalize();

	return dir.mulScalar(g);
}
