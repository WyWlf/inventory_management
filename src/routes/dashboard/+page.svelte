<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';
	import type { inventory_history } from '$lib/schema';
	import { CircleDollarSign } from 'lucide-svelte';
	import { Box } from 'lucide-svelte';
	import { onMount } from 'svelte';

	type dashboard_interface = {
		this_day_revenue: {
			0: { revenue: number | null};
		};
		this_month_revenue: {
			0: { revenue: number | null };
		};
		overall_statistics: {
			0: {
				revenue: number | null ;
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
		events: {
			inventory_history: {
				id: number;
				username: string;
				action: string;
			};
			formattedTime: string;
		}[];
	};
	export let data: { data: dashboard_interface };
	onMount(() => {});
</script>

<div class="flex w-full flex-col border-2 p-4">
	<h1 class="ml-4 text-4xl font-bold">Dashboard</h1>
	<div class="my-4 ml-4 grid grid-cols-4 gap-4">
		<Card.Root class="w-full">
			<Card.Header>
				<div class="flex flex-row items-center justify-between">
					<Card.Title>Today's Revenue</Card.Title>
					<CircleDollarSign />
				</div>
			</Card.Header>
			<Card.Content class="text-2xl font-bold">
				<p>PHP {data.data.this_day_revenue[0].revenue?.toFixed(2) || 0}</p>
			</Card.Content>
		</Card.Root>
		<Card.Root class="w-full">
			<Card.Header>
				<div class="flex flex-row items-center justify-between">
					<Card.Title>This Month's Revenue</Card.Title>
					<CircleDollarSign />
				</div>
			</Card.Header>
			<Card.Content class="text-2xl font-bold">
				<p>PHP {data.data.this_month_revenue[0].revenue?.toFixed(2) || 0}</p>
			</Card.Content>
		</Card.Root>
		<Card.Root class="w-full">
			<Card.Header>
				<div class="flex flex-row items-center justify-between">
					<Card.Title>Number of Items Sold</Card.Title>
					<Box />
				</div>
			</Card.Header>
			<Card.Content class="text-2xl font-bold">
				<p>{data.data.overall_statistics[0].items_sold || 0}</p>
			</Card.Content>
		</Card.Root>
		<Card.Root class="w-full">
			<Card.Header>
				<div class="flex flex-row items-center justify-between">
					<Card.Title>Total Revenue</Card.Title>
					<CircleDollarSign />
				</div>
			</Card.Header>
			<Card.Content class="text-2xl font-bold">
				<p>PHP {data.data.overall_statistics[0].revenue?.toFixed(2) || 0}</p>
			</Card.Content>
		</Card.Root>
	</div>
	<div class="ml-4 flex flex-col border-2">
		<h1 class="p-4 text-2xl font-bold">Metrics</h1>
		<div class="flex flex-row max-xl:flex-wrap">
			<div class="m-4 flex w-full flex-row gap-4">
				<Card.Root class="w-full border-none">
					<Card.Header>
						<div class="flex flex-row items-center justify-between">
							<Card.Title class="text-green-600 dark:text-green-500">Top selling items</Card.Title>
						</div>
					</Card.Header>
					<Card.Content class="text-2xl font-bold">
						<Table.Root>
							<Table.Caption>A list of your recent top selling items.</Table.Caption>
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
							<Card.Title class="text-red-500">Lowest selling items</Card.Title>
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
							<Card.Title class="text-red-500">Low stock items</Card.Title>
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
										<Table.Cell class="text-right">{low.total_stock}</Table.Cell>
									</Table.Row>
								{/each}
							</Table.Body>
						</Table.Root>
					</Card.Content>
				</Card.Root>
			</div>
		</div>
		<hr />
		<div class="flex w-full flex-row gap-4 border-black p-4 dark:border-white">
			<Card.Root class="min-h-[50vh] w-full border-none">
				<Card.Header>
					<div class="flex flex-row items-center justify-between">
						<Card.Title class="text-blue-500">10 Recent System Events</Card.Title>
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
		</div>
	</div>
</div>
