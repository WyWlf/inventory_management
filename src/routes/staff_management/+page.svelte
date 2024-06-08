<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { toast } from 'svelte-sonner';
	import { Toaster } from '$lib/components/ui/sonner';
	import { Button } from '$lib/components/ui/button/index.js';
	import { UserPlus, Users } from 'lucide-svelte';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as Table from '$lib/components/ui/table';
	import * as Pagination from '$lib/components/ui/pagination';
	import * as Dialog from '$lib/components/ui/dialog';
	import { add_staff, delete_staff, get_staff_list, update_staff } from './query';
	import { onMount } from 'svelte';

	type user_interface = {
		id: number;
		username: string;
		full_name: string | null;
		address: string | null;
		phone_number: number | null;
		password: string;
	};

	export let data: { data: user_interface[] };
	const original_user_list = data.data;
	let user_list_len = original_user_list.length;
	let user_list = data.data;
	user_list = user_list.slice(0, 10);

	let update_staff_form: user_interface = {
		id: 0,
		username: '',
		full_name: null,
		address: null,
		phone_number: null,
		password: ''
	};

	let add_staff_form: user_interface = {
		id: 0,
		username: '',
		full_name: null,
		address: null,
		phone_number: null,
		password: ''
	};

	let search = '';
	let paginationPage = 1;
	let updateStaffDialog = false;
	let addStaffDialog = false;
	let deleteStaffDialog = false;
	let changePassEnabled = false;
	let first_password = '';
	let delete_staff_username = '';
	let delete_staff_id = 0;

	async function reload_user_list() {
		const get_product_response = await get_staff_list(search);
		user_list_len = get_product_response.length;

		let list_end = 10;
		let copy_list = get_product_response;
		user_list = copy_list.slice(0, list_end);
	}

	function form_validate(form: user_interface) {
		if (form.username.length < 4) {
			return {
				status: false,
				msg: 'Username must be at least 4 length in characters'
			};
		}

		if (form.password.length < 4) {
			return {
				status: false,
				msg: 'Password must be at least 4 length in characters'
			};
		}

		if (form.password != first_password) {
			return {
				status: false,
				msg: 'Password does not match'
			};
		}
		return {
			status: true
		};
	}

	function update_form_validate(form: user_interface) {
		if (form.username.length < 4) {
			return {
				status: false,
				msg: 'Username must be at least 4 length in characters'
			};
		}

		if (form.password.length < 4 && changePassEnabled) {
			return {
				status: false,
				msg: 'Password must be at least 4 length in characters'
			};
		}

		if (form.password != first_password && changePassEnabled) {
			return {
				status: false,
				msg: 'Password does not match'
			};
		}
		return {
			status: true
		};
	}

	function clear_add_forms() {
		add_staff_form = {
			id: 0,
			username: '',
			full_name: null,
			address: null,
			phone_number: null,
			password: ''
		};
		update_staff_form = {
			id: 0,
			username: '',
			full_name: null,
			address: null,
			phone_number: null,
			password: ''
		};
		first_password = '';
		addStaffDialog = false;
		updateStaffDialog = false;
	}

	async function user_list_on_nav() {
		const get_user_response = await get_staff_list(search);
		user_list_len = get_user_response.length;

		let list_start = 0;
		let list_end = 10;
		let copy_list = get_user_response;

		if (paginationPage > 1) {
			list_start = 10 * paginationPage - 10;
			list_end = list_start + 10;
			user_list = copy_list.slice(list_start, list_end);
		} else {
			user_list = copy_list.slice(0, list_end);
		}
	}

	onMount(async () => {
		// await user_list_on_nav();
	});
</script>

<div class="flex w-full flex-col border-2 p-4 bg-slate-100 dark:bg-transparent">
	<h1 class="ml-4 flex flex-row items-center gap-2 text-4xl font-bold">
		<Users size="45" />Staff Management
	</h1>
	<div class="my-8 ml-4 flex flex-row items-center gap-24">
		<div class="flex flex-row items-center gap-4">
			<div class="flex flex-row items-center">
				<Label for="email">Search</Label>
				<Input
					class="m-2 w-min"
					bind:value={search}
					on:input={reload_user_list}
					placeholder="search by username"
				/>
			</div>
			<Button
				variant="outline"
				class="flex flex-row items-center justify-center gap-2"
				on:click={() => {
					if (addStaffDialog) {
						addStaffDialog = false;
						addStaffDialog = true;
					} else {
						addStaffDialog = true;
					}
				}}><UserPlus size="20" />Add User</Button
			>
		</div>
	</div>
	<div class="flex max-h-[65vh] min-h-[65vh] border-2">
		<Table.Root>
			<Table.Caption>
				<Pagination.Root count={user_list_len} perPage={10} let:pages let:currentPage>
					<Pagination.Content>
						<Pagination.Item>
							<Pagination.PrevButton
								on:click={async () => {
									paginationPage = paginationPage - 1;
									await user_list_on_nav();
								}}
							/>
						</Pagination.Item>
						{#each pages as page (page.key)}
							{#if page.type === 'ellipsis'}
								<Pagination.Item>
									<Pagination.Ellipsis />
								</Pagination.Item>
							{:else}
								<Pagination.Item>
									<Pagination.Link
										{page}
										isActive={currentPage == page.value}
										on:click={async () => {
											paginationPage = page.value;
											await user_list_on_nav();
										}}
									>
										{page.value}
									</Pagination.Link>
								</Pagination.Item>
							{/if}
						{/each}
						<Pagination.Item>
							<Pagination.NextButton
								on:click={async () => {
									if (paginationPage < pages.length) {
										paginationPage += 1;
										await user_list_on_nav();
									}
								}}
							/>
						</Pagination.Item>
					</Pagination.Content>
				</Pagination.Root>
			</Table.Caption>
			<Table.Header>
				<Table.Row>
					<Table.Head>ID</Table.Head>
					<Table.Head>Username</Table.Head>
					<Table.Head>Full Name</Table.Head>
					<Table.Head>Address</Table.Head>
					<Table.Head>Phone Number</Table.Head>
					<Table.Head class="text-center">Action</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#key user_list}
					{#each user_list as user, i}
						<Table.Row>
							<Table.Cell class="font-semibold">{i+1}</Table.Cell>
							<Table.Cell>{user.username}</Table.Cell>
							<Table.Cell>{user.full_name || 'No information provided'}</Table.Cell>
							<Table.Cell>{user.address || 'No information provided'}</Table.Cell>
							<Table.Cell>{user.phone_number || 'No information provided'}</Table.Cell>
							<Table.Cell class="text-center">
								<DropdownMenu.Root>
									<DropdownMenu.Trigger>
										<Button variant="outline">Show Actions</Button>
									</DropdownMenu.Trigger>
									<DropdownMenu.Content>
										<DropdownMenu.Group>
											<DropdownMenu.Item
												on:click={() => {
													if (updateStaffDialog) {
														updateStaffDialog = false;
														updateStaffDialog = true;
													} else {
														updateStaffDialog = true;
													}
													update_staff_form = user;
													update_staff_form.password = '';
												}}>Update</DropdownMenu.Item
											>
											<DropdownMenu.Item
												on:click={() => {
													if (deleteStaffDialog) {
														deleteStaffDialog = false;
														deleteStaffDialog = true;
													} else {
														deleteStaffDialog = true;
													}
													delete_staff_id = user.id;
													delete_staff_username = user.username;
												}}
												class="text-red-500">Delete</DropdownMenu.Item
											>
										</DropdownMenu.Group>
									</DropdownMenu.Content>
								</DropdownMenu.Root>
							</Table.Cell>
						</Table.Row>
					{/each}
				{/key}
			</Table.Body>
		</Table.Root>
	</div>
</div>

<Dialog.Root open={updateStaffDialog} closeOnEscape={true}>
	<Dialog.Content>
		<Dialog.Title>Update Staff Information</Dialog.Title>
		<div class="grid gap-4 py-8">
			<div class="flex flex-col gap-4">
				<Label for="username">Username:</Label>
				<Input id="username" bind:value={update_staff_form.username} class="col-span-3" />
			</div>
			<div class="flex flex-col gap-4">
				<Label for="name">Full Name:</Label>
				<Input id="name" bind:value={update_staff_form.full_name}></Input>
			</div>
			<div class="flex flex-col gap-4">
				<Label for="address">Address:</Label>
				<Input id="address" bind:value={update_staff_form.address}></Input>
			</div>
			<div class="flex flex-col gap-4">
				<Label for="number">Phone Number:</Label>
				<Input id="number" bind:value={update_staff_form.phone_number}></Input>
			</div>
			{#if changePassEnabled}
				<div class="flex flex-col gap-4">
					<Label for="">New Password:</Label>
					<Input id="" type="password" bind:value={first_password}></Input>
				</div>
				<div class="flex flex-col gap-4">
					<Label for="">Re-enter New Password:</Label>
					<Input id="" type="password" bind:value={update_staff_form.password}></Input>
				</div>
			{/if}
			<Button
				variant="outline"
				on:click={() => {
					changePassEnabled = !changePassEnabled;
				}}
			>
				{!changePassEnabled ? 'Change Password' : 'Cancel Change Password'}
			</Button>
		</div>
		<Dialog.Footer>
			<Button
				on:click={async () => {
					const validate_response = update_form_validate(update_staff_form);

					if (validate_response.status) {
						const response = await update_staff(
							update_staff_form.id,
							update_staff_form.username,
							update_staff_form.full_name,
							update_staff_form.address,
							update_staff_form.phone_number,
							update_staff_form.password
						);
						if (response.status == 200) {
							toast.success('Action success', {
								description: update_staff_form.username + ' account information has been updated.'
							});
							clear_add_forms();
							reload_user_list();
						} else {
							toast.error('Action failed', {
								description: response.msg
							});
						}
					} else {
						toast.error('Action failed', {
							description: validate_response.msg
						});
					}
				}}>Save changes</Button
			>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root open={addStaffDialog} closeOnEscape={true}>
	<Dialog.Content>
		<Dialog.Title>Add New Staff</Dialog.Title>
		<div class="grid gap-4 py-8">
			<div class="flex flex-col gap-4">
				<Label for="username">Username:</Label>
				<Input id="username" bind:value={add_staff_form.username} class="col-span-3" />
			</div>
			<div class="flex flex-col gap-4">
				<Label for="name">Full Name:</Label>
				<Input id="name" bind:value={add_staff_form.full_name}></Input>
			</div>
			<div class="flex flex-col gap-4">
				<Label for="address">Address:</Label>
				<Input id="address" bind:value={add_staff_form.address}></Input>
			</div>
			<div class="flex flex-col gap-4">
				<Label for="number">Phone Number:</Label>
				<Input id="number" bind:value={add_staff_form.phone_number}></Input>
			</div>
			<div class="flex flex-col gap-4">
				<Label for="">Password:</Label>
				<Input id="" type="password" bind:value={first_password}></Input>
			</div>
			<div class="flex flex-col gap-4">
				<Label for="">Re-enter Password:</Label>
				<Input id="" type="password" bind:value={add_staff_form.password}></Input>
			</div>
		</div>
		<Dialog.Footer>
			<Button
				on:click={async () => {
					const validate_response = form_validate(add_staff_form);

					if (validate_response.status) {
						const response = await add_staff(
							add_staff_form.username,
							add_staff_form.full_name,
							add_staff_form.address,
							add_staff_form.phone_number,
							add_staff_form.password
						);
						if (response.status == 200) {
							toast.success('Action success', {
								description: add_staff_form.username + ' has been added to the staff list.'
							});
							clear_add_forms();
							reload_user_list();
						} else {
							toast.error('Action failed', {
								description: response.msg
							});
						}
					} else {
						toast.error('Action failed', {
							description: validate_response.msg
						});
					}
				}}>Add User</Button
			>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root open={deleteStaffDialog} closeOnOutsideClick={false}>
	<Dialog.Content class="flex flex-col items-center justify-center gap-8">
		<Dialog.Header class="text-cente pt-4">
			<Dialog.Title
				>Are you sure you want to delete <span class="font-bold text-red-500"
					>{delete_staff_username}</span
				>'s account?</Dialog.Title
			>
		</Dialog.Header>
		<Dialog.Footer>
			<Button
				variant="outline"
				class="text-red-500"
				on:click={async () => {
					if (deleteStaffDialog) {
						deleteStaffDialog = false;
						deleteStaffDialog = true;
					} else {
						deleteStaffDialog = true;
					}

					const response = await delete_staff(delete_staff_id);
					if (response == 200) {
						toast.success('Action success', {
							description: delete_staff_username + ' account has been deleted from the staff list.'
						});
						deleteStaffDialog = false;
						delete_staff_id = 0;
						delete_staff_username = '';
						reload_user_list();
					} else {
						toast.error('Action failed', {
							description: 'A server error has occured.'
						});
					}
				}}>Yes, delete staff information</Button
			>
			<Button
				variant="outline"
				on:click={() => {
					deleteStaffDialog = false;
				}}>No, cancel this action</Button
			>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<Toaster />
