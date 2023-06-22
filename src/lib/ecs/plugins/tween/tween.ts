import { Component, ECS } from '../../engine';
import type { Vec2 } from '../../math';
import { Time } from '../time';
import { linear } from './easings';

export class TweenManager extends Component {
	constructor(public tweens: Map<string, TweenBase> = new Map()) {
		super();
	}
}

export function updateTweens(ecs: ECS) {
	const managers = ecs.queryComponents(TweenManager);
	const time = ecs.getResource(Time);

	managers.forEach(({ tweens }) => {
		tweens.forEach((tween) => {
			if (tween.done) return;

			tween.update(time.delta);
		});
	});
}

export class TweenBase {
	duration: number;

	protected _state: any;
	protected _value: any;

	ease: (x: number) => number;

	protected _onUpdate: Function;
	protected _onCompletion: Function;

	done: boolean;

	constructor(
		duration: number,
		easing: (x: number) => number = linear,
		onCompletion?: () => void,
		onUpdate?: Function
	) {
		this.duration = duration;

		this.ease = easing;
		this._onCompletion = onCompletion ?? (() => undefined);
		this._onUpdate = onUpdate ?? (() => undefined);

		this.done = false;
	}

	onUpdate(cb: Function) {
		this._onUpdate = cb;

		return this;
	}

	onCompletion(cb: Function) {
		this._onCompletion = cb;

		return this;
	}

	update(dt: number) {}

	get state() {
		return this._state;
	}

	set state(v: number) {
		this._state = Math.max(Math.min(v, 1), 0);
	}

	get value() {
		return this._value;
	}
}
