import { Component, ECS, ECSEvent, With } from './ecs/engine';
import { Vec2 } from './ecs/math';
import { Root, Sprite } from './ecs/plugins/graphics';
import { Time, TimeData } from './ecs/plugins/time';
import { Transform } from './ecs/plugins/transform';
import { TreeNode, addChild, removeChild } from './ecs/plugins/treenode';
import { Projectile } from './projectile';

export class Trail extends Component {}

export class TrailTracker extends Component {
	constructor(public ready: boolean = true, public last: Vec2 = undefined, public time: number = 0) {
		super();
	}
}

export class NextTrailReadyEvent extends ECSEvent {
	constructor(public last: Vec2) {
		super();
	}

	clone(): ECSEvent {
		return new NextTrailReadyEvent(this.last.clone());
	}
}

export class DestroyTrailEvent extends ECSEvent {}

export class TrailTime extends Component {
	constructor(public elapsed: number) {
		super();
	}
}

export function spawnTrail(ecs: ECS) {
	const nextTrailReady = ecs.getEventWriter(NextTrailReadyEvent);
	const ready = ecs.getEventReader(NextTrailReadyEvent);
	const projectileQuery = ecs.queryEntities(With(Projectile))[0];
	if (!projectileQuery) return;

	if (!ready.available()) return;

	const { speed } = ecs.getResource(TimeData);

	const proj = ecs.entity(projectileQuery);
	const { pos, size, vel }: Transform = proj.get(Transform);
	const { last } = ready.get();

	const root = ecs.entity(ecs.queryEntities(With(Root))[0]);

	const length = last.distanceTo(pos);
	const mid = last.clone().add(pos).div(2);
	const angle = pos.clone().sub(last).angle();

	const dot = ecs.spawn(
		new Trail(),
		new Transform(new Vec2(length + 0.1, 3), mid, angle),
		new Sprite('rectangle', '#eeddff'),
		new TreeNode()
	);

	addChild(root, dot);
	removeChild(root, proj);
	addChild(root, proj);

	setTimeout(
		(p: Vec2) => nextTrailReady.send(new NextTrailReadyEvent(p)),
		(size.x / 2 / vel.mag() / speed) * 1000,
		pos.clone()
	);
}

export function destroyTrail(ecs: ECS) {
	const root = ecs.entity(ecs.queryEntities(With(Root))[0]);
	const dte = ecs.getEventReader(DestroyTrailEvent);

	if (!dte.available()) return;

	const trail = ecs.queryEntities(With(Trail));

	if (trail.length === 0) return;

	trail.forEach((e) => {
		removeChild(root, ecs.entity(e));
		ecs.destroy(e);
	});
}
