<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button/index.js';
	import { CircleUser, KeyRound, Save } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { Toaster } from '$lib/components/ui/sonner';
	import * as Card from '$lib/components/ui/card';
	import { update_account_information } from './query';
	let changePassEnabled = false;

	type acount_interface = {
		full_name: string;
		address: string;
		phone_number: string;
	};
	export let data: { data: { 0: acount_interface } };
	const original_account_info = data.data[0];
	let account: acount_interface = JSON.parse(JSON.stringify(data.data[0]));
	let curr_password = '';
	let new_password = '';
	let re_entered_password = '';

	function password_validate() {
		if (changePassEnabled) {
			if (curr_password == '') {
				return {
					status: false,
					msg: 'Enter your current password.'
				};
			}

			if (new_password == '' || re_entered_password == '') {
				return {
					status: false,
					msg: 'New password must not be empty.'
				};
			}

			if (new_password.length < 4 || re_entered_password.length < 4) {
				return {
					status: false,
					msg: 'New password must be at least 4 characters in length'
				};
			}

			if (new_password != re_entered_password) {
				return {
					status: false,
					msg: 'New password does not match'
				};
			}
		}
		return {
			status: true
		};
	}
</script>

<div class="flex w-full flex-col p-4">
	<div class="flex w-full flex-col items-center justify-center">
		<Card.Root>
			<Card.Header>
				<div class="flex flex-row items-center justify-center">
					<Card.Title class="flex flex-col items-center text-2xl font-bold">
						<CircleUser class="h-[2.5rem] w-[2.5rem]" />
						Account Information</Card.Title
					>
				</div>
				<hr />
			</Card.Header>
			<Card.Content class="text-md">
				<div class="flex flex-col gap-4">
					<div class="flex flex-col gap-4">
						<Label for="name">Full Name:</Label>
						<Input id="name" bind:value={account.full_name}></Input>
					</div>
					<div class="flex flex-col gap-4">
						<Label for="address">Address:</Label>
						<Input id="address" bind:value={account.address}></Input>
					</div>
					<div class="flex flex-col gap-4">
						<Label for="number">Phone Number:</Label>
						<Input id="number" bind:value={account.phone_number}></Input>
					</div>
				</div>
				{#if changePassEnabled}
					<div class="mb-4 mt-4 flex flex-col gap-4">
						<Label for="">Old Password:</Label>
						<Input id="curr_pass" type="password" bind:value={curr_password}></Input>
					</div>
					<div class="mb-4 flex flex-col gap-4">
						<Label for="">New Password:</Label>
						<Input id="new_pass" type="password" bind:value={re_entered_password}></Input>
					</div>
					<div class="mb-4 flex flex-col gap-4">
						<Label for="">Re-enter New Password:</Label>
						<Input id="re_enter_pass" type="password" bind:value={new_password}></Input>
					</div>
				{/if}
				<div class="mt-4 flex flex-row items-center justify-between gap-4">
					<Button
						variant="outline"
						class="flex flex-row items-center gap-2"
						on:click={() => {
							changePassEnabled = !changePassEnabled;
						}}
					>
						<KeyRound size="20" />
						{!changePassEnabled ? 'Change Password' : 'Cancel Change Password'}
					</Button>
					<Button
						variant="outline"
						class="flex flex-row items-center gap-2"
						on:click={async () => {
							const response = password_validate();
							if (response.status) {
								const newChanges = JSON.stringify(account) !== JSON.stringify(original_account_info)
								if (newChanges) {
									const sql_response = await update_account_information(
										account.full_name,
										account.phone_number,
										account.address,
										curr_password,
										new_password,
										changePassEnabled
									);

									if (sql_response.status == 200) {
										toast.success('Action success', {
											description: sql_response.msg
										});
										setTimeout(() => {
											window.location.reload();
										}, 500);
									} else {
										toast.error('Action failed', {
											description: sql_response.msg
										});
									}
								}
							} else {
								toast.error('Action failed', {
									description: response.msg
								});
							}
						}}
					>
						<Save size="20" />Save Changes</Button
					>
				</div>
			</Card.Content>
		</Card.Root>
	</div>
</div>

<Toaster />
