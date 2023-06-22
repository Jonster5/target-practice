<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { Planet, makePlanetlvl1, makePlanetlvl3 } from './lib/planet';
	import { LaunchEvent, Projectile, calculateGravity, launchProjectile } from './lib/projectile';
	import { DestroyTrailEvent, NextTrailReadyEvent, Trail, TrailTracker, destroyTrail, spawnTrail } from './lib/trail';
	import {
		Cannon,
		Launcher,
		changeLaunchspeed,
		handleLaunchSpeedVisual,
		rotateCannon,
		setupLaunchAction,
		setupLauncherlvl1,
		setupLauncherlvl3,
	} from './lib/launcher';
	import { get, writable, type Writable } from 'svelte/store';
	import {
		ResetEvent,
		SetSpeedEvent,
		UIData,
		checkForReset,
		followProjectileAfterAnimation,
		setupTweenableEntities,
	} from './lib/ui';
	import { fly } from 'svelte/transition';
	import { backOut, cubicOut, expoInOut } from 'svelte/easing';
	import { Target, createTargetlvl1, createTargetlvl3 } from './lib/target';
	import { projectilePlanetCollisions, projectileTargetCollisions } from './lib/collisions';
	import { type Screen } from './uiTypes';
	import level1bg from './assets/level1bg.png';
	import { ECS, EventWriter } from './lib/ecs/engine';
	import { TimePlugin, GraphicsPlugin, InputPlugin, defaultPlugins } from './lib/ecs/plugins';
	import { CanvasSettings } from './lib/ecs/plugins/graphics';
	import { KeysToTrack } from './lib/ecs/plugins/input';
	import { TimeData } from './lib/ecs/plugins/time';

	export let screen: Writable<Screen>;

	let target: HTMLElement;

	const speed = writable(1000);
	const angle = writable(0);
	const inFlight = writable(false);
	const win = writable(false);
	const gspeed = writable(0);

	let reset: EventWriter<ResetEvent>;
	let setSpeed: EventWriter<SetSpeedEvent>;
	let speedInput: HTMLInputElement;

	const gspeedsteps = [1, 2, 5];

	const ecs = new ECS()
		.insertPlugins(...defaultPlugins)
		.insertResource(new KeysToTrack(['w', 'a', 's', 'd', ' ', 'ArrowUp', 'ArrowDown', 'ArrowRight', 'ArrowLeft']))
		.insertResource(new UIData(inFlight, win, speed, angle))
		.addEventTypes(DestroyTrailEvent, LaunchEvent, ResetEvent, SetSpeedEvent, NextTrailReadyEvent)
		.addComponentTypes(Planet, Projectile, Trail, Launcher, Cannon, Target)
		.addStartupSystems(
			makePlanetlvl3,
			setupLauncherlvl3,
			createTargetlvl3,
			setupLaunchAction,
			setupTweenableEntities
		)
		.addMainSystems(
			calculateGravity,
			spawnTrail,
			handleLaunchSpeedVisual,
			rotateCannon,
			changeLaunchspeed,
			checkForReset,
			destroyTrail,
			launchProjectile,
			projectilePlanetCollisions,
			projectileTargetCollisions,
			followProjectileAfterAnimation
		);

	const us = speed.subscribe((s) => {
		if (s > 2000) speed.set(2000);
		if (s < 100) speed.set(100);
	});

	const ugs = gspeed.subscribe((s) => {
		const settings: TimeData = ecs.getResource(TimeData);

		if (s < 0) gspeed.set(0);
		if (s >= gspeedsteps.length) gspeed.set(gspeedsteps.length - 1);

		settings.speed = gspeedsteps[s];
	});

	const uw = win.subscribe((w) => {
		if (w) localStorage.setItem('c3', 'true');
	});

	onMount(() => {
		ecs.insertResource(
			new CanvasSettings({
				target,
				width: 5000,
			})
		).run();

		reset = ecs.getEventWriter(ResetEvent);
		setSpeed = ecs.getEventWriter(SetSpeedEvent);
	});

	onDestroy(() => {
		ecs.stop();

		us();
		ugs();
		uw();
	});
</script>

<div class="ctarget" bind:this={target} style={`opacity: ${$win ? 0.5 : 1};`} />

<main style={`background-image: url(${level1bg});`}>
	{#if !$win}
		<!-- <div class="time-control" transition:fly={{ y: -200, delay: 0, duration: 1000, easing: backOut }}>
			<button on:click={() => gspeed.update((s) => s - 1)}>&lt;</button>
			<span>{gspeedsteps[$gspeed]}<strong>x</strong></span>
			<button on:click={() => gspeed.update((s) => s + 1)}>&gt;</button>
		</div> -->
		{#if $inFlight}
			<div
				class="retry"
				on:click={() => reset.send()}
				on:keypress={() => reset.send()}
				transition:fly={{ y: -200, delay: 0, duration: 1000, easing: backOut }}
			>
				<span>RESET</span>
			</div>
		{:else}
			<div class="velocity" transition:fly={{ y: 200, duration: 500, easing: cubicOut }}>
				<span>{$speed}<strong>m/s</strong></span>
				<input type="range" min="100" max="2000" bind:value={$speed} />
			</div>
		{/if}
	{:else}
		<div class="victory" transition:fly={{ y: -1000, delay: 500, duration: 2000, easing: expoInOut }}>
			<span class="title">Level Complete!</span>
			<div>
				<button on:click={() => screen.set('title')}><span>Home</span></button>
				<button on:click={() => screen.set('select')}><span>Level Select</span></button>
				<button on:click={() => screen.set('credits')}><span>Credits</span></button>
			</div>
		</div>
	{/if}
</main>

<style lang="scss">
	.ctarget {
		position: absolute;

		width: 100%;
		height: 100%;

		transition-duration: 2s;
	}

	main {
		display: grid;

		width: 100vw;
		height: 100vh;

		grid-template-rows: 10vh 1fr 20vh;
		grid-template-columns: 10vw 1fr 15vw 1fr 10vw;

		background-size: cover;
		background-repeat: no-repeat;
		background-position: center;

		strong {
			color: cornflowerblue;
			font-weight: 800;
		}
	}

	.victory {
		display: flex;

		grid-row: 2 / 2;
		grid-column: 2 / 5;

		z-index: 20;

		flex-direction: column;
		justify-content: space-evenly;
		align-items: center;

		border: none;

		.title {
			color: lime;
			font-family: 'righteous', sans-serif;
			font-size: 7vw;
			text-shadow: 0 0 2vh lime;
		}

		div {
			display: flex;

			width: 70%;

			justify-content: space-evenly;
			align-items: center;

			button {
				display: flex;

				width: 15vw;
				height: 8vh;

				margin: 0;
				padding: 0;

				justify-content: center;
				align-items: center;

				border: none;
				background: #000000bb;
				box-shadow: 0 0 2vh 0.1vh white;

				color: white;

				font-family: 'trispace variable', sans-serif;
				font-weight: 500;
				letter-spacing: 0.5vh;
				font-size: 1.7vw;

				transition-duration: 100ms;

				&:hover {
					cursor: pointer;

					transform: translate(0, -5px);
					box-shadow: 0 0 4vh 0.1vh white;
				}
			}
		}
	}

	.velocity {
		display: flex;

		width: 90%;
		height: 90%;

		margin: auto;
		padding: 0 5vw;

		grid-row: 3 / 3;
		grid-column: 2 / 5;

		flex-direction: column;
		justify-content: space-evenly;
		align-items: center;

		z-index: 20;

		font-family: 'Trispace Variable', sans-serif;
		font-weight: 600;
		font-size: 2vw;

		span {
			padding: 1vh 2vw;

			border: none;
			background: #000000bb;
			box-shadow: 0 0 2vh 0.1vh white;
		}

		input {
			-webkit-appearance: none; /* Override default CSS styles */
			appearance: none;
			width: 100%; /* Full-width */
			height: 10px; /* Specified height */
			background: #d3d3d3; /* Grey background */
			outline: none; /* Remove outline */
			opacity: 0.7; /* Set transparency (for mouse-over effects on hover) */
			-webkit-transition: 0.2s; /* 0.2 seconds transition on hover */
			transition: opacity 0.2s;

			&:hover {
				opacity: 1;
			}

			&::-webkit-slider-thumb {
				-webkit-appearance: none; /* Override default look */
				appearance: none;
				width: 25px; /* Set a specific slider handle width */
				height: 25px; /* Slider handle height */
				background: #ffdc2e; /* Green background */
				cursor: pointer; /* Cursor on hover */
				box-shadow: 0 0 1vh 0.1vh #ffdc2e;
				transition-duration: 0.1s;

				&:hover {
					box-shadow: 0 0 2vh 0.2vh #ffdc2e;
				}
			}

			&::-moz-range-thumb {
				width: 25px; /* Set a specific slider handle width */
				height: 25px; /* Slider handle height */
				background: #ffdc2e; /* Green background */
				cursor: pointer; /* Cursor on hover */
			}
		}
	}

	.retry {
		display: flex;

		grid-row: 1 / 1;
		grid-column: 3 / 3;

		margin: 2vh;
		padding: 0;
		z-index: 10;

		justify-content: center;
		align-items: center;

		border: none;
		background: #000000bb;
		box-shadow: 0 0 2vh 0.1vh white;

		color: white;

		font-family: 'trispace variable', sans-serif;
		font-weight: 800;
		letter-spacing: 0.5vh;
		font-size: 1.5vw;

		transition-duration: 100ms;

		&:hover {
			cursor: pointer;

			transform: translate(0, -5px);
			box-shadow: 0 0 4vh 0.1vh white;
		}
	}
</style>
