<script lang="ts">
	import type { Writable } from 'svelte/store';
	import background from './assets/background.png';
	import type { Screen } from './uiTypes';
	import { onMount } from 'svelte';

	export let screen: Writable<Screen>;

	let c1 = false;
	let c2 = false;
	let c3 = false;

	onMount(() => {
		if (localStorage.getItem('c1')) c1 = JSON.parse(localStorage.getItem('c1'));
		if (localStorage.getItem('c2')) c2 = JSON.parse(localStorage.getItem('c2'));
		if (localStorage.getItem('c3')) c3 = JSON.parse(localStorage.getItem('c3'));
	});
</script>

<img class="background" src={background} alt="background" />

<main>
	<button class="back" on:click={() => ($screen = 'title')}><span>Back</span></button>
	<div class="title"><span>Level Select</span></div>
	<div class="cards">
		<div
			class="card"
			style={`color: ${c1 ? 'lime' : 'white'}; box-shadow: 0 0 2vh 0.1vh ${c1 ? 'lime' : 'white'}`}
			on:click={() => ($screen = 'level1')}
			on:keydown={() => ($screen = 'level1')}
		>
			<span>1</span>
		</div>
		<div
			class="card"
			style={`color: ${c2 ? 'lime' : 'white'}; box-shadow: 0 0 2vh 0.1vh ${c2 ? 'lime' : 'white'}`}
			on:click={() => ($screen = 'level2')}
			on:keydown={() => ($screen = 'level2')}
		>
			<span>2</span>
		</div>
		<div
			class="card"
			style={`color: ${c3 ? 'lime' : 'white'}; box-shadow: 0 0 2vh 0.1vh ${c3 ? 'lime' : 'white'}`}
			on:click={() => ($screen = 'level3')}
			on:keydown={() => ($screen = 'level3')}
		>
			<span>3</span>
		</div>
	</div>
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

		grid-template-rows: 5vh 10vh 1fr 20vh 1fr;
		grid-template-columns: 5vw 1fr 50vw 1fr 5vw;

		.cards {
			display: flex;

			grid-row: 4 / 4;
			grid-column: 3 /3;

			justify-content: space-evenly;
			align-content: center;

			.card {
				display: flex;

				width: 10vw;

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
				font-size: 3vw;

				transition-duration: 100ms;

				&:hover {
					cursor: pointer;

					transform: translate(0, -5px);
					box-shadow: 0 0 4vh 0.1vh white;
				}
			}
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

			color: #ffdc2e;
			text-shadow: 0 0 5vh #ffdc2e;
		}
	}
</style>
