import { EntityControls } from './entityControls';

export type CompType = new (...args: any[]) => { [key: string]: any; onDestroy?: (ecs: ECS, eid: number) => void };
export type System = (ecs: ECS) => any[] | void;

export interface ECSPlugin {
	components?: CompType[];
	startup?: System[];
	systems?: System[];
	shutdown?: System[];
	resources?: any[];
}

export type CompTypeMod = () => [CompType, ModType];
export type ModType = 'with' | 'without';

export const With = (c: CompType): CompTypeMod => {
	return () => [c, 'with'];
};

export const Without = (c: CompType): CompTypeMod => {
	return () => [c, 'without'];
};

export class ECS {
	components: {
		[key: string]: any[];
	};
	compnames: string[];
	indices: boolean[];
	entities: number[];
	private startupSystems: {
		executor: System;
		name: string;
		enabled: boolean;
	}[];
	private systems: {
		executor: System;
		name: string;
		enabled: boolean;
	}[];
	private shutdownSystems: {
		executor: System;
		name: string;
		enabled: boolean;
	}[];
	private resources: Map<CompType, any>;

	private updater!: number | null;

	constructor() {
		this.components = {};
		this.compnames = [];
		this.indices = [];
		this.entities = [];
		this.startupSystems = [];
		this.systems = [];
		this.shutdownSystems = [];
		this.resources = new Map();

		this.updater = null;
	}

	registerComponentType(component: CompType) {
		const name = component.name;

		this.components[name] = [];
		this.compnames.push(name);

		return this;
	}

	registerSystem(system: System) {
		this.systems.push({
			enabled: true,
			name: system.name,
			executor: system,
		});

		return this;
	}

	registerStartupSystem(system: System) {
		this.startupSystems.push({
			enabled: true,
			name: system.name,
			executor: system,
		});

		return this;
	}

	registerShutdownSystem(system: System) {
		this.shutdownSystems.push({
			enabled: true,
			name: system.name,
			executor: system,
		});

		return this;
	}

	registerComponentTypes(...comps: CompType[]) {
		comps.forEach((c) => this.registerComponentType(c));

		return this;
	}

	registerSystems(...systems: System[]) {
		systems.forEach((s) => this.registerSystem(s));

		return this;
	}

	registerStartupSystems(...systems: System[]) {
		systems.forEach((s) => this.registerStartupSystem(s));

		return this;
	}

	registerShutdownSystems(...systems: System[]) {
		systems.forEach((s) => this.registerShutdownSystem(s));

		return this;
	}

	toggleSystem(system: System | string) {
		const sysname = typeof system === 'string' ? system : system.name;

		const sys = this.systems.find(({ name }) => name === sysname);

		if (sys === undefined) {
			throw new Error(`System [${sysname}] is not registered`);
		} else {
			sys.enabled = !sys.enabled;
		}
	}

	turnOnSystem(system: System | string) {
		const sysname = typeof system === 'string' ? system : system.name;

		const sys = this.systems.find(({ name }) => name === sysname);

		if (sys === undefined) {
			throw new Error(`System [${sysname}] is not registered`);
		} else {
			sys.enabled = true;
		}
	}

	turnOffSystem(system: System | string) {
		const sysname = typeof system === 'string' ? system : system.name;

		const sys = this.systems.find(({ name }) => name === sysname);

		if (sys === undefined) {
			throw new Error(`System [${sysname}] is not registered`);
		} else {
			sys.enabled = false;
		}
	}

	insertResource(resource: any) {
		const type: CompType = resource.constructor;

		if (this.resources.get(type) !== undefined) {
			throw new Error(`Resource of type [${type.name}] already exists`);
		}

		if (!(resource instanceof type)) {
			throw new Error(`Resource type [${resource.constructor.name}] does not match the type [${type.name}]`);
		}

		this.resources.set(type, resource);

		return this;
	}

	insertPlugin(plugin: ECSPlugin) {
		if (plugin.resources) {
			plugin.resources.forEach((r) => this.insertResource(r));
		}

		if (plugin.components) {
			this.registerComponentTypes(...plugin.components);
		}

		if (plugin.startup) {
			this.registerStartupSystems(...plugin.startup);
		}

		if (plugin.systems) {
			this.registerSystems(...plugin.systems);
		}

		if (plugin.shutdown) {
			this.registerShutdownSystems(...plugin.shutdown);
		}

		return this;
	}

	entity() {
		let next = -1;

		for (let i = 0; i < this.indices.length; i++) {
			if (this.indices[i]) continue;

			next = i;
			break;
		}

		let eid = this.indices.length;

		if (next !== -1) eid = next;

		this.indices[eid] = true;
		this.entities.push(eid);

		return new EntityControls(this, this.components, eid);
	}

	controls(eid: number) {
		return new EntityControls(this, this.components, eid);
	}

	destroy(eid: number) {
		const exists = this.indices[eid] && this.entities.includes(eid);

		if (!exists) {
			console.warn(`Entity [${eid}] does not exist`);
			return;
		}

		this.compnames.forEach((name) => {
			if (this.components[name][eid] && this.components[name][eid].onDestroy) {
				this.components[name][eid].onDestroy(this, eid);
			}

			delete this.components[name][eid];
		});

		// this.indices[eid] = false;
		this.entities.splice(eid, 1);

		return this;
	}

	getResource(type: CompType) {
		if (this.resources.get(type) === undefined) {
			console.warn(`Resource of type [${type.name}] does not exist`);
			return undefined;
		}

		return this.resources.get(type);
	}

	queryComponents(comp: CompType | CompType[], ...mods: CompTypeMod[]): any[] {
		if (comp instanceof Array) {
			const names = comp.map((c) => c.name);

			const longest = [...names].sort((a, b) => a.length - b.length)[0];

			let retrieval: { comp: CompType[]; eid: number }[] = [];

			for (let i in this.components[longest]) {
				let hasAll = true;

				names.forEach((n) => {
					if (!this.components[n][i]) hasAll = false;
				});

				if (!hasAll) continue;

				let comp = (names.map((n) => this.components[n][i]) as CompType[]).sort(
					(a, b) => names.indexOf(a.name) - names.indexOf(b.name)
				);

				retrieval.push({
					comp,
					eid: parseInt(i),
				});
			}

			for (let mod of mods) {
				const [comp, type] = mod();

				if (type === 'with') {
					retrieval = retrieval.filter((item) => this.components[comp.name][item.eid] !== undefined);
				} else {
					retrieval = retrieval.filter((item) => this.components[comp.name][item.eid] === undefined);
				}
			}

			return retrieval.map(({ comp }) => comp);
		} else {
			const name = (comp as CompType).name;

			if (this.components[name] === undefined) {
				throw new Error(`The component type [${name}] is not registered`);
			}

			let retrieval: { comp: CompType; eid: number }[] = [];

			for (let i in this.components[name]) {
				retrieval.push({
					comp: this.components[name][i],
					eid: parseInt(i),
				});
			}

			for (let mod of mods) {
				const [comp, type] = mod();

				if (type === 'with') {
					retrieval = retrieval.filter((item) => this.components[comp.name][item.eid] !== undefined);
				} else {
					retrieval = retrieval.filter((item) => this.components[comp.name][item.eid] === undefined);
				}
			}

			return retrieval.map(({ comp }) => comp);
		}
	}

	queryEntities(mod: CompTypeMod, ...othermods: CompTypeMod[]): number[] {
		let retrieval = [...this.entities];

		const [comp, type] = mod();

		if (type === 'with') {
			retrieval = retrieval.filter((eid) => this.components[comp.name][eid] !== undefined);
		} else {
			retrieval = retrieval.filter((eid) => this.components[comp.name][eid] === undefined);
		}

		for (let mod of othermods) {
			const [comp, type] = mod();

			if (type === 'with') {
				retrieval = retrieval.filter((eid) => this.components[comp.name][eid] !== undefined);
			} else {
				retrieval = retrieval.filter((eid) => this.components[comp.name][eid] === undefined);
			}
		}

		return retrieval;
	}

	run() {
		this.startup();
		this.loop();

		return this;
	}

	startup() {
		for (let i = 0; i < this.startupSystems.length; i++) {
			if (!this.startupSystems[i].enabled) continue;

			this.startupSystems[i].executor(this);
		}

		return this;
	}

	private loop() {
		this.update.call(this);

		this.updater = requestAnimationFrame(this.loop.bind(this));
	}

	update() {
		if (!document.hasFocus()) return;

		for (let i = 0; i < this.systems.length; i++) {
			if (!this.systems[i].enabled) continue;

			this.systems[i].executor(this);
		}

		return this;
	}

	shutdown() {
		for (let i = 0; i < this.shutdownSystems.length; i++) {
			if (!this.shutdownSystems[i].enabled) continue;

			this.shutdownSystems[i].executor(this);
		}

		return this;
	}

	stop() {
		if (!this.updater) {
			throw new Error(`ECS is not running`);
		}

		cancelAnimationFrame(this.updater);

		this.updater = null;

		this.shutdown();

		return this;
	}
}
