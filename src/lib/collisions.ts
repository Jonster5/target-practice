import { Projectile } from './projectile';
import { Planet } from './planet';
import { Target } from './target';
import { get } from 'svelte/store';
import { UIData } from './ui';
import { ECS, With } from './ecs/engine';
import { Vec2 } from './ecs/math';
import { CanvasSettings, Root } from './ecs/plugins/graphics';
import { Transform } from './ecs/plugins/transform';
import { TreeNode } from './ecs/plugins/treenode';

export function projectileTargetCollisions(ecs: ECS) {
	const gd = ecs.getResource(UIData);

	if (!get(gd.inFlight)) return;

	const proj: Transform = ecs.queryComponents(Transform, With(Projectile))[0];
	const target: Transform = ecs.queryComponents(Transform, With(Target))[0];

	const rad = proj.size.x + 5;

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
		proj.vel.mul(0.9);

		gd.win.set(true);
	}
}

export function projectilePlanetCollisions(ecs: ECS) {
	const gd = ecs.getResource(UIData);

	const p = ecs.query([Transform, TreeNode], []);
	console.log(p.results());

	if (!get(gd.inFlight)) return;

	const pt: Transform = ecs.queryComponents(Transform, With(Projectile))[0];
	const planets = ecs.queryComponents(Transform, With(Planet));
	const root = ecs.entity(ecs.queryEntities(With(Root))[0]);
	const rt = root.get(Transform);

	for (let planet of planets) {
		const dif = pt.pos.clone().sub(planet.pos);

		const distance = dif.mag();

		const cRadii = planet.size.x / 2 + pt.size.x / 2;

		if (distance >= cRadii) continue;

		const padding = 0;

		const overlap = cRadii - distance + padding;

		const dir = dif.clone().unit();

		pt.pos.sub(dir.mul(-overlap));

		const surface = new Vec2(dif.y, -dif.x);

		const sLeft = surface.clone().perpLeft().unit();
		const sUnit = surface.clone().unit();

		const dp1 = pt.vel.dot(sUnit);

		const p1 = sUnit.clone().mul(dp1 * 0.8);

		const dp2 = pt.vel.dot(sLeft);

		const p2 = sLeft.clone().mul(dp2 * 0.5);

		p2.mul(-1);

		const bounce = p1.clone().add(p2);

		pt.vel.setFrom(bounce);
	}
}
