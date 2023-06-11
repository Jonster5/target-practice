import { Vec2 } from 'raxis-core';
import { With, type ECS } from './engine/ecs';
import { Root, Sprite } from './engine/graphics';
import { GameSettings, Transform } from './engine/transform';
import { TreeNode, addChild, removeChild } from './engine/treenode';
import { G, Planet, getGAcc } from './planet';
import { Time } from './engine/time';
import { Inputs } from './engine/input';
import { get, type Writable } from 'svelte/store';
import { Cannon, Launcher } from './launcher';

export class Projectile {
	constructor(public mass: number) {}
}

export class ProjectileData {
	constructor(
		public launchSpeed: Writable<number>,
		public launchAngle: Writable<number>,
		public tblaunched: boolean = false
	) {}
}

export function launchProjectile(ecs: ECS) {
	const root = ecs.controls(ecs.queryEntities(With(Root))[0]);
	const { pos }: Transform = ecs.queryComponents(Transform, With(Launcher))[0];
	const pd: ProjectileData = ecs.getResource(ProjectileData);

	if (!pd.tblaunched) return;

	const proj = ecs
		.entity()
		.add(
			new Projectile(1),
			new Transform(
				new Vec2(30, 30),
				pos.clone().add(new Vec2(0, 20)),
				0,
				new Vec2(get(pd.launchSpeed), 0).setAngle(get(pd.launchAngle))
			),
			new Sprite('ellipse', 'ellipse'),
			new TreeNode()
		);

	addChild(root, proj);

	pd.tblaunched = false;
}

export function changeLaunchspeed(ecs: ECS) {
	const { keymap }: Inputs = ecs.getResource(Inputs);
	const pd: ProjectileData = ecs.getResource(ProjectileData);

	if (keymap.get('w').isDown || keymap.get('ArrowUp').isDown) {
		pd.launchSpeed.update((s) => s + 1);
	}
	if (keymap.get('s').isDown || keymap.get('ArrowDown').isDown) {
		pd.launchSpeed.update((s) => s - 1);
	}
}

export function calculateGravity(ecs: ECS) {
	if (!document.hasFocus()) return;

	const projectileQuery: [Projectile, Transform][] = ecs.queryComponents([Projectile, Transform]);

	if (!projectileQuery.length) return;

	const planets: [Planet, Transform][] = ecs.queryComponents([Planet, Transform]);
	const [{ mass }, t]: [Projectile, Transform] = projectileQuery[0];
	const time = ecs.getResource(Time);
	const { speed }: GameSettings = ecs.getResource(GameSettings);

	const forces = planets.map(([{ mass: m1 }, p1]) => getGAcc(m1, p1, t));

	const fnet = forces.reduce((a, b) => a.add(b), new Vec2(0, 0));

	const acc = fnet.divScalar(mass);

	t.vel.add(acc.mulScalar((time.delta * speed) / 1000));
}
