import { Component, ECS, With } from './ecs/engine';
import { Vec2 } from './ecs/math';
import { Root, Sprite } from './ecs/plugins/graphics';
import { Transform } from './ecs/plugins/transform';
import { TreeNode, addChild } from './ecs/plugins/treenode';

export class Target extends Component {}

export function createTargetlvl1(ecs: ECS) {
	const root = ecs.entity(ecs.queryEntities(With(Root))[0]);

	const target = ecs.spawn(
		new Target(),
		new Transform(new Vec2(15, 50), new Vec2(0, -525)),
		new Sprite('rectangle', 'red'),
		new TreeNode()
	);

	addChild(root, target);
}

export function createTargetlvl2(ecs: ECS) {
	const root = ecs.entity(ecs.queryEntities(With(Root))[0]);

	const target = ecs.spawn(
		new Target(),
		new Transform(new Vec2(15, 50), new Vec2(1500, -325)),
		new Sprite('rectangle', 'red'),
		new TreeNode()
	);

	addChild(root, target);
}

export function createTargetlvl3(ecs: ECS) {
	const root = ecs.entity(ecs.queryEntities(With(Root))[0]);

	const target = ecs.spawn(
		new Target(),
		new Transform(new Vec2(15, 50), new Vec2(2000, 775)),
		new Sprite('rectangle', 'red'),
		new TreeNode()
	);

	addChild(root, target);
}
