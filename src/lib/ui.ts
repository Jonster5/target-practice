import { type Writable, get } from 'svelte/store';
import { Projectile } from './projectile';
import { Component, ECS, ECSEvent, type QueryDef, With, Without } from './ecs/engine';
import { Canvas, Root } from './ecs/plugins/graphics';
import { Transform } from './ecs/plugins/transform';
import { Cannon, Launcher } from './launcher';
import {
	BackOut,
	CircOut,
	ElasticOut,
	ExpoOut,
	QuadInOut,
	SineOut,
	TweenBase,
	TweenManager,
} from './ecs/plugins/tween';
import { BasicTween } from './ecs/plugins/tween/statictween';
import { Tween } from './ecs/plugins/tween/activetween';
import { Vec2 } from './ecs/math';
import { TreeNode } from './ecs/plugins/treenode';

export class UIData extends Component {
	constructor(
		public inFlight: Writable<boolean>,
		public win: Writable<boolean>,
		public speed: Writable<number>,
		public angle: Writable<number>
	) {
		super();
	}
}

export class ResetEvent extends ECSEvent {}

export class SetSpeedEvent extends ECSEvent {
	constructor(public speed: number) {
		super();
	}
}

export function updateUIData(ecs: ECS) {
	const ui = ecs.getResource(UIData);
	const setSpeed = ecs.getEventReader(SetSpeedEvent);
	const launcher = ecs.queryComponents(Launcher)[0];
	const { angle } = ecs.queryComponents(Transform, With(Cannon))[0];

	if (setSpeed.available()) launcher.speed = setSpeed.get().speed;

	ui.speed.set(launcher.speed);
	ui.angle.set(angle);
}

export function followProjectileAfterAnimation(ecs: ECS) {
	const { inFlight } = ecs.getResource(UIData);
	const root = ecs.entity(ecs.queryEntities(With(Root))[0]);

	if (!get(inFlight)) return;

	const rt = root.get(Transform);
	const pt = ecs.queryComponents(Transform, With(Projectile))[0];

	rt.pos.setFrom(pt.pos.clone().mul(-1));
}

export function checkForReset(ecs: ECS) {
	const { inFlight } = ecs.getResource(UIData);
	const reset = ecs.getEventReader(ResetEvent);
	const root = ecs.entity(ecs.queryEntities(With(Root))[0]);

	const canvas = ecs.entity(ecs.queryEntities(With(Canvas))[0]);

	if (!reset.available()) return;

	const projectile = ecs.queryEntities(With(Projectile))[0];

	if (projectile) ecs.destroy(projectile);

	canvas
		.get(TweenManager)
		.tweens.set(
			'zoom',
			new Tween(canvas.get(Canvas), { zoom: 1 }, Math.sqrt(root.get(Transform).pos.mag()) * 30, QuadInOut)
		);
	root.get(TweenManager).tweens.set(
		'pos',
		new Tween(root.get(Transform).pos, { x: 0, y: 0 }, Math.sqrt(root.get(Transform).pos.mag()) * 30, BackOut)
	);

	inFlight.set(false);
}

export function setupTweenableEntities(ecs: ECS) {
	const canvas = ecs.entity(ecs.queryEntities(With(Canvas))[0]);
	const root = ecs.entity(ecs.queryEntities(With(Root))[0]);

	canvas.insert(new TweenManager());
	root.insert(new TweenManager());
}
