import { get } from 'svelte/store';
import { With, type ECS } from './engine/ecs';
import { GameData } from './utils';
import { Transform } from './engine/transform';
import { Projectile } from './projectile';
import { Planet } from './planet';
import { Vec2 } from 'raxis-core';
import { Target } from './target';

export function projectileTargetCollisions(ecs: ECS) {
	const gd: GameData = ecs.getResource(GameData);

	if (!get(gd.inFlight)) return;

	const proj: Transform = ecs.queryComponents(Transform, With(Projectile))[0];
	const target: Transform = ecs.queryComponents(Transform, With(Target))[0];

	const rad = proj.size.x / 2;

	let closestX = proj.pos.x;
	let closestY = proj.pos.y;

	if (proj.pos.x < target.pos.x) {
		closestX = target.pos.x;
	} else if (proj.pos.x > target.pos.x + target.size.x) {
		closestX = target.pos.x + target.size.x;
	}

	if (proj.pos.y < target.pos.y) {
		closestY = target.pos.y;
	} else if (proj.pos.y > target.pos.y + target.size.y) {
		closestY = target.pos.y + target.size.y;
	}

	const distanceX = proj.pos.x - closestX;
	const distanceY = proj.pos.y - closestY;
	const distanceSquared = distanceX * distanceX + distanceY * distanceY;

	if (distanceSquared < rad * rad) {
		gd.win.set(true);
		console.log('win');
	}
}

export function projectilePlanetCollisions(ecs: ECS) {
	const gd: GameData = ecs.getResource(GameData);

	if (!get(gd.inFlight)) return;

	const proj: Transform = ecs.queryComponents(Transform, With(Projectile))[0];
	const planets: Transform[] = ecs.queryComponents(Transform, With(Planet));

	for (let planet of planets) {
		const dif = proj.pos.clone().sub(planet.pos);

		const distance = dif.mag();

		const cRadii = planet.size.x / 2 + proj.size.x / 2;

		if (distance >= cRadii) continue;

		const padding = 0.3;

		const overlap = cRadii - distance + padding;

		const dir = dif.clone().normalize();

		proj.pos.sub(dir.mulScalar(-overlap));

		const surface = new Vec2(dif.y, -dif.x);

		const sLeft = new Vec2(surface.y, -surface.x);
		const sUnit = surface.clone().normalize();

		const dp1 = proj.vel.dot(sUnit);

		const p1 = sUnit.clone().mulScalar(dp1 * 0.8);

		const dp2 = proj.vel.dot(sLeft.clone().normalize());

		const p2 = sLeft
			.clone()
			.normalize()
			.mulScalar(dp2 * 0.5);

		p2.mulScalar(-1);

		const bounce = p1.clone().add(p2);

		proj.vel.setFrom(bounce);
	}
}
