import { LaunchEvent, Projectile } from './projectile';
import { get } from 'svelte/store';
import { UIData } from './ui';
import { DestroyTrailEvent, NextTrailReadyEvent, Trail, TrailTracker } from './trail';
import { Component, ECS, With } from './ecs/engine';
import { Vec2 } from './ecs/math';
import { Canvas, Root, Sprite } from './ecs/plugins/graphics';
import { Inputs } from './ecs/plugins/input';
import { Transform } from './ecs/plugins/transform';
import { TreeNode, addChild, addChildren } from './ecs/plugins/treenode';
import { CircIn, CubicInOut, ExpoIn, QuadInOut, TweenBase, TweenManager } from './ecs/plugins/tween';
import { BasicTween } from './ecs/plugins/tween/statictween';
import { Tween } from './ecs/plugins/tween/activetween';

export class Launcher extends Component {
	constructor(public speed: number) {
		super();
	}
}

export class Cannon extends Component {
	constructor(public visual: number) {
		super();
	}
}

export function setupLaunchAction(ecs: ECS) {
	const { keymap } = ecs.getResource(Inputs);
	const canvas = ecs.entity(ecs.queryEntities(With(Canvas))[0]);

	keymap.get(' ').onKeyDown(() => {
		if (ecs.queryComponents(Projectile).length) return;
		const { speed } = ecs.queryComponents(Launcher)[0];
		const { pos } = ecs.queryComponents(Transform, With(Launcher))[0];
		const { angle } = ecs.queryComponents(Transform, With(Cannon))[0];

		canvas.get(TweenManager).tweens.set('zoom', new Tween(canvas.get(Canvas), { zoom: 2 }, 500, QuadInOut));

		ecs.getEventWriter(DestroyTrailEvent).send();
		ecs.getEventWriter(NextTrailReadyEvent).send(new NextTrailReadyEvent(pos.clone()));
		ecs.getEventWriter(LaunchEvent).send(new LaunchEvent(speed, angle));
	});
}

export function setupLauncherlvl1(ecs: ECS) {
	const root = ecs.entity(ecs.queryEntities(With(Root))[0]);

	const launcher = ecs.spawn(
		new Launcher(500),
		new Transform(new Vec2(0, 0), new Vec2(0, 520)),
		new Sprite('none'),
		new TreeNode()
	);

	const base = ecs.spawn(
		new Transform(new Vec2(40, 40), new Vec2(0, 0)),
		new Sprite('ellipse', 'gray'),
		new TreeNode()
	);

	const velstrength = ecs.spawn(
		new Transform(new Vec2(launcher.get(Launcher).speed, 3), new Vec2(30 + launcher.get(Launcher).speed / 2, 0)),
		new Sprite('rectangle', 'lime'),
		new TreeNode()
	);

	const cannon = ecs.spawn(
		new Cannon(velstrength.id()),
		new Transform(new Vec2(40, 20), new Vec2(0, 20)),
		new Sprite('rectangle', 'crimson'),
		new TreeNode()
	);

	addChild(cannon, velstrength);
	addChildren(launcher, cannon, base);
	addChild(root, launcher);
}

export function setupLauncherlvl2(ecs: ECS) {
	const root = ecs.entity(ecs.queryEntities(With(Root))[0]);

	const launcher = ecs.spawn(
		new Launcher(500),
		new Transform(new Vec2(0, 0), new Vec2(-1500, 320)),
		new Sprite('none'),
		new TreeNode()
	);

	const base = ecs.spawn(
		new Transform(new Vec2(40, 40), new Vec2(0, 0)),
		new Sprite('ellipse', 'gray'),
		new TreeNode()
	);

	const velstrength = ecs.spawn(
		new Transform(new Vec2(launcher.get(Launcher).speed, 3), new Vec2(30 + launcher.get(Launcher).speed / 2, 0)),

		new Sprite('rectangle', 'lime'),
		new TreeNode()
	);

	const cannon = ecs.spawn(
		new Cannon(velstrength.id()),
		new Transform(new Vec2(40, 20), new Vec2(0, 20)),
		new Sprite('rectangle', 'crimson'),
		new TreeNode()
	);

	addChild(cannon, velstrength);
	addChildren(launcher, cannon, base);
	addChild(root, launcher);
}

export function setupLauncherlvl3(ecs: ECS) {
	const root = ecs.entity(ecs.queryEntities(With(Root))[0]);
	const { keymap } = ecs.getResource(Inputs);
	const launch = ecs.getEventWriter(LaunchEvent);

	const launcher = ecs.spawn(
		new Launcher(1000),
		new Transform(new Vec2(0, 0), new Vec2(-2000, -780)),
		new Sprite('none'),
		new TreeNode()
	);

	const base = ecs.spawn(
		new Transform(new Vec2(40, 40), new Vec2(0, 0)),
		new Sprite('ellipse', 'gray'),
		new TreeNode()
	);

	const velstrength = ecs.spawn(
		new Transform(new Vec2(launcher.get(Launcher).speed, 3), new Vec2(30 + launcher.get(Launcher).speed / 2, 0)),

		new Sprite('rectangle', 'lime'),
		new TreeNode()
	);

	const cannon = ecs.spawn(
		new Cannon(velstrength.id()),
		new Transform(new Vec2(40, 20), new Vec2(0, 20)),
		new Sprite('rectangle', 'crimson'),
		new TreeNode()
	);

	addChild(cannon, velstrength);
	addChildren(launcher, cannon, base);
	addChild(root, launcher);
}

export function handleLaunchSpeedVisual(ecs: ECS) {
	const cannon = ecs.queryComponents(Cannon)[0];
	const { speed } = ecs.queryComponents(Launcher)[0];
	const gd = ecs.getResource(UIData);

	const visual = ecs.entity(cannon.visual);

	if (get(gd.inFlight)) {
		visual.get(Sprite).visible = false;
		return;
	}

	visual.get(Sprite).visible = true;

	visual.get(Transform).size.x = (speed / 50) ** 2;
	visual.get(Transform).pos.x = (speed / 50) ** 2 / 2 + 30;
}

export function changeLaunchspeed(ecs: ECS) {
	const { keymap } = ecs.getResource(Inputs);
	const gd = ecs.getResource(UIData);
	const launcher = ecs.queryComponents(Launcher)[0];

	if (get(gd.inFlight)) return;

	if (keymap.get('w').isDown || keymap.get('ArrowUp').isDown) {
		launcher.speed++;
	}
	if (keymap.get('s').isDown || keymap.get('ArrowDown').isDown) {
		launcher.speed--;
	}
}

export function rotateCannon(ecs: ECS) {
	const { keymap } = ecs.getResource(Inputs);
	const ct: Transform = ecs.queryComponents(Transform, With(Cannon))[0];
	const gd = ecs.getResource(UIData);

	if (get(gd.inFlight)) {
		ct.avel = 0;
		return;
	}

	let nvel = 0;

	if (keymap.get('a').isDown || keymap.get('ArrowLeft').isDown) {
		nvel += Math.PI / 2;
	}

	if (keymap.get('d').isDown || keymap.get('ArrowRight').isDown) {
		nvel -= Math.PI / 2;
	}

	ct.avel = nvel;
}
