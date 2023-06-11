<script lang="ts">
	import { ECS } from './lib/engine/ecs';
	import { TimePlugin } from './lib/engine/time';
	import { GraphicsPlugin, GraphicsSettings } from './lib/engine/graphics';
	import { onDestroy, onMount } from 'svelte';
	import { Planet, makePlanet } from './lib/planet';
	import {
		Projectile,
		ProjectileData,
		calculateGravity,
		changeLaunchspeed,
		launchProjectile,
	} from './lib/projectile';
	import { InputPlugin, Inputs, KeysToTrack } from './lib/engine/input';
	import { Trail, TrailTracker, destroyTrail, spawnTrail } from './lib/trail';
	import { Cannon, Launcher, handleLaunchSpeedVisual, rotateCannon, setupLauncher } from './lib/launcher';
	import { updateTransform } from './lib/engine/transform';
	import { get, writable } from 'svelte/store';
	import { GameData, checkForReset } from './lib/utils';
	import { fly } from 'svelte/transition';
	import { backOut } from 'svelte/easing';
	import { Target, createTarget } from './lib/target';

	let target: HTMLElement;

	const speed = writable(500);
	const angle = writable(0);
	const reset = writable(false);
	const inFlight = writable(false);

	const ecs = new ECS()
		.insertPlugin(TimePlugin)
		.insertPlugin(GraphicsPlugin)
		.insertPlugin(InputPlugin)
		.insertResource(new KeysToTrack(['w', 'a', 's', 'd', ' ', 'ArrowUp', 'ArrowDown', 'ArrowRight', 'ArrowLeft']))
		.insertResource(new ProjectileData(speed, angle))
		.insertResource(new GameData(reset, inFlight))
		.insertResource(new TrailTracker())
		.registerComponentTypes(Planet, Projectile, Trail, Launcher, Cannon, Target)
		.registerStartupSystems(makePlanet, setupLauncher, createTarget)
		.registerSystems(
			calculateGravity,
			// spawnTrail,
			handleLaunchSpeedVisual,
			rotateCannon,
			changeLaunchspeed,
			checkForReset,
			destroyTrail,
			launchProjectile
		);

	onMount(() => {
		ecs.insertResource(
			new GraphicsSettings({
				target,
				width: 5000,
			})
		).run();

		console.log(ecs);
	});

	onDestroy(() => {
		ecs.stop().shutdown();
	});
</script>

<div class="ctarget" bind:this={target} />

<main>
	<div class="velocity">{$speed}</div>
	{#if $inFlight}
		<div
			class="retry"
			on:click={() => reset.set(true)}
			on:keypress={() => reset.set(true)}
			transition:fly={{ y: -200, delay: 0, duration: 1000, easing: backOut }}
		>
			<span>RESET</span>
		</div>
	{/if}
</main>

<style lang="scss">
	.ctarget {
		position: absolute;

		width: 100%;
		height: 100%;
	}

	main {
		display: grid;

		width: 100vw;
		height: 100vh;

		grid-template-rows: 10vh 1fr 20vh;
		grid-template-columns: 5vw 1fr 15vw 1fr 5vw;
	}

	.velocity {
		color: white;

		font-family: 'Trispace Variable', sans-serif;
		font-weight: 800;
		font-size: 2vw;
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
