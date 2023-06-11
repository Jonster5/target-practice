import { Vec2 } from 'raxis-core';
import { With, type ECS } from './engine/ecs';
import { Root, Sprite } from './engine/graphics';
import { Transform } from './engine/transform';
import { TreeNode, addChild } from './engine/treenode';

export class Target {}

export function createTarget(ecs: ECS) {
	const root = ecs.controls(ecs.queryEntities(With(Root))[0]);

	const target = ecs
		.entity()
		.add(
			new Target(),
			new Transform(new Vec2(15, 50), new Vec2(0, -525)),
			new Sprite('rectangle', 'red'),
			new TreeNode()
		);

	addChild(root, target);
}
