import { Vec2 } from 'raxis-core';
import { ECS, With } from './engine/ecs';
import { Root, Sprite } from './engine/graphics';
import { Transform, GameSettings } from './engine/transform';
import { TreeNode, addChild, removeChild } from './engine/treenode';
import { Projectile } from './projectile';
import { Time } from './engine/time';

export class Trail {}

export class TrailTracker {
	constructor(
		public ready: boolean = true,
		public last: Vec2 = undefined,
		public tbdestroyed: boolean = false,
		public time: number = 0
	) {}
}

export function spawnTrail(ecs: ECS) {
	if (!document.hasFocus()) return;

	const tracker: TrailTracker = ecs.getResource(TrailTracker);
	const projectileQuery = ecs.queryEntities(With(Projectile))[0];
	const time: Time = ecs.getResource(Time);
	const { speed }: GameSettings = ecs.getResource(GameSettings);

	tracker.time += time.delta;

	if (!tracker.ready || !projectileQuery || tracker.time < 100 / speed) return;

	tracker.time = 0;

	const root = ecs.controls(ecs.queryEntities(With(Root))[0]);
	const proj = ecs.controls(projectileQuery);
	const { pos } = proj.getComponent(Transform);

	if (!tracker.last) tracker.last = pos.clone();

	const length = tracker.last.distanceTo(pos);
	const mid = tracker.last.clone().add(pos).divScalar(2);
	const angle = pos.clone().sub(tracker.last).angle();

	const dot = ecs
		.entity()
		.add(new Trail(), new Transform(new Vec2(5, 5), pos.clone()), new Sprite('ellipse', '#eeddff'), new TreeNode());

	tracker.last = pos.clone();

	addChild(root, dot);
	removeChild(root, proj);
	addChild(root, proj);
}

export function destroyTrail(ecs: ECS) {
	const tt: TrailTracker = ecs.getResource(TrailTracker);
	const root = ecs.controls(ecs.queryEntities(With(Root))[0]);

	if (!tt.tbdestroyed) return;

	const trail = ecs.queryEntities(With(Trail));

	if (trail.length === 0) return;

	trail.forEach((e) => {
		removeChild(root, ecs.controls(e));
		ecs.destroy(e);
	});

	tt.tbdestroyed = false;
}
