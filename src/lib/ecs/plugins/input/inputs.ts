import { Component, ECS } from '../../engine';
import { KeyTracker } from './keytracker';
import { PointerTracker } from './pointertracker';

export class Inputs extends Component {
	constructor(
		public keymap: Map<string, KeyTracker> = new Map(),
		public pointer: PointerTracker = new PointerTracker()
	) {
		super();
	}
}

export class KeysToTrack extends Component {
	constructor(public keys: string[]) {
		super();
	}
}

export function setupKeyTrackers(ecs: ECS) {
	const ktt: KeysToTrack = ecs.getResource(KeysToTrack);
	if (!ktt) return;

	const { keys } = ktt;
	const { keymap }: Inputs = ecs.getResource(Inputs);

	keys.forEach((key) => {
		if (key.length === 1) {
			if (key === '=' || key === '+') {
				keymap.set(key.toLowerCase(), new KeyTracker('+', '='));
			} else if (key === '-' || key === '_') {
				keymap.set(key.toLowerCase(), new KeyTracker('-', '_'));
			} else {
				keymap.set(key.toLowerCase(), new KeyTracker(key.toLowerCase(), key.toUpperCase()));
			}
		} else {
			keymap.set(key, new KeyTracker(key));
		}
	});
}

export function destroyKeyTrackers(ecs: ECS) {
	const { keymap }: Inputs = ecs.getResource(Inputs);

	if (keymap.size === 0) return;

	for (let [k, tracker] of keymap) {
		tracker.destroy();
	}
}

export function updatePointerPos(ecs: ECS) {
	const { pointer }: Inputs = ecs.getResource(Inputs);
	const { pos, last, offset } = pointer;

	offset.setFrom(pos.clone().sub(last));
	last.setFrom(pos);
}
