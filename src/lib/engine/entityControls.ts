import { type CompType, ECS } from './ecs';

export class EntityControls {
	private readonly eid: number;
	private isValid: boolean;
	private _ecs: ECS;
	private components: {
		[key: string]: any[];
	};

	constructor(
		ecs: ECS,
		compRef: {
			[key: string]: any[];
		},
		eid: number
	) {
		this._ecs = ecs;
		this.components = compRef;
		this.eid = eid;
		this.isValid = true;
	}

	addComponent(component: any) {
		if (!this.isValid) {
			throw new Error(`Entities cannot be modified after being destroyed`);
		}

		const compType = component.constructor as CompType;
		const name = compType.name;

		if (this.components[name] === undefined) {
			throw new Error(`The component type [${name}] is not registered`);
		}

		if (this.components[name][this.eid] !== undefined) {
			throw new Error(`There is already an instance of [${name}] on this entity`);
		}

		this.components[name][this.eid] = component;

		return this;
	}

	getComponent(component: CompType) {
		if (!this.isValid) {
			throw new Error(`Entities cannot be modified after being destroyed`);
		}

		const name = component.name;

		if (this.components[name] === undefined) {
			throw new Error(`The component type [${name}] is not registered`);
		}

		return this.components[name][this.eid];
	}

	add(...components: any[]) {
		components.forEach((c) => this.addComponent(c));

		return this;
	}

	get(...components: CompType[]) {
		return components.map((c) => this.getComponent(c));
	}

	ecs() {
		return this._ecs;
	}

	removeComponent(component: any) {
		if (!this.isValid) {
			throw new Error(`Entities cannot be modified after being destroyed`);
		}

		const compType = component.constructor as CompType;
		const name = compType.name;

		if (this.components[name] === undefined) {
			throw new Error(`Component Type [${name}] is not registered`);
		}

		const cIndex = this.components[name].indexOf(component);

		delete this.components[name][cIndex];
	}

	destroy() {
		this._ecs.destroy(this.eid);
		this.isValid = false;
	}

	id() {
		return this.eid;
	}
}
