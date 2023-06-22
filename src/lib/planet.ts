import { Component, ECS, With } from './ecs/engine';
import { Vec2 } from './ecs/math';
import { Root, Sprite } from './ecs/plugins/graphics';
import { Transform } from './ecs/plugins/transform';
import { TreeNode, addChildren } from './ecs/plugins/treenode';

export class Planet extends Component {
	constructor(public mass: number) {
		super();
	}
}

export function makePlanetlvl1(ecs: ECS) {
	const root = ecs.entity(ecs.queryEntities(With(Root))[0]);

	const p1 = ecs.spawn(
		new Planet(5e7),
		new Transform(new Vec2(1000, 1000), new Vec2(0, 0), 0, new Vec2(0, 0)),
		new Sprite('ellipse', 'lightblue'),
		new TreeNode()
	);

	addChildren(root, p1);
}

export function makePlanetlvl2(ecs: ECS) {
	const root = ecs.entity(ecs.queryEntities(With(Root))[0]);

	const p1 = ecs.spawn(
		new Planet(1e7),
		new Transform(new Vec2(600, 600), new Vec2(-1500, 0), 0, new Vec2(0, 0)),
		new Sprite('ellipse', 'aqua'),
		new TreeNode()
	);

	const p2 = ecs.spawn(
		new Planet(1e7),
		new Transform(new Vec2(600, 600), new Vec2(1500, 0), 0, new Vec2(0, 0)),
		new Sprite('ellipse', '#bded7e'),
		new TreeNode()
	);

	addChildren(root, p1, p2);
}

export function makePlanetlvl3(ecs: ECS) {
	const root = ecs.entity(ecs.queryEntities(With(Root))[0]);

	const p1 = ecs.spawn(
		new Planet(2e7),
		new Transform(new Vec2(400, 400), new Vec2(-2000, -1000), 0, new Vec2(0, 0)),
		new Sprite('ellipse', 'aqua'),
		new TreeNode()
	);

	const p2 = ecs.spawn(
		new Planet(1e7),
		new Transform(new Vec2(200, 200), new Vec2(-1200, 500), 0, new Vec2(0, 0)),
		new Sprite('ellipse', '#bded7e'),
		new TreeNode()
	);

	const p3 = ecs.spawn(
		new Planet(6e7),
		new Transform(new Vec2(800, 800), new Vec2(0, 0), 0, new Vec2(0, 0)),
		new Sprite('ellipse', 'red'),
		new TreeNode()
	);

	const p4 = ecs.spawn(
		new Planet(1e7),
		new Transform(new Vec2(200, 200), new Vec2(1200, -500), 0, new Vec2(0, 0)),
		new Sprite('ellipse', '#bded7e'),
		new TreeNode()
	);

	const p5 = ecs.spawn(
		new Planet(2e7),
		new Transform(new Vec2(400, 400), new Vec2(2000, 1000), 0, new Vec2(0, 0)),
		new Sprite('ellipse', 'aqua'),
		new TreeNode()
	);

	addChildren(root, p1, p2, p3, p4, p5);
}

export const G: number = 6.6743;

export function getGAcc(m1: number, p1: Transform, p2: Transform): Vec2 {
	const g = (G * m1) / Math.max(p2.pos.distanceToSq(p1.pos), p1.size.x / 2);

	const dir = p1.pos.clone().sub(p2.pos).unit();

	return dir.mul(g);
}
