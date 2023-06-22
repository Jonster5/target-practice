<script lang="ts">
	import type { Writable } from 'svelte/store';
	import background from './assets/background.png';
	import type { Screen } from './uiTypes';

	export let screen: Writable<Screen>;
</script>

<img class="background" src={background} alt="background" />

<main>
	<button class="back" on:click={() => ($screen = 'title')}><span>Back</span></button>
	<div class="title"><span>Credits</span></div>
	<div class="nick"><span>Nick Bauer</span></div>
	<div class="liana"><span>Liana Warnakulasooriya</span></div>
	<div class="ben"><span>Ben Katz</span></div>
</main>

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

		grid-template-rows: 5vh 10vh 15vh 4vh 1fr 4vh 1fr 4vh 1fr;
		grid-template-columns: 5vw 1fr 50vw 1fr 5vw;

		.nick {
			display: flex;

			margin: auto;

			width: 60%;
			height: 100%;

			grid-row: 4 / 4;
			grid-column: 3 / 3;

			justify-content: center;
			align-items: center;

			border: none;
			background: #000000bb;
			box-shadow: 0 0 2vh 0.1vh white;

			color: white;

			font-family: 'trispace variable', sans-serif;
			font-weight: 500;
			letter-spacing: 0.5vh;
			font-size: 1vw;
		}

		.liana {
			display: flex;

			margin: auto;

			width: 60%;
			height: 100%;

			grid-row: 6 / 6;
			grid-column: 3 / 3;

			justify-content: center;
			align-items: center;

			border: none;
			background: #000000bb;
			box-shadow: 0 0 2vh 0.1vh white;

			color: white;

			font-family: 'trispace variable', sans-serif;
			font-weight: 500;
			letter-spacing: 0.5vh;
			font-size: 1vw;
		}

		.ben {
			display: flex;

			margin: auto;

			width: 60%;
			height: 100%;

			grid-row: 8 / 8;
			grid-column: 3 / 3;

			justify-content: center;
			align-items: center;

			border: none;
			background: #000000bb;
			box-shadow: 0 0 2vh 0.1vh white;

			color: white;

			font-family: 'trispace variable', sans-serif;
			font-weight: 500;
			letter-spacing: 0.5vh;
			font-size: 1vw;
		}

		.back {
			display: flex;

			grid-row: 1 / 1;
			grid-column: 1 / 1;

			margin: auto;

			width: 80%;
			height: 60%;

			justify-content: center;
			align-items: center;

			border: none;
			background: #000000bb;
			box-shadow: 0 0 2vh 0.1vh white;

			color: white;

			font-family: 'trispace variable', sans-serif;
			font-weight: 500;
			letter-spacing: 0.5vh;
			font-size: 1vw;

			transition-duration: 100ms;

			&:hover {
				cursor: pointer;

				transform: translate(0, -5px);
				box-shadow: 0 0 4vh 0.1vh white;
			}
		}

		.title {
			display: flex;

			grid-row: 2 / 2;
			grid-column: 3 / 3;

			justify-content: center;
			align-items: center;

			font-size: 5vw;
			font-family: 'Righteous', sans-serif;
			letter-spacing: 1vw;

			color: cornflowerblue;
			text-shadow: 0 0 5vh cornflowerblue;
		}
	}
</style>
