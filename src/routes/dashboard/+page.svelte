<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';
	import {
		CircleDollarSign,
		LayoutDashboard,
		NotepadText,
		Package,
		TrendingDown,
		TrendingUp
	} from 'lucide-svelte';
	import { Box } from 'lucide-svelte';
	import { onMount } from 'svelte';

	type dashboard_interface = {
		this_day_revenue: {
			0: { revenue: number | null };
		};
		yesterday_revenue: {
			0: { revenue: number | null };
		};
		last_month_revenue: {
			0: { revenue: number | null };
		};
		this_month_revenue: {
			0: { revenue: number | null };
		};
		overall_statistics: {
			0: {
				revenue: number | null;
				items_sold: number | null;
			};
		};
		top_selling_metric: {
			item_name: string;
			total_units: number;
		}[];
		low_selling_metric: {
			item_name: string;
			total_units: number;
		}[];
		low_stock_metric: {
			item_name: string;
			total_stock: number;
		}[];
		// events: {
		// 	inventory_history: {
		// 		id: number;
		// 		username: string;
		// 		action: string;
		// 	};
		// 	formattedTime: string;
		// }[];
		total_inventory_cost: {
			0: { total_cost: number | null };
		};
		// total_profit: {
		// 	0: { total_profit: number | null };
		// };
	};

	let day_revenue_growth = 0;
	let month_revenue_growth = 0;
	export let data: { data: dashboard_interface };

	function calculate_growth(new_value: number, old_value: number) {
		if (old_value == null || old_value == 0) return 0;
		return ((new_value - old_value) / old_value) * 100;
	}
	onMount(() => {
		if (data.data.yesterday_revenue[0].revenue! > 0) {
			day_revenue_growth = calculate_growth(
				data.data.this_day_revenue[0].revenue!,
				data.data.yesterday_revenue[0].revenue!
			);
		}

		if (data.data.last_month_revenue[0].revenue! > 0) {
			month_revenue_growth = calculate_growth(
				data.data.this_month_revenue[0].revenue!,
				data.data.last_month_revenue[0].revenue!
			);
		}
		console.log(day_revenue_growth, month_revenue_growth);
	});
</script>

<div class="flex w-full flex-col border-2 p-4">
	<h1 class="ml-4 flex flex-row items-center gap-2 text-4xl font-bold">
		<LayoutDashboard size="45" />Dashboard
	</h1>
	<div class="my-8 ml-4 flex flex-row gap-4 max-lg:text-sm">
		<div class="flex w-full flex-col gap-2 max-lg:flex-col">
			<!---------------today revenue Card-------------->
			<Card.Root class="h-[50%] w-full bg-slate-100 dark:bg-transparent">
				<Card.Header>
					<div class="flex flex-row items-center justify-between">
						<Card.Title>Today's Revenue</Card.Title>
						<CircleDollarSign />
					</div>
				</Card.Header>
				<Card.Content
					class="flex h-[80%] flex-col items-center justify-between gap-4 text-2xl font-bold max-lg:mt-12 max-lg:h-[70%]"
				>
					{#if day_revenue_growth >= 0}
						<img src="up.svg" alt="" srcset="" />
					{:else}
						<img src="down.svg" alt="" srcset="" />
					{/if}
					<div class="flex flex-col self-start">
						<p class="text-4xl">
							PHP {data.data.this_day_revenue[0].revenue?.toFixed(2) || 0}
						</p>
						<p class="text-lg font-normal opacity-70">
							{day_revenue_growth.toFixed(2)}% growth over yesterday
						</p>
					</div>
				</Card.Content>
			</Card.Root>
			<!---------------month revenue Card-------------->
			<Card.Root class="h-[50%] w-full bg-slate-100 dark:bg-transparent">
				<Card.Header>
					<div class="flex flex-row items-center justify-between">
						<Card.Title>Month Revenue</Card.Title>
						<CircleDollarSign />
					</div>
				</Card.Header>
				<Card.Content
					class="flex h-[80%] flex-col items-center justify-between gap-4 text-2xl font-bold max-lg:mt-12 max-lg:h-[70%]"
				>
					{#if month_revenue_growth >= 0}
						<img src="up.svg" alt="" srcset="" />
					{:else}
						<img src="down.svg" alt="" srcset="" />
					{/if}
					<div class="flex flex-col self-start">
						<p class="text-4xl">PHP {data.data.this_month_revenue[0].revenue?.toFixed(2) || 0}</p>
						<p class="text-lg font-normal opacity-70">
							{month_revenue_growth}% growth over last month
						</p>
					</div>
				</Card.Content>
			</Card.Root>
		</div>
		<div class="flex w-full flex-col gap-2">
			<div class="flex w-full flex-1 flex-row gap-2 max-lg:flex-col">
				<!---------------total inventory Card-------------->
				<Card.Root class="w-full bg-slate-100 dark:bg-transparent">
					<Card.Header>
						<div class="flex flex-row items-center justify-between">
							<Card.Title>Total Inventory Cost</Card.Title>
							<CircleDollarSign />
						</div>
					</Card.Header>
					<Card.Content class="mt-12 flex items-center justify-center text-2xl font-bold">
						<p>PHP {data.data.total_inventory_cost[0].total_cost?.toFixed(2) || 0}</p>
					</Card.Content>
				</Card.Root>
				<!---------------Item sold Card-------------->
				<Card.Root class="w-full bg-slate-100 dark:bg-transparent">
					<Card.Header>
						<div class="flex flex-row items-center justify-between">
							<Card.Title>No. of Items Sold</Card.Title>
							<Box />
						</div>
					</Card.Header>
					<Card.Content class="mt-12 flex items-center justify-center text-2xl font-bold">
						<p>{data.data.overall_statistics[0].items_sold || 0}</p>
					</Card.Content>
				</Card.Root>
			</div>

			<div class="flex w-full flex-1 flex-row gap-2 max-lg:flex-col">
				<!---------------Revenue Card-------------->
				<Card.Root class="w-full bg-slate-100 dark:bg-transparent">
					<Card.Header>
						<div class="flex flex-row items-center justify-between">
							<Card.Title>Total Revenue</Card.Title>
							<CircleDollarSign />
						</div>
					</Card.Header>
					<Card.Content
						class="mt-12 flex flex-col items-center justify-center text-center text-2xl font-bold"
					>
						<p>PHP {data.data.overall_statistics[0].revenue?.toFixed(2) || 0}</p>
						<p class="text-sm font-normal opacity-70">
							Money generated by the sale of goods and services
						</p>
					</Card.Content>
				</Card.Root>
				<!---------------Profit Card-------------->
				<!-- <Card.Root class="w-full">
					<Card.Header>
						<div class="flex flex-row items-center justify-between">
							<Card.Title>Total Profit</Card.Title>
							<CircleDollarSign />
						</div>
					</Card.Header>
					<Card.Content
						class="mt-12 flex flex-col items-center justify-center text-center text-2xl font-bold"
					>
						<p>PHP {data.data.total_profit[0].total_profit?.toFixed(2) || 0}</p>
						<p class="text-sm font-normal opacity-70">
							Money generated after deducting business cost from the revenue
						</p>
					</Card.Content>
				</Card.Root> -->
			</div>
		</div>
	</div>
	<!---------------Metric sub menu-------------->
	<div class="ml-4 flex flex-col rounded-2xl border-2 bg-slate-300 dark:bg-transparent">
		<h1 class="p-4 text-2xl font-bold">Metrics</h1>
		<div class="flex flex-row max-xl:flex-wrap">
			<div class="m-4 flex w-full flex-row gap-4">
				<Card.Root class="w-full border-none ">
					<Card.Header>
						<div class="flex flex-row items-center justify-between">
							<Card.Title
								class="flex flex-row items-center gap-4 text-xl font-bold text-green-600 dark:text-green-500"
								>Top selling items<TrendingUp /></Card.Title
							>
						</div>
					</Card.Header>
					<Card.Content class="text-2xl font-bold">
						<Table.Root>
							<Table.Caption>A list of your top selling items.</Table.Caption>
							<Table.Header>
								<Table.Row>
									<Table.Head class="w-[100px]">No</Table.Head>
									<Table.Head>Item Name</Table.Head>
									<Table.Head class="text-right">Number of items sold</Table.Head>
								</Table.Row>
							</Table.Header>
							<Table.Body>
								{#each data.data.top_selling_metric as top, i}
									<Table.Row>
										<Table.Cell class="font-medium">{i + 1}</Table.Cell>
										<Table.Cell>{top.item_name}</Table.Cell>
										<Table.Cell class="text-right">{top.total_units}</Table.Cell>
									</Table.Row>
								{/each}
							</Table.Body>
						</Table.Root>
					</Card.Content>
				</Card.Root>
				<Card.Root class="w-full border-none">
					<Card.Header>
						<div class="flex flex-row items-center justify-between">
							<Card.Title
								class="flex flex-row items-center gap-4 text-xl font-bold text-red-600 dark:text-red-500"
								>Lowest selling items<TrendingDown /></Card.Title
							>
						</div>
					</Card.Header>
					<Card.Content class="text-2xl font-bold">
						<Table.Root>
							<Table.Caption>A list of your least selling items.</Table.Caption>
							<Table.Header>
								<Table.Row>
									<Table.Head class="w-[100px]">No</Table.Head>
									<Table.Head>Item Name</Table.Head>
									<Table.Head class="text-right">Number of items sold</Table.Head>
								</Table.Row>
							</Table.Header>
							<Table.Body>
								{#each data.data.low_selling_metric as low, i}
									<Table.Row>
										<Table.Cell class="font-medium">{i + 1}</Table.Cell>
										<Table.Cell>{low.item_name}</Table.Cell>
										<Table.Cell class="text-right">{low.total_units}</Table.Cell>
									</Table.Row>
								{/each}
							</Table.Body>
						</Table.Root>
					</Card.Content>
				</Card.Root>
			</div>
			<div
				class="m-4 flex w-full flex-row gap-4 border-l-4 border-black pl-8 dark:border-white max-xl:border-none max-xl:pl-0"
			>
				<Card.Root class="w-full border-none">
					<Card.Header>
						<div class="flex flex-row items-center justify-between">
							<Card.Title
								class="flex flex-row items-center gap-4 text-xl font-bold text-red-600 dark:text-red-500"
								>Low stock items<Package /></Card.Title
							>
						</div>
					</Card.Header>
					<Card.Content class="text-2xl font-bold">
						<Table.Root>
							<Table.Caption>A list of your low stock items.</Table.Caption>
							<Table.Header>
								<Table.Row>
									<Table.Head class="w-[100px]">No</Table.Head>
									<Table.Head>Item Name</Table.Head>
									<Table.Head class="text-right">Number of items left</Table.Head>
								</Table.Row>
							</Table.Header>
							<Table.Body>
								{#each data.data.low_stock_metric as low, i}
									<Table.Row>
										<Table.Cell class="font-medium">{i + 1}</Table.Cell>
										<Table.Cell>{low.item_name}</Table.Cell>
										<Table.Cell class="text-right text-red-500">{low.total_stock}</Table.Cell>
									</Table.Row>
								{/each}
							</Table.Body>
						</Table.Root>
					</Card.Content>
				</Card.Root>
			</div>
		</div>
		<!-- <hr />
		<div class="flex w-full flex-row gap-4 border-black p-4 dark:border-white">
			<Card.Root class="min-h-[50vh] w-full border-none">
				<Card.Header>
					<div class="flex flex-row items-center justify-between">
						<Card.Title class="flex flex-row items-center gap-4 text-xl font-bold text-blue-500"
							>10 Recent System Events <NotepadText /></Card.Title
						>
					</div>
				</Card.Header>
				<Card.Content class="text-2xl font-bold">
					<Table.Root>
						<Table.Caption>A list of system events.</Table.Caption>
						<Table.Header>
							<Table.Row>
								<Table.Head class="w-[100px]">Event ID</Table.Head>
								<Table.Head>User</Table.Head>
								<Table.Head>Event Description</Table.Head>
								<Table.Head class="text-right">Date and Time</Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#each data.data.events as event}
								<Table.Row>
									<Table.Cell class="font-medium">{event.inventory_history.id}</Table.Cell>
									<Table.Cell>{event.inventory_history.username}</Table.Cell>
									<Table.Cell class="text-wrap">{event.inventory_history.action}</Table.Cell>
									<Table.Cell class="text-right">{event.formattedTime}</Table.Cell>
								</Table.Row>
							{/each}
						</Table.Body>
					</Table.Root>
				</Card.Content>
			</Card.Root>
		</div> -->
	</div>
</div>
