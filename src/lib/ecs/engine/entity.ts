import type { CompType, Component } from './component';
import { ECS } from './ecs';
import type { QueryDef, QueryHandler } from './query';

export class Entity {
	private readonly eid: number;
	private isValid: boolean;
	private _ecs: ECS;
	private compRef: Map<CompType, Component[]>;
	private queries: Map<QueryDef, QueryHandler>;

	constructor(ecs: ECS, compRef: Map<CompType, Component[]>, queries: Map<QueryDef, QueryHandler>, eid: number) {
		this._ecs = ecs;
		this.compRef = compRef;
		this.queries = queries;
		this.eid = eid;
		this.isValid = true;
	}

	has(type: CompType): boolean {
		if (this.compRef.get(type)[this.eid] !== undefined) return true;
		return false;
	}

	insert(...comps: Component[]) {
		if (!this.isValid) {
			throw new Error(`Entities cannot be modified after being destroyed`);
		}

		comps.forEach((comp) => {
			const type = comp.getType();

			if (!this.compRef.has(type)) {
				throw new Error(`The component type [${comp.getName()}] is not registered`);
			}

			if (this.compRef.get(type)[this.eid] !== undefined) {
				throw new Error(`There is already an instance of [${comp.getName()}] on this entity`);
			}

			this.compRef.get(type)[this.eid] = comp;
		});

		comps.forEach((comp) => {
			const type = comp.getType();

			for (let handler of this.queries.values()) {
				if (!handler.affectedBy(type)) continue;

				handler.validateEntity(this.eid);
			}
		});

		return this;
	}

	get<T extends Component>(type: CompType<T>): T | undefined {
		if (!this.isValid) {
			throw new Error(`Entities cannot be modified after being destroyed`);
		}

		if (!this.compRef.get(type)) {
			throw new Error(`The component type [${type.name}] is not registered`);
		}

		return this.compRef.get(type)[this.eid] as T;
	}

	get ecs(): ECS {
		return this._ecs;
	}

	remove(...types: CompType[]) {
		if (!this.isValid) {
			throw new Error(`Entities cannot be modified after being destroyed`);
		}

		types.forEach((type) => {
			if (!this.compRef.has(type)) {
				throw new Error(`Component Type [${type.name}] is not registered`);
			}

			delete this.compRef.get(type)[this.eid];
		});

		types.forEach((type) => {
			for (let handler of this.queries.values()) {
				if (!handler.affectedBy(type)) continue;

				handler.validateEntity(this.eid);
			}
		});

		return this;
	}

	destroy() {
		this._ecs.destroy(this.eid);
		this.isValid = false;
	}

	id() {
		return this.eid;
	}
}
