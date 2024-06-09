<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { CircleUser } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Toaster } from '$lib/components/ui/sonner';
	import { log_in } from './login';
	import { onMount } from 'svelte';
	import img from '../public/bg.jpg'
	let remember = false;
	let username = '';
	let password = '';

	function rememberMe() {
		remember = !remember;
		remember = remember;
		localStorage.setItem(
			'remember',
			JSON.stringify({
				username: username,
				password: password,
				remember: remember
			})
		);
	}
	onMount(() => {
		const checkboxValue: { username: string; password: string; remember: boolean | string } =
			JSON.parse(localStorage.getItem('remember')!);
		if (checkboxValue !== undefined && checkboxValue.remember) {
			remember = true;
			username = checkboxValue.username;
			password = checkboxValue.password;
		}
	});
</script>

<div class="flex min-h-[100vh] w-full items-center justify-center dark:bg-slate-600">
	<div
		class="m-4 flex min-h-[70vh] min-w-[20vw] flex-col items-center rounded-2xl border-2 bg-stone-50 max-xl:min-w-[50vw]"
	>
		<CircleUser size="64" class="mt-16 dark:fill-black" />
		<h1 class="mt-4 text-2xl font-bold dark:text-black">LOGIN</h1>
		<h2 class="mb-16 text-black dark:text-white">Inventory Management System</h2>

		<div class="flex h-[50%] w-[80%] flex-col gap-4 border-black">
			<Label class="dark:text-black">Username:</Label>
			<Input class="border-black dark:text-black" bind:value={username}></Input>
			<Label class="dark:text-black">Password:</Label>
			<Input class="border-black dark:text-black" type="password" bind:value={password}></Input>
			<span class="flex flex-row items-center justify-end gap-2 dark:text-black"
				><Checkbox bind:checked={remember} class="border-black" on:click={rememberMe} /><Label
					>Remember Me</Label
				></span
			>
			<Button
				class="mb-16 w-min self-end bg-slate-300 px-8 dark:border-none dark:bg-slate-800 dark:text-white"
				variant="outline"
				on:click={async () => {
					const response = await log_in(username, password);

					if (response.status == 200) {
						if (remember) {
							localStorage.setItem(
								'remember',
								JSON.stringify({
									username: username,
									password: password,
									remember: remember
								})
							);
						}
						toast.success('Log-in success', {
							description: 'Logging in...'
						});
						window.location.href = '/dashboard';
					} else {
						toast.error('Log-in failed', {
							description: response.msg
						});
					}
				}}>Log-in</Button
			>
		</div>
	</div>
</div>

<Toaster />