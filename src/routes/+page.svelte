<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { CircleUser } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { Toaster } from '$lib/components/ui/sonner';
	import { log_in } from './login';
	let username = '';
	let password = '';
</script>

<div class="flex min-h-[100vh] w-full items-center justify-center dark:bg-slate-600">
	<div
		class="m-4 flex min-h-[70vh] min-w-[20vw] flex-col items-center rounded-2xl border-2 bg-stone-50 max-xl:min-w-[50vw]"
	>
		<CircleUser size="64" class="mt-16 dark:fill-black" />
		<h1 class="mb-24 mt-4 text-2xl font-bold dark:text-black">LOGIN ACCOUNT</h1>

		<div class="flex h-[50%] w-[80%] flex-col gap-4 border-black">
			<Label class="dark:text-black">Username:</Label>
			<Input class="border-black dark:text-black" bind:value={username}></Input>
			<Label class="dark:text-black">Password:</Label>
			<Input class="border-black dark:text-black" type="password" bind:value={password}></Input>
			<Button
				class="w-min self-end"
				variant="outline"
				on:click={async () => {
					const response = await log_in(username, password);

					if (response.status == 200) {
						toast.success('Log-in success', {
							description: 'Logging in...'
						});
                        window.location.href = '/dashboard'
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
