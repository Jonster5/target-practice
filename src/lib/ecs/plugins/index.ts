import { type ECSPlugin } from '../engine/ecs';
import {
	Canvas,
	Sprite,
	Root,
	checkGraphicsCompatibility,
	setupCanvas,
	updateCanvasDimensions,
	updateCanvasZoom,
	renderCanvas,
} from './graphics';
import { setupKeyTrackers, destroyKeyTrackers, Inputs, updatePointerPos } from './input';
import { startTime, updateTime, Time, TimeData } from './time';
import { Transform, checkTransformCompatibility, updateTransform } from './transform';
import { TreeNode } from './treenode';
import { TweenManager, updateTweens } from './tween';

export const TimePlugin: ECSPlugin = {
	startup: [startTime],
	main: [updateTime],
	resources: [new Time(0, 0, 0), new TimeData()],
};

export const TransformPlugin: ECSPlugin = {
	components: [Transform],
	startup: [checkTransformCompatibility],
	main: [updateTransform],
};

export const TreeNodePlugin: ECSPlugin = {
	components: [TreeNode],
};

export const GraphicsPlugin: ECSPlugin = {
	components: [Canvas, Sprite, Root],
	startup: [checkGraphicsCompatibility, setupCanvas],
	main: [updateCanvasDimensions, updateCanvasZoom, renderCanvas],
	resources: [],
};

export const InputPlugin: ECSPlugin = {
	startup: [setupKeyTrackers],
	main: [updatePointerPos],
	shutdown: [destroyKeyTrackers],
	resources: [new Inputs()],
};

export const TweenPlugin: ECSPlugin = {
	components: [TweenManager],
	main: [updateTweens],
};

export const defaultPlugins: ECSPlugin[] = [
	TimePlugin,
	TransformPlugin,
	TreeNodePlugin,
	GraphicsPlugin,
	InputPlugin,
	TweenPlugin,
];
