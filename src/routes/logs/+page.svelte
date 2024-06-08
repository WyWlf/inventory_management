<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import CalendarIcon from 'svelte-radix/Calendar.svelte';
	import { DateFormatter, type DateValue, getLocalTimeZone } from '@internationalized/date';
	import { cn } from '$lib/utils.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Calendar } from '$lib/components/ui/calendar/index.js';
	import { CalendarDays, Filter, NotepadText, X } from 'lucide-svelte';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as Table from '$lib/components/ui/table';
	import * as Pagination from '$lib/components/ui/pagination';
	import { get_log_history } from './query';
	import { onMount } from 'svelte';
	const df = new DateFormatter('en-US', {
		dateStyle: 'long'
	});

	type log_interface = {
		formattedTime: string;
		inventory_history: {
			id: number;
			username: string;
			action: string;
			formattedTime: string;
		};
	};

	export let data: { data: log_interface[] };
	const original_log_list = data.data;
	let inventory_history_list = data.data;
	let log_list_len = original_log_list.length;
	inventory_history_list = inventory_history_list.slice(0, 10);
	let startDate: DateValue | undefined = undefined;
	let endDate: DateValue | undefined = undefined;

	let formatted_start_date = '';
	let formatted_end_date = '';
	let search = '';
	let filterOpt = 'Daily';
	let paginationPage = 1;

	async function reload_log_list() {
		const get_list_response: [] = await get_log_history(
			search,
			formatted_start_date,
			formatted_end_date,
			filterOpt
		);
		log_list_len = get_list_response.length;
		let list_end = 10;
		let copy_list = get_list_response;
		inventory_history_list = copy_list.slice(0, list_end);
	}

	async function get_log_on_nav() {
		const get_list_response = await get_log_history(
			search,
			formatted_start_date,
			formatted_end_date,
			filterOpt
		);
		log_list_len = get_list_response.length;
		let list_start = 0;
		let list_end = 10;
		let copy_list = get_list_response;

		if (paginationPage > 1) {
			list_start = 10 * paginationPage - 10;
			list_end = list_start + 10;
			inventory_history_list = copy_list.slice(list_start, list_end);
		} else {
			inventory_history_list = copy_list.slice(0, list_end);
		}
	}

	function formate_date() {
		formatted_start_date = pad_date_values(startDate);
		formatted_end_date = pad_date_values(endDate);

		reload_log_list();
	}

	function pad_date_values(date: DateValue | undefined) {
		let return_string = '';
		if (date) {
			if (date && date?.month < 10) {
				return_string = `${date?.year}-0${date?.month}`;
			} else {
				return_string = `${date?.year}-${date?.month}`;
			}

			if (date && date?.day < 10) {
				return_string += `-0${date?.day}`;
			} else {
				return_string += `-${date?.day}`;
			}
		}

		return return_string;
	}

	onMount(async () => {
		// await get_log_on_nav();
	});

	$: if (startDate || endDate) {
		formate_date();
	}
</script>

<div class="flex w-full flex-col border-2 p-4 bg-slate-100 dark:bg-transparent">
	<h1 class="ml-4 text-4xl font-bold flex flex-row items-center gap-2"><NotepadText size="45" />Log History</h1>
	<div class="my-8 ml-4 flex flex-row items-center gap-24">
		<div class="flex flex-row items-center">
			<Label for="email">Search</Label>
			<Input
				class="m-2 w-min"
				bind:value={search}
				placeholder="search by user"
				on:input={reload_log_list}
			/>
		</div>
		<div class="flex flex-row items-center gap-4 max-xl:flex-wrap">
			<DropdownMenu.Root>
				<DropdownMenu.Trigger>
					<Button variant="outline" class="flex flex-row items-center gap-2"
						><CalendarDays size="20" />Date by: {filterOpt}</Button
					>
				</DropdownMenu.Trigger>
				<DropdownMenu.Content>
					<DropdownMenu.Group>
						<DropdownMenu.Label>Date Range</DropdownMenu.Label>
						<DropdownMenu.Separator />
						<DropdownMenu.Item
							on:click={() => {
								filterOpt = 'Daily';
							}}>Daily</DropdownMenu.Item
						>
						<DropdownMenu.Item
							on:click={() => {
								filterOpt = 'Custom';
							}}>Custom</DropdownMenu.Item
						>
					</DropdownMenu.Group>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
			<Popover.Root>
				<Popover.Trigger asChild let:builder>
					<Button
						variant="outline"
						class={cn(
							'w-[240px] justify-start text-left font-normal',
							!startDate && 'text-muted-foreground'
						)}
						builders={[builder]}
					>
						<CalendarIcon class="mr-2 h-4 w-4" />
						{startDate ? df.format(startDate.toDate(getLocalTimeZone())) : 'Pick a date'}
					</Button>
				</Popover.Trigger>
				<Popover.Content class="w-auto p-0" align="start">
					<Calendar bind:value={startDate} />
				</Popover.Content>
			</Popover.Root>
			{#if filterOpt == 'Custom'}
				<span>To</span>
				<Popover.Root>
					<Popover.Trigger asChild let:builder>
						<Button
							variant="outline"
							class={cn(
								'w-[240px] justify-start text-left font-normal',
								!endDate && 'text-muted-foreground'
							)}
							builders={[builder]}
						>
							<CalendarIcon class="mr-2 h-4 w-4" />
							{endDate ? df.format(endDate.toDate(getLocalTimeZone())) : 'Pick a date'}
						</Button>
					</Popover.Trigger>
					<Popover.Content class="w-auto p-0" align="start">
						<Calendar bind:value={endDate} />
					</Popover.Content>
				</Popover.Root>
			{/if}
			<Button
				variant="outline"
				class="float-right flex flex-row items-center gap-2 max-xl:m-0"
				on:click={() => {
					formate_date();
				}}><Filter size="20" />Filter</Button
			>
			<Button
				variant="outline"
				class="float-right flex flex-row items-center gap-2 max-xl:m-0"
				on:click={() => {
					startDate = undefined;
					endDate = undefined;
					formatted_start_date = '';
					formatted_end_date = '';
					reload_log_list();
				}}><X size="20" />Clear Date</Button
			>
		</div>
	</div>

	<div class="flex max-h-[65vh] min-h-[50vh] border-2">
		<Table.Root>
			<Table.Caption>
				<Pagination.Root count={log_list_len} perPage={10} let:pages let:currentPage>
					<Pagination.Content>
						<Pagination.Item>
							<Pagination.PrevButton
								on:click={async () => {
									paginationPage = paginationPage - 1;
									await get_log_on_nav();
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
											await get_log_on_nav();
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
										await get_log_on_nav();
									}
								}}
							/>
						</Pagination.Item>
					</Pagination.Content>
				</Pagination.Root>
			</Table.Caption>
			<Table.Header>
				<Table.Row>
					<Table.Head>Event ID.</Table.Head>
					<Table.Head>User</Table.Head>
					<Table.Head>Event Description</Table.Head>
					<Table.Head class="text-center">Date and Time</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#key inventory_history_list}
					{#each inventory_history_list as log}
						<Table.Row>
							<Table.Cell class="font-medium">{log.inventory_history.id}</Table.Cell>
							<Table.Cell>{log.inventory_history.username}</Table.Cell>
							<Table.Cell>{log.inventory_history.action}</Table.Cell>
							<Table.Cell class="text-center">{log.formattedTime}</Table.Cell>
						</Table.Row>
					{/each}
				{/key}
			</Table.Body>
		</Table.Root>
	</div>
</div>
