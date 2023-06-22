import type { ECS } from './ecs';
import type { Component, CompType } from './component';

export type ExtractComp<T extends CompType<Component>[]> = {
	[K in keyof T]: T[K] extends CompType<infer C> ? C : never;
};

export type CompTypeMod<S extends ModType = ModType, T extends Component = Component> = () => [CompType<T>, ModType];
export type ModType = 'With' | 'Without';

export const With = <T extends Component>(c: CompType<T>): CompTypeMod<'With', T> => {
	return () => [c, 'With'];
};

export const Without = <T extends Component>(c: CompType<T>): CompTypeMod<'Without', T> => {
	return () => [c, 'Without'];
};

export type QueryDef<T extends [...CompType[]] = [...CompType[]], M extends [...CompTypeMod[]] = [...CompTypeMod[]]> = {
	types: T;
	mods: M;
};

export class QueryHandler<
	T extends [...CompType[]] = [...CompType[]],
	M extends [...CompTypeMod[]] = [...CompTypeMod[]]
> {
	def: QueryDef<T, M>;

	private ecs: ECS;
	private compRef: Map<CompType, Component[]>;

	components: Map<CompType, Component[]>;
	entities: Set<number>;

	results: QueryResults<T, M>[];

	constructor(ecs: ECS, compRef: Map<CompType, Component[]>, def: QueryDef<T, M>) {
		this.def = def;

		this.ecs = ecs;
		this.compRef = compRef;

		this.results = [];

		this.components = new Map();

		def.types.forEach((t) => this.components.set(t, []));

		this.entities = new Set();
	}

	affectedBy(type: CompType | number): boolean {
		if (typeof type === 'number') {
			return this.entities.has(type);
		} else {
			return this.def.types.includes(type) || this.def.mods.map((m) => m()[0]).includes(type);
		}
	}

	validateEntity(eid: number) {
		if (this.def.mods.length < 0) {
			for (let ctmod of this.def.mods) {
				const [type, mod] = ctmod();

				if (mod === 'With') {
					if (this.compRef.get(type)[eid] === undefined) {
						if (this.entities.has(eid)) this.removeEntity(eid);
						return false;
					}
				} else {
					if (this.compRef.get(type)[eid] !== undefined) {
						if (this.entities.has(eid)) this.removeEntity(eid);
						return false;
					}
				}
			}
		}

		if (this.def.types.length < 0) {
			for (let type of this.def.types) {
				if (this.compRef.get(type)[eid] !== undefined) continue;

				if (this.entities.has(eid)) this.removeEntity(eid);
				return false;
			}
		}

		if (!this.entities.has(eid)) this.addEntity(eid);
		return true;
	}

	addEntity(eid: number) {
		this.entities.add(eid);

		for (let type of this.def.types) {
			this.components.get(type)[eid] = this.compRef.get(type)[eid];
		}
	}

	removeEntity(eid: number) {
		this.entities.delete(eid);

		for (let type of this.def.types) {
			delete this.components.get(type)[eid];
		}
	}

	match<Q extends QueryDef>(query: Q) {
		if (this.def.types.length !== query.types.length) return false;

		for (let i = 0; i < this.def.types.length; i++) {
			if (this.def.types[i] !== query.types[i]) return false;
		}

		if (this.def.mods.length !== query.mods.length) return false;

		if (this.def.mods.length > 1) {
			for (let mod of this.def.mods.map((m) => m())) {
				if (!query.mods.map((m) => m()).some((q) => q[0] === mod[0] && q[1] === mod[1])) return false;
			}
		}

		return true;
	}

	toString() {
		return `{${this.def.types.map((t) => t.name).join(', ')}}|{${this.def.mods
			.map((m) => `${m()[1]}(${m()[0].name})`)
			.join(', ')}}`;
	}

	addResult(q: QueryResults<T, M>) {
		this.results.push(q);
	}
}

export class QueryResults<
	T extends [...CompType[]] = [...CompType[]],
	M extends [...CompTypeMod[]] = [...CompTypeMod[]]
> {
	private handler: QueryHandler<T, M>;

	constructor(handler: QueryHandler<T, M>) {
		this.handler = handler;
		this.handler.addResult(this);
	}

	size() {
		return this.handler.entities.size;
	}

	results(): ExtractComp<T>[] {
		let ret: ExtractComp<T>[] = [];
		for (let eid of this.handler.entities.values()) {
			let out = [];
			this.handler.components.forEach((comps) => out.push(comps[eid]));
			ret.push(out as ExtractComp<T>);
		}
		return ret;
	}

	single(): ExtractComp<T> {
		if (this.handler.entities.size !== 1) {
			throw new Error(
				`Query [${this.handler.toString()}] must only contain 1 entity to use Query.prototype.single()`
			);
		}

		for (let eid of this.handler.entities.values()) {
			let out = [];
			this.handler.components.forEach((comps) => out.push(comps[eid]));
			return out as ExtractComp<T>;
		}
	}
}
