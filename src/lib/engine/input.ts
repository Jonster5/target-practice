import { Vec2 } from 'raxis-core';
import type { ECS, ECSPlugin } from './ecs';

export class Inputs {
	constructor(
		public keymap: Map<string, KeyTracker> = new Map(),
		public pointer: PointerTracker = new PointerTracker()
	) {}
}

export class KeysToTrack {
	constructor(public keys: string[]) {}
}

function setupKeyTrackers(ecs: ECS) {
	const ktt: KeysToTrack = ecs.getResource(KeysToTrack);
	if (!ktt) return;

	const { keys } = ktt;
	const { keymap }: Inputs = ecs.getResource(Inputs);

	keys.forEach((key) => {
		if (key.length === 1) {
			keymap.set(key.toLowerCase(), new KeyTracker(key.toLowerCase(), key.toUpperCase()));
		} else {
			keymap.set(key, new KeyTracker(key));
		}
	});
}

function destroyKeyTrackers(ecs: ECS) {
	const { keymap }: Inputs = ecs.getResource(Inputs);

	if (keymap.size === 0) return;

	for (let [k, tracker] of keymap) {
		tracker.destroy();
	}
}

export class PointerTracker {
	leftIsDown: boolean;
	leftIsUp: boolean;
	rightIsDown: boolean;
	rightIsUp: boolean;
	midIsDown: boolean;
	midIsUp: boolean;

	pos: Vec2;
	last: Vec2;

	private oldc: () => void;
	private oluc: () => void;
	private ordc: () => void;
	private oruc: () => void;
	private omdc: () => void;
	private omuc: () => void;
	private osc: (amount: number) => void;

	private md: () => void;
	private mu: () => void;
	private mm: () => void;

	constructor() {
		this.leftIsDown = false;
		this.leftIsUp = true;
		this.rightIsDown = false;
		this.rightIsUp = true;
		this.midIsDown = false;
		this.midIsUp = true;

		this.pos = new Vec2(0, 0);
		this.last = new Vec2(0, 0);

		this.md = this.onMouseDown.bind(this);
		this.mu = this.onMouseUp.bind(this);
		this.mm = this.onMouseMove.bind(this);

		window.addEventListener('mousedown', this.md);
		window.addEventListener('mouseup', this.mu);
		window.addEventListener('mousemove', this.mm);

		window.addEventListener('contextmenu', this.ctm);
	}

	private ctm(e: Event) {
		e.preventDefault();
	}

	private onMouseDown(e: MouseEvent) {
		const button = e.button;

		if (button === 0) {
			this.leftIsDown = true;
			this.leftIsUp = false;

			if (this.oldc) this.oldc();
		} else if (button === 1) {
			this.midIsDown = true;
			this.midIsUp = false;

			if (this.omdc) this.omdc();
		} else if (button === 2) {
			this.rightIsDown = true;
			this.rightIsUp = false;

			if (this.ordc) this.ordc();
		}
	}

	private onMouseUp(e: MouseEvent) {
		const button = e.button;

		if (button === 0) {
			this.leftIsDown = false;
			this.leftIsUp = true;

			if (this.oluc) this.oluc();
		} else if (button === 1) {
			this.midIsDown = false;
			this.midIsUp = true;

			if (this.omuc) this.omuc();
		} else if (button === 2) {
			this.rightIsDown = false;
			this.rightIsUp = true;

			if (this.oruc) this.oruc();
		}
	}

	private onMouseMove(e: MouseEvent) {
		const { clientX, clientY, movementX, movementY } = e;

		this.pos.set(clientX, clientY);
		this.last.set(movementX, movementY);
	}

	onLeftDown(cb: () => void, thisArg?: any) {
		this.oldc = cb.bind(thisArg ?? cb);
	}

	onLeftUp(cb: () => void, thisArg?: any) {
		this.oluc = cb.bind(thisArg ?? cb);
	}

	onRightDown(cb: () => void, thisArg?: any) {
		this.ordc = cb.bind(thisArg ?? cb);
	}

	onRightUp(cb: () => void, thisArg?: any) {
		this.oruc = cb.bind(thisArg ?? cb);
	}

	onMidDown(cb: () => void, thisArg?: any) {
		this.omdc = cb.bind(thisArg ?? cb);
	}

	onMidUp(cb: () => void, thisArg?: any) {
		this.omuc = cb.bind(thisArg ?? cb);
	}

	onScroll(cb: (amount: number) => void, thisArg?: any) {
		this.osc = cb.bind(thisArg ?? cb);
	}
}

export class KeyTracker {
	keys: string[];

	isDown: boolean;
	isUp: boolean;

	private okd: () => void;
	private oku: () => void;

	private kdb: () => void;
	private kub: () => void;

	constructor(...keys: string[]) {
		this.keys = keys;

		this.isDown = false;
		this.isUp = true;

		this.kdb = this.kd.bind(this);
		this.kub = this.ku.bind(this);

		window.addEventListener('keydown', this.kdb);
		window.addEventListener('keyup', this.kub);
	}

	destroy() {
		window.removeEventListener('keydown', this.kdb);
		window.removeEventListener('keyup', this.kub);
	}

	private kd(e: KeyboardEvent) {
		if (this.keys.indexOf(e.key) !== -1) {
			this.isDown = true;
			this.isUp = false;
			if (this.okd) this.okd();
		}
	}
	private ku(e: KeyboardEvent) {
		if (this.keys.indexOf(e.key) !== -1) {
			this.isDown = false;
			this.isUp = true;

			if (this.oku) this.oku();
		}
	}

	onKeyDown(cb: () => void, thisArg?: any) {
		this.okd = cb.bind(thisArg ?? cb);
	}

	onKeyUp(cb: () => void, thisArg?: any) {
		this.oku = cb.bind(thisArg ?? cb);
	}
}

export const InputPlugin: ECSPlugin = {
	startup: [setupKeyTrackers],
	systems: [],
	shutdown: [destroyKeyTrackers],
	resources: [new Inputs()],
};
