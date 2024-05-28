<script lang="ts">
	import '../app.css';
	import { Button } from '$lib/components/ui/button';
	import { ModeWatcher } from 'mode-watcher';
	import Sun from 'lucide-svelte/icons/sun';
	import Moon from 'lucide-svelte/icons/moon';
	import { Progress } from '$lib/components/ui/progress';
	import { toggleMode } from 'mode-watcher';
	import { page } from '$app/stores';
	import Cookies from 'js-cookie';
	import { onMount } from 'svelte';
	$: activeUrl = $page.url.pathname;
	let load = false;
	let progress_value = 0;
	let windowInit = false;

	function startProgress() {
		const duration = 1500; // total duration in milliseconds
		const targetValue = 100; // target value for progress
		const startTime = performance.now();

		function updateProgress(currentTime: any) {
			const elapsedTime = currentTime - startTime;
			progress_value = Math.min((elapsedTime / duration) * targetValue, targetValue);

			if (elapsedTime < duration) {
				requestAnimationFrame(updateProgress);
			} else {
				progress_value = 100
				setTimeout(() => {
					load = true;
				}, 500);
			}
		}

		requestAnimationFrame(updateProgress);
	}

	onMount(() => {
		windowInit = true;
		// if ((activeUrl != '/' && Cookies.get('token') == null) || Cookies.get('token') == '') {
		// 	window.location.href = '/logout';
		// } else {
		// 	startProgress();
		// }
	});

	$: if (activeUrl) {
		if (windowInit) {
			if ((activeUrl != '/' && Cookies.get('token') == null) || Cookies.get('token') == '') {
				window.location.href = '/logout';
			} else {
				startProgress();
			}
		}
	}
</script>

{#if !load}
	<div class="flex min-h-[100vh] flex-col items-center justify-center">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="15em"
			height="15em"
			viewBox="0 0 24 24"
			{...$$props}
		>
			<circle cx="4" cy="12" r="3" fill="black" class="dark:fill-white">
				<animate
					id="svgSpinners3DotsBounce0"
					attributeName="cy"
					begin="0;svgSpinners3DotsBounce1.end+0.25s"
					calcMode="spline"
					dur="0.6s"
					keySplines=".33,.66,.66,1;.33,0,.66,.33"
					values="12;6;12"
				/>
			</circle>
			<circle cx="12" cy="12" r="3" fill="#666362"  class="dark:fill-[#F8F8FF]">
				<animate
					attributeName="cy"
					begin="svgSpinners3DotsBounce0.begin+0.1s"
					calcMode="spline"
					dur="0.6s"
					keySplines=".33,.66,.66,1;.33,0,.66,.33"
					values="12;6;12"
				/>
			</circle>
			<circle cx="20" cy="12" r="3" fill="gray"  class="dark:fill-[#F5FEFD]">
				<animate
					id="svgSpinners3DotsBounce1"
					attributeName="cy"
					begin="svgSpinners3DotsBounce0.begin+0.2s"
					calcMode="spline"
					dur="0.6s"
					keySplines=".33,.66,.66,1;.33,0,.66,.33"
					values="12;6;12"
				/>
			</circle>
		</svg>
		<Progress value={progress_value} class="max-w-[10vw]" />
		<span>Loading...</span>
	</div>
{:else}
	<div class="flex flex-col items-center justify-center">
		{#if activeUrl != '/'}
			<div class="my-4 flex w-min items-center gap-4 p-4">
				<Button
					variant="outline"
					href="/dashboard"
					class={activeUrl == '/dashboard' ? 'bg-blue-300 dark:bg-blue-700' : ''}>Dashboard</Button
				>
				<Button
					variant="outline"
					href="/products"
					class={activeUrl == '/products' ? 'bg-blue-300 dark:bg-blue-700' : ''}>Products</Button
				>
				<Button
					variant="outline"
					href="/staff_management"
					class={activeUrl == '/staff_management' ? 'bg-blue-300 dark:bg-blue-700' : ''}
					>Staff Management</Button
				>
				<Button
					variant="outline"
					href="/sales"
					class={activeUrl == '/sales' ? 'bg-blue-300 dark:bg-blue-700' : ''}>Sales History</Button
				>
				<Button
					variant="outline"
					href="/logs"
					class={activeUrl == '/logs' ? 'bg-blue-300 dark:bg-blue-700' : ''}>Logs</Button
				>
				<Button
					variant="outline"
					href="/account"
					class={activeUrl == '/account' ? 'bg-blue-300 dark:bg-blue-700' : ''}>My Account</Button
				>
				<Button variant="outline" href="/logout">Logout</Button>
			</div>
			<ModeWatcher />
			<Button
				on:click={toggleMode}
				variant="outline"
				size="icon"
				class="fixed bottom-0 right-0 m-8"
			>
				<Sun
					class="h-[1.5rem] w-[1.5rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
				/>
				<Moon
					class="absolute h-[1.5rem] w-[1.5rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
				/>
				<span class="sr-only">Toggle theme</span>
			</Button>
		{/if}
		<slot></slot>
	</div>
{/if}

<style>
	.active {
		background-color: rgb(73, 73, 158);
	}
</style>
