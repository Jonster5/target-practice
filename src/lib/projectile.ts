import { get, type Writable } from 'svelte/store';
import { Cannon, Launcher } from './launcher';
import { UIData } from './ui';
import { Component, ECS, ECSEvent, With } from './ecs/engine';
import { Vec2 } from './ecs/math';
import { Root, Sprite, startImageAnimation } from './ecs/plugins/graphics';
import { Time, TimeData } from './ecs/plugins/time';
import { Transform } from './ecs/plugins/transform';
import { TreeNode, addChild } from './ecs/plugins/treenode';
import { Planet, getGAcc } from './planet';

export class Projectile extends Component {
	constructor(public mass: number) {
		super();
	}
}

export class LaunchEvent extends ECSEvent {
	constructor(public launchSpeed: number, public launchAngle: number) {
		super();
	}
}

export function launchProjectile(ecs: ECS) {
	const launch = ecs.getEventReader(LaunchEvent);

	if (!launch.available()) return;

	const root = ecs.entity(ecs.queryEntities(With(Root))[0]);
	const { pos }: Transform = ecs.queryComponents(Transform, With(Launcher))[0];
	const { inFlight }: UIData = ecs.getResource(UIData);

	const pig1 = new Image(250, 250);
	pig1.src = './pig1.png';

	const pig2 = new Image(250, 250);
	pig2.src = './pig2.png';

	const pig3 = new Image(250, 250);
	pig3.src = './pig3.png';

	const pig4 = new Image(250, 250);
	pig4.src = './pig4.png';

	const pig5 = new Image(250, 250);
	pig5.src = './pig5.png';

	const pig6 = new Image(250, 250);
	pig6.src = './pig6.png';

	const projsprite = new Sprite('image', [pig1, pig2, pig3, pig4, pig5, pig6, pig5, pig4, pig3, pig2]);

	const { launchAngle, launchSpeed } = launch.get();

	const proj = ecs.spawn(
		new Projectile(1),
		new Transform(
			new Vec2(30, 30),
			pos.clone().add(new Vec2(0, 20)),
			0,
			new Vec2(launchSpeed, 0).setAngle(launchAngle)
		),
		projsprite,
		new TreeNode()
	);

	addChild(root, proj);

	startImageAnimation(projsprite, 500);

	inFlight.set(true);
}

export function calculateGravity(ecs: ECS) {
	const pq = ecs.queryComponents(Projectile);
	const tq = ecs.queryComponents(Transform, With(Projectile));

	if (!pq.length) return;

	const planets = ecs.queryEntities(With(Planet), With(Transform));
	const { mass } = pq[0],
		t = tq[0];

	const time = ecs.getResource(Time);
	const { speed } = ecs.getResource(TimeData);

	const forces = planets.map((p) => ecs.entity(p)).map((p) => getGAcc(p.get(Planet).mass, p.get(Transform), t));

	const fnet = forces.reduce((a, b) => a.add(b), new Vec2(0, 0));

	const acc = fnet.div(mass);

	t.vel.add(acc.mul((time.delta * speed) / 1000));
	t.angle = fnet.angle() + Math.PI / 2;
}
