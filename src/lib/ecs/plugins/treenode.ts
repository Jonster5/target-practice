import { Component, ECS } from '../engine';
import { Entity } from '../engine/entity';

export class TreeNode extends Component {
	constructor(public parent: number | null = null, public children: number[] = []) {
		super();
	}

	onDestroy(ecs: ECS, eid: number) {
		if (!this.parent) return;

		removeChild(ecs.entity(this.parent), ecs.entity(eid));
	}
}

export function addChild(parent: Entity, child: Entity) {
	const pt: TreeNode = parent.get(TreeNode);
	const ct: TreeNode = child.get(TreeNode);

	pt.children.push(child.id());
	ct.parent = parent.id();
}

export function addChildren(parent: Entity, ...children: Entity[]) {
	children.forEach((child) => addChild(parent, child));
}

export function removeChild(parent: Entity, child: Entity) {
	const pt: TreeNode = parent.get(TreeNode);
	const ct: TreeNode = child.get(TreeNode);

	pt.children.splice(pt.children.indexOf(child.id()), 1);
	if (ct !== undefined) ct.parent = null;
}

export function removeChildren(parent: Entity, ...children: Entity[]) {
	children.forEach((child) => removeChild(parent, child));
}
