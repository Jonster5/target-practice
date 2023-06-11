import { Vec2 } from 'raxis-core';
import { With, type ECS } from './engine/ecs';
import { Root, Sprite } from './engine/graphics';
import { Transform, globalPos } from './engine/transform';
import { TreeNode, addChild, addChildren, removeChild } from './engine/treenode';
import { Inputs } from './engine/input';
import { Projectile, ProjectileData } from './projectile';
import { get } from 'svelte/store';
import { GameData } from './utils';
import { Trail, TrailTracker } from './trail';

export class Launcher {}

export class Cannon {
	constructor(public visual: number) {}
}

export function setupLauncher(ecs: ECS) {
	const root = ecs.controls(ecs.queryEntities(With(Root))[0]);
	const { keymap }: Inputs = ecs.getResource(Inputs);
	const pd: ProjectileData = ecs.getResource(ProjectileData);

	const launcher = ecs
		.entity()
		.add(new Launcher(), new Transform(new Vec2(0, 0), new Vec2(-500, 270)), new Sprite('none'), new TreeNode());

	const base = ecs
		.entity()
		.add(new Transform(new Vec2(40, 40), new Vec2(0, 0)), new Sprite('ellipse', 'gray'), new TreeNode());

	const velstrength = ecs
		.entity()
		.add(
			new Transform(new Vec2(get(pd.launchSpeed), 3), new Vec2(30 + get(pd.launchSpeed) / 2, 0)),
			new Sprite('rectangle', 'lime'),
			new TreeNode()
		);

	const cannon = ecs
		.entity()
		.add(
			new Cannon(velstrength.id()),
			new Transform(new Vec2(40, 20), new Vec2(0, 20)),
			new Sprite('rectangle', 'crimson'),
			new TreeNode()
		);

	addChild(cannon, velstrength);
	addChildren(launcher, cannon, base);
	addChild(root, launcher);

	keymap.get(' ').onKeyDown(() => {
		if (ecs.queryComponents(Projectile).length) return;

		const { inFlight }: GameData = ecs.getResource(GameData);

		const tracker: TrailTracker = ecs.getResource(TrailTracker);

		inFlight.set(true);
		tracker.tbdestroyed = true;
		tracker.ready = true;
		tracker.time = 0;
		pd.tblaunched = true;
	});
}

export function handleLaunchSpeedVisual(ecs: ECS) {
	const pd: ProjectileData = ecs.getResource(ProjectileData);
	const cannon: Cannon = ecs.queryComponents(Cannon)[0];
	const gd: GameData = ecs.getResource(GameData);

	const visual = ecs.controls(cannon.visual);

	if (get(gd.inFlight)) {
		visual.getComponent(Sprite).visible = false;
		return;
	}

	visual.getComponent(Sprite).visible = true;

	visual.getComponent(Transform).size.x = (get(pd.launchSpeed) / 50) ** 2;
	visual.getComponent(Transform).pos.x = (get(pd.launchSpeed) / 50) ** 2 / 2 + 30;
}

export function rotateCannon(ecs: ECS) {
	const { keymap }: Inputs = ecs.getResource(Inputs);
	const ct: Transform = ecs.queryComponents(Transform, With(Cannon))[0];
	const pd: ProjectileData = ecs.getResource(ProjectileData);

	let nvel = 0;

	if (keymap.get('a').isDown || keymap.get('ArrowLeft').isDown) {
		nvel += Math.PI / 2;
	}

	if (keymap.get('d').isDown || keymap.get('ArrowRight').isDown) {
		nvel -= Math.PI / 2;
	}

	ct.avel = nvel;

	pd.launchAngle.set(ct.angle);
}
