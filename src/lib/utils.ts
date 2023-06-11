import { get, type Writable } from 'svelte/store';
import { With, type ECS } from './engine/ecs';
import { Root, Sprite } from './engine/graphics';
import { TreeNode, removeChild } from './engine/treenode';
import { Projectile } from './projectile';
import { Trail, TrailTracker } from './trail';
import { Transform } from './engine/transform';

export class GameData {
	constructor(public reset: Writable<boolean>, public inFlight: Writable<boolean>, public win: Writable<boolean>) {}
}

export function checkForReset(ecs: ECS) {
	const { reset, inFlight }: GameData = ecs.getResource(GameData);

	if (!get(reset)) return;

	const root = ecs.controls(ecs.queryEntities(With(Root))[0]);
	const projectile = ecs.queryEntities(With(Projectile))[0];
	const tt: TrailTracker = ecs.getResource(TrailTracker);

	ecs.destroy(projectile);

	tt.last = undefined;

	reset.set(false);
	inFlight.set(false);
}
