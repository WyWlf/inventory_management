<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import CalendarIcon from 'svelte-radix/Calendar.svelte';
	import { DateFormatter, type DateValue, getLocalTimeZone } from '@internationalized/date';
	import { cn } from '$lib/utils.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Calendar } from '$lib/components/ui/calendar/index.js';
	import { Textarea } from '$lib/components/ui/textarea';
	import { CalendarDays, Filter, HandCoins, X } from 'lucide-svelte';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as Table from '$lib/components/ui/table';
	import * as Pagination from '$lib/components/ui/pagination';
	import * as Dialog from '$lib/components/ui/dialog';
	import { get_sales_history } from './query';
	import { onMount } from 'svelte';
	const df = new DateFormatter('en-US', {
		dateStyle: 'long'
	});

	type sales_history_interface = {
		formattedTime: string;
		sales_history: {
			id: number;
			item_id: number;
			item_name: string;
			units: number;
			discount: number;
			price_discounted: number;
			price_unit: number;
			total_cost: number;
			time: string;
		};
	};

	export let data: { data: sales_history_interface[] };
	const original_sales_list = data.data;
	let sales_history_list = data.data;
	let sales_list_len = original_sales_list.length;
	sales_history_list = sales_history_list.slice(0, 10);
	let startDate: DateValue | undefined = undefined;
	let endDate: DateValue | undefined = undefined;

	let formatted_start_date = '';
	let formatted_end_date = '';
	let total_cost = 0;
	let total_units = 0;
	let search = '';
	let filterOpt = 'Daily';
	let updateProductDialog = false;
	let paginationPage = 1;
	async function reload_sales_list() {
		const get_list_response: [] = await get_sales_history(
			search,
			formatted_start_date,
			formatted_end_date,
			filterOpt
		);
		sales_list_len = get_list_response.length;
		let list_end = 10;
		let copy_list = get_list_response;
		sales_history_list = copy_list.slice(0, list_end);

		total_cost = 0;
		total_units = 0;
		get_list_response.forEach((data: { sales_history: { total_cost: number; units: number } }) => {
			total_cost += data.sales_history.total_cost;
			total_units += data.sales_history.units;
		});
	}

	async function get_sales_on_nav() {
		const get_list_response = await get_sales_history(
			search,
			formatted_start_date,
			formatted_end_date,
			filterOpt
		);
		sales_list_len = get_list_response.length;
		let list_start = 0;
		let list_end = 10;
		let copy_list = get_list_response;

		if (paginationPage > 1) {
			list_start = 10 * paginationPage - 10;
			list_end = list_start + 10;
			sales_history_list = copy_list.slice(list_start, list_end);
		} else {
			sales_history_list = copy_list.slice(0, list_end);
		}
	}

	function formate_date() {
		formatted_start_date = pad_date_values(startDate);
		formatted_end_date = pad_date_values(endDate);

		reload_sales_list();
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
		// await get_sales_on_nav();
		original_sales_list.forEach(
			(data: { sales_history: { total_cost: number; units: number } }) => {
				total_cost += data.sales_history.total_cost;
				total_units += data.sales_history.units;
			}
		);
	});

	$: if (startDate || endDate) {
		formate_date();
	}
</script>

<div class="flex w-full flex-col border-2 p-4 bg-slate-100 dark:bg-transparent">
	<h1 class="ml-4 flex flex-row items-center gap-2 text-4xl font-bold">
		<HandCoins size="45" />Sales History
	</h1>
	<div class="my-8 ml-4 flex flex-row items-center gap-24">
		<div class="flex flex-row items-center">
			<Label for="email">Search</Label>
			<Input
				class="m-2 w-min"
				bind:value={search}
				placeholder="search by item name"
				on:input={reload_sales_list}
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
					reload_sales_list();
				}}><X size="20" />Clear Date</Button
			>
			<!-- <Button variant="outline" class="float-right max-xl:m-0" on:click={() => {}}
				>Generate Chart</Button
			> -->
		</div>
	</div>

	<div class="flex max-h-[65vh] min-h-[50vh] border-2">
		<Table.Root>
			<Table.Caption>
				<Pagination.Root count={sales_list_len} perPage={10} let:pages let:currentPage>
					<Pagination.Content>
						<Pagination.Item>
							<Pagination.PrevButton
								on:click={async () => {
									paginationPage = paginationPage - 1;
									await get_sales_on_nav();
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
											await get_sales_on_nav();
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
										await get_sales_on_nav();
									}
								}}
							/>
						</Pagination.Item>
					</Pagination.Content>
				</Pagination.Root>
			</Table.Caption>
			<Table.Header>
				<Table.Row>
					<Table.Head>Transaction No.</Table.Head>
					<Table.Head>Item Name</Table.Head>
					<Table.Head class="text-center">No. of items sold</Table.Head>
					<Table.Head class="text-center">Date and Time</Table.Head>
					<Table.Head class="text-center">Discount applied</Table.Head>
					<Table.Head class="text-right">Price discount</Table.Head>
					<Table.Head class="text-right">Price per unit</Table.Head>
					<Table.Head class="text-right">Total</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#key sales_history_list}
					{#each sales_history_list as sale}
						<Table.Row>
							<Table.Cell class="font-medium">{sale.sales_history.id}</Table.Cell>
							<Table.Cell>{sale.sales_history.item_name}</Table.Cell>
							<Table.Cell class="text-center">{sale.sales_history.units}</Table.Cell>
							<Table.Cell class="text-center">{sale.formattedTime}</Table.Cell>
							<Table.Cell class="text-center">{sale.sales_history.discount}%</Table.Cell>
							<Table.Cell class="text-right"
								>PHP {sale.sales_history.price_discounted.toFixed(2)}</Table.Cell
							>
							<Table.Cell class="text-right"
								>PHP {sale.sales_history.price_unit.toFixed(2)}</Table.Cell
							>
							<Table.Cell class="text-right"
								>PHP {sale.sales_history.total_cost.toFixed(2)}</Table.Cell
							>
						</Table.Row>
					{/each}
				{/key}
				<Table.Row class="border-none">
					<Table.Cell></Table.Cell>
					<Table.Cell></Table.Cell>
					<Table.Cell></Table.Cell>
					<Table.Cell></Table.Cell>
					<Table.Cell></Table.Cell>
					<Table.Cell></Table.Cell>
					<Table.Cell class="float-right flex flex-row items-center gap-4 text-right font-bold"
						>Total Revenue</Table.Cell
					>
					<Table.Cell class="text-right font-bold">PHP {total_cost.toFixed(2)}</Table.Cell>
				</Table.Row>
				<Table.Row>
					<Table.Cell></Table.Cell>
					<Table.Cell></Table.Cell>
					<Table.Cell></Table.Cell>
					<Table.Cell></Table.Cell>
					<Table.Cell></Table.Cell>
					<Table.Cell></Table.Cell>
					<Table.Cell class="text-right font-bold">Total Items Sold</Table.Cell>
					<Table.Cell class="text-right font-bold">{total_units} units</Table.Cell>
				</Table.Row>
			</Table.Body>
		</Table.Root>
	</div>
</div>

<Dialog.Root open={updateProductDialog} closeOnEscape={true}>
	<Dialog.Content>
		<Dialog.Title>Update Product Information</Dialog.Title>
		<div class="grid gap-4 py-8">
			<div class="flex flex-col gap-4">
				<Label for="name">Product Name:</Label>
				<Input id="name" value="" class="col-span-3" />
			</div>
			<div class="flex flex-col gap-4">
				<Label for="description">Product Description:</Label>
				<Textarea id="description"></Textarea>
			</div>
			<div class="flex flex-row items-center justify-between gap-4">
				<Label for="username">Product Type:</Label>
				<DropdownMenu.Root>
					<DropdownMenu.Trigger>
						<Button variant="outline">Clothing</Button>
					</DropdownMenu.Trigger>
					<DropdownMenu.Content>
						<DropdownMenu.Group>
							<DropdownMenu.Item on:click={() => {}}>Daily</DropdownMenu.Item>
							<DropdownMenu.Item on:click={() => {}}>Monthly</DropdownMenu.Item>
							<DropdownMenu.Item on:click={() => {}}>Custom</DropdownMenu.Item>
						</DropdownMenu.Group>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			</div>
			<div class="flex flex-row items-center justify-between gap-4">
				<Label for="cost" class="min-w-max">Unit Cost:</Label>
				<div class="flex flex-row items-center gap-4">
					<span>PHP</span>
					<Input id="cost" value="" class="" type="number" on:blur={() => {}} />
				</div>
			</div>
			<div class="flex flex-row items-center justify-between gap-4">
				<Label for="price">Unit Price:</Label>
				<div class="flex flex-row items-center gap-4">
					<span>PHP</span>
					<Input id="price" value="" class="" type="number" on:blur={() => {}} />
				</div>
			</div>
		</div>
		<Dialog.Footer>
			<Button>Save changes</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
