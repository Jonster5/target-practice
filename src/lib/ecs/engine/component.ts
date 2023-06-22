import type { ECS } from './ecs';

export class Component {
	getName(): string {
		return this.constructor.name;
	}

	getType(): CompType<this> {
		return this.constructor as CompType<this>;
	}

	onDestroy?(ecs: ECS, eid: number): void;
}

export type CompType<T extends Component = Component> = new (...args: any[]) => T;
