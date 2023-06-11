<script lang="ts">
	import '@fontsource/righteous';
	import '@fontsource-variable/trispace';
	import background from './assets/background.png';
	import Game from './Game.svelte';
	import { writable, type Writable } from 'svelte/store';
	import { type Screen } from './uiTypes';

	export let screen: Writable<Screen> = writable('title');
</script>

{#if $screen === 'title'}
	<img class="background" src={background} alt="background" />

	<main>
		<div class="title"><span>Target Practice</span></div>

		<div class="subtitle"><span>S P A C E</span></div>

		<button class="play" style="grid-row: button1 / span 1" on:click={() => ($screen = 'game')}
			><span>Play</span></button
		>
		<button class="credits" style="grid-row: button2 / span 1"><span>Credits</span></button>
	</main>
{:else if $screen === 'game'}
	<Game {screen} />
{/if}

<style lang="scss">
	.background {
		position: absolute;
		z-index: -10;

		width: 277.77vh;
		height: 100vh;

		filter: brightness(50%);
	}

	main {
		display: grid;

		width: 100vw;
		height: 100vh;

		margin: 0;
		padding: 0;

		grid-template-rows: [title]20vh [subtitle]10vh 1fr [button1]8vh 4vh [button2]8vh 1fr;
		grid-template-columns: 15vw [t1]25vw [buttons]20vw [t2]25vw 15vw;

		button {
			display: flex;

			grid-column: buttons / span 1;

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
			font-size: 2vw;

			transition-duration: 100ms;

			&:hover {
				cursor: pointer;

				transform: translate(0, -5px);
				box-shadow: 0 0 4vh 0.1vh white;
			}
		}

		.title {
			display: flex;

			grid-row: title;
			grid-column: 2 / span 3;

			justify-content: center;
			align-items: center;

			font-size: 7vw;
			font-family: 'Righteous', sans-serif;
			letter-spacing: 1vw;

			color: #ffdc2e;
			text-shadow: 0 0 5vh #ffdc2e;
		}

		.subtitle {
			display: flex;

			grid-row: subtitle;
			grid-column: t1 / span 3;

			justify-content: center;
			align-items: center;

			font-size: 3vw;
			font-family: 'Trispace Variable', sans-serif;
			font-weight: 800;

			color: white;
			text-shadow: 0 0 5vh white;
		}
	}
</style>
