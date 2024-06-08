<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Textarea } from '$lib/components/ui/textarea';
	import { toast } from 'svelte-sonner';
	import { Toaster } from '$lib/components/ui/sonner';
	import { Blocks, Boxes, Images, PackagePlus } from 'lucide-svelte';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as Table from '$lib/components/ui/table';
	import * as Pagination from '$lib/components/ui/pagination';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Tabs from '$lib/components/ui/tabs';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Carousel from '$lib/components/ui/carousel/index.js';
	import { add_product, delete_product, get_products, update_product, update_stock } from './query';
	import { onMount } from 'svelte';

	let search = '';
	let addProductDialog = false;
	let updateProductDialog = false;
	let updateStockDialog = false;
	let deleteDialog = false;
	let paginationPage = 1;
	export let data: {
		data: {
			query: product_database_interface[];
			types: { type: string }[];
			unique_product_name: { item_name: string }[];
			unique_brand_name: { product_brand: string }[];
		};
	};
	const original_product_list = data.data.query;
	let original_unique_list = data.data.unique_product_name;

	let current_unique_list: [] = JSON.parse(JSON.stringify(original_unique_list));
	let current_brand_list: any[] = JSON.parse(JSON.stringify(data.data.unique_brand_name));

	let product_list_len = 0;
	let product_list = data.data.query;
	product_list = product_list.slice(0, 10);
	let product_types = data.data.types;
	let delete_product_id = 0;
	let delete_item_name = '';
	let stock_count = 0;
	let image_modal = false;
	let tab_value = 'add';
	let image_carousel_list: { id: number; encoded: string }[] = [];
	let reason_list = ['Transfer to recipient', 'Stock removal', 'Damaged unit'];
	type product_database_interface = {
		id: number;
		product_brand: string;
		item_name: string;
		description: string;
		product_type: string;
		unit_cost: number;
		unit_price: number;
		stock: number;
		images: string;
	};

	type stock_form_interface = {
		id: number;
		item_name: string;
		stock: number;
		action: string;
		unit_price: number;
		discount: number;
		total_price: number;
	};

	let add_product_form: product_database_interface = {
		id: 0,
		product_brand: '',
		item_name: '',
		description: '',
		product_type: '',
		unit_cost: 0,
		unit_price: 0,
		stock: 0,
		images: ''
	};

	let update_product_form: product_database_interface = {
		id: 0,
		product_brand: '',
		item_name: '',
		description: '',
		product_type: '',
		unit_cost: 0,
		unit_price: 0,
		stock: 0,
		images: ''
	};

	let stock_product_form: stock_form_interface = {
		id: 0,
		item_name: '',
		stock: 0,
		unit_price: 0,
		discount: 0,
		action: '',
		total_price: 0
	};

	let outgoing_form: {
		reason: string;
		recipient: string;
	} = {
		reason: '',
		recipient: ''
	};

	function formValid(form: any) {
		if (form.item_name == '' || form.item_name == null) {
			return {
				status: false,
				msg: 'Product name cannot be empty.'
			};
		}

		if (
			current_unique_list.findIndex(
				(item: { item_name: string }) =>
					item.item_name.toLowerCase() == form.item_name.toLowerCase()
			) > -1
		) {
			return {
				status: false,
				msg: 'Product name cannot be a duplicate of another item.'
			};
		}

		if (form.product_type == '' || form.product_type == null) {
			return {
				status: false,
				msg: 'Product type cannot be empty.'
			};
		}
		if (form.unit_cost < 0 || form.unit_cost == null || isNaN(form.unit_cost)) {
			return {
				status: false,
				msg: 'Product cost cannot be less than 0.'
			};
		}
		if (
			add_product_form.unit_price < 0 ||
			add_product_form.unit_price == null ||
			isNaN(add_product_form.unit_price)
		) {
			return {
				status: false,
				msg: 'Product price cannot be less than 0.'
			};
		}
		return {
			status: true
		};
	}

	function clearForm() {
		add_product_form = {
			id: 0,
			product_brand: '',
			item_name: '',
			description: '',
			product_type: '',
			unit_cost: 0,
			unit_price: 0,
			stock: 0,
			images: ''
		};
	}

	async function reload_product_list() {
		const get_product_response = await get_products(search);
		product_list_len = get_product_response.data.length;

		current_unique_list = get_product_response.unique_list;
		current_unique_list = current_unique_list;

		current_brand_list = get_product_response.brands;
		current_brand_list = current_brand_list;

		product_types = get_product_response.types;
		product_types = product_types;

		let list_end = 10;
		let copy_list = get_product_response.data;
		product_list = copy_list.slice(0, list_end);
	}

	async function get_product_list_on_nav() {
		const get_product_response = await get_products(search);
		product_list_len = get_product_response.data.length;

		let list_start = 0;
		let list_end = 10;
		let copy_list = get_product_response.data;

		if (paginationPage > 1) {
			list_start = 10 * paginationPage - 10;
			list_end = list_start + 10;
			product_list = copy_list.slice(list_start, list_end);
		} else {
			product_list = copy_list.slice(0, list_end);
		}
	}

	function remove_item_from_array(value: string) {
		const index = current_unique_list.findIndex(
			(index: any) => index.item_name.toLowerCase() === value.toLowerCase()
		);
		if (index > -1) {
			current_unique_list.splice(index, 1);
			current_unique_list = current_unique_list;
		}
	}

	function calculate_receipt(discount: number) {
		let initial_price = parseFloat((stock_product_form.unit_price * stock_count).toFixed(2));
		let discount_percentage = 0;
		if (discount > 0) {
			discount_percentage = discount / 100;
			stock_product_form.total_price = parseFloat(
				(initial_price - initial_price * discount_percentage).toFixed(2)
			);
		} else if (discount === 0) {
			stock_product_form.total_price = parseFloat(initial_price.toFixed(2));
		}
	}

	function deep_copy_unique_list() {
		return JSON.parse(JSON.stringify(current_unique_list));
	}

	function create_deep_copy(arr: any) {
		return JSON.parse(JSON.stringify(arr));
	}

	let files: any = [];
	function getBase64(file: any) {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = () => {
				let encoded = reader.result?.toString().replace(/^data:(.*,)?/, '');
				if (encoded!.length % 4 > 0) {
					encoded += '='.repeat(4 - (encoded!.length % 4));
				}
				resolve(encoded);
			};
			reader.onerror = (error) => reject(error);
		});
	}

	async function compile_image_blobs() {
		let image_list: any = [];
		for (let i = 0; i < files.length; i++) {
			const result = await getBase64(files[i]);
			image_list.push({
				id: i,
				encoded: result
			});
		}
		image_list = image_list;
		files = [];
		return image_list;
	}

	onMount(async () => {
		product_list_len = original_product_list.length;
	});
</script>

<div class="flex w-full flex-col border-2 p-4 bg-slate-100 dark:bg-transparent">
	<h1 class="ml-4 flex flex-row items-center gap-2 text-4xl font-bold">
		<Boxes size="45" />Inventory Management
	</h1>
	<div class="my-8 ml-4 flex flex-row items-center gap-24">
		<div class="flex flex-row items-center">
			<Label for="email">Search</Label>
			<Input
				class="m-2 w-min"
				bind:value={search}
				on:input={reload_product_list}
				placeholder="search by product name"
			/>
			<Button
				variant="outline"
				class="float-right m-4 flex flex-row items-center justify-center gap-2 max-xl:m-0"
				on:click={() => {
					files = [];
					if (addProductDialog) {
						addProductDialog = false;
						addProductDialog = true;
					} else {
						addProductDialog = true;
					}
					clearForm();
				}}><PackagePlus size="20" /> Add Product</Button
			>
		</div>
		<div class="flex flex-row items-center gap-2 max-xl:flex-wrap"></div>
	</div>
	<div class="flex max-h-[65vh] min-h-[65vh] flex-col overflow-y-auto border-2">
		<Table.Root>
			<Table.Caption>
				<Pagination.Root count={product_list_len} perPage={10} let:pages let:currentPage>
					<Pagination.Content>
						<Pagination.Item>
							<Pagination.PrevButton
								on:click={async () => {
									paginationPage = paginationPage - 1;
									await get_product_list_on_nav();
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
											await get_product_list_on_nav();
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
										await get_product_list_on_nav();
									}
								}}
							/>
						</Pagination.Item>
					</Pagination.Content>
				</Pagination.Root>
			</Table.Caption>
			<Table.Header>
				<Table.Row>
					<Table.Head>Item ID</Table.Head>
					<Table.Head>Product Brand</Table.Head>
					<Table.Head>Product Name</Table.Head>
					<Table.Head>Description</Table.Head>
					<Table.Head>Product Type</Table.Head>
					<Table.Head class="text-center">Available Stock</Table.Head>
					<Table.Head class="text-right">Unit Cost</Table.Head>
					<Table.Head class="text-right">Unit Price</Table.Head>
					<Table.Head class="text-center">Action</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#key product_list}
					{#each product_list as product}
						<Table.Row>
							<Table.Cell class="font-medium">{product.id}</Table.Cell>
							<Table.Cell>{product.product_brand || ''}</Table.Cell>
							<Table.Cell>{product.item_name}</Table.Cell>
							<Table.Cell
								class="max-w-[400px] overflow-hidden overflow-ellipsis max-lg:max-w-[250px]"
								>{product.description || ''}</Table.Cell
							>
							<Table.Cell>{product.product_type}</Table.Cell>
							<Table.Cell class="text-center">{product.stock}</Table.Cell>
							<Table.Cell class="text-right">PHP {product.unit_cost.toFixed(2)}</Table.Cell>
							<Table.Cell class="text-right">PHP {product.unit_price.toFixed(2)}</Table.Cell>
							<Table.Cell
								class="flex items-center justify-center gap-2 text-center max-xl:flex-col"
							>
								<Button
									variant="outline"
									class="border-blue-600"
									on:click={() => {
										image_carousel_list = JSON.parse(product.images);
										if (image_modal) {
											image_modal = false;
											image_modal = true;
										} else {
											image_modal = true;
										}
									}}><Images size="20" />Show Images</Button
								>
								<DropdownMenu.Root>
									<DropdownMenu.Trigger>
										<Button variant="outline" class="border-green-600">
											<Blocks size="20" />Show Actions</Button
										>
									</DropdownMenu.Trigger>
									<DropdownMenu.Content>
										<DropdownMenu.Group>
											<DropdownMenu.Item
												on:click={() => {
													files = [];
													if (updateProductDialog) {
														updateProductDialog = false;
														updateProductDialog = true;
													} else {
														updateProductDialog = true;
													}
													update_product_form = create_deep_copy(product);
													current_unique_list = deep_copy_unique_list();
													current_unique_list = current_unique_list;
													remove_item_from_array(product.item_name);
												}}>Update Information</DropdownMenu.Item
											>
											<DropdownMenu.Item
												on:click={() => {
													if (updateStockDialog) {
														updateStockDialog = false;
														updateStockDialog = true;
													} else {
														updateStockDialog = true;
													}
													stock_product_form.id = product.id;
													stock_product_form.item_name = product.item_name;
													stock_product_form.stock = product.stock;
													stock_product_form.unit_price = product.unit_price;
												}}>Update Stock</DropdownMenu.Item
											>
											<DropdownMenu.Item
												on:click={() => {
													if (deleteDialog) {
														deleteDialog = false;
														deleteDialog = true;
													} else {
														deleteDialog = true;
													}
													delete_product_id = product.id;
													delete_item_name = product.item_name;
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

<Dialog.Root open={updateProductDialog} closeOnEscape={true}>
	<Dialog.Content>
		<Dialog.Title>Update Product Information</Dialog.Title>
		<div class="grid gap-4 py-4">
			<div class="mb-4 flex flex-row items-center gap-4">
				<Label for="name" class="min-w-max">Product Brand:</Label>
				<Input id="name" bind:value={update_product_form.product_brand} class="col-span-3" />
				<DropdownMenu.Root>
					<DropdownMenu.Trigger>
						<Button variant="outline">Brand List</Button>
					</DropdownMenu.Trigger>
					<DropdownMenu.Content>
						<DropdownMenu.Group>
							{#each current_brand_list as brand}
								<DropdownMenu.Item
									on:click={() => {
										update_product_form.product_brand = brand.product_brand;
									}}>{brand.product_brand}</DropdownMenu.Item
								>
							{/each}
						</DropdownMenu.Group>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			</div>
			<div class="flex flex-col gap-4">
				<Label for="name">Product Name:</Label>
				<Input id="name" bind:value={update_product_form.item_name} class="col-span-3" />
			</div>
			<div class="flex flex-col gap-4">
				<Label for="description">Product Description:</Label>
				<Textarea id="description" bind:value={update_product_form.description}></Textarea>
			</div>
			<div class="flex flex-row items-center justify-between gap-4">
				<Label for="username" class="min-w-max">Product Type:</Label>
				<Input
					id="name"
					bind:value={update_product_form.product_type}
					class="float-right min-w-min"
					placeholder="Clothing, Accessories, Bags"
				/>
				<DropdownMenu.Root>
					<DropdownMenu.Trigger>
						<Button variant="outline">...</Button>
					</DropdownMenu.Trigger>
					<DropdownMenu.Content>
						<DropdownMenu.Group>
							{#each product_types as type}
								<DropdownMenu.Item
									on:click={() => {
										update_product_form.product_type = type.type;
									}}>{type.type}</DropdownMenu.Item
								>
							{/each}
						</DropdownMenu.Group>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			</div>
			<div class="flex flex-row items-center justify-between gap-4">
				<Label for="cost" class="min-w-max">Unit Cost:</Label>
				<div class="flex flex-row items-center gap-4">
					<span>PHP</span>
					<Input
						id="cost"
						bind:value={update_product_form.unit_cost}
						type="number"
						on:blur={() => {
							update_product_form.unit_cost = Math.abs(update_product_form.unit_cost);
						}}
					/>
				</div>
			</div>
			<div class="flex flex-row items-center justify-between gap-4">
				<Label for="price">Unit Price:</Label>
				<div class="flex flex-row items-center gap-4">
					<span>PHP</span>
					<Input
						id="price"
						bind:value={update_product_form.unit_price}
						class=""
						type="number"
						on:blur={() => {
							update_product_form.unit_price = Math.abs(update_product_form.unit_price);
						}}
					/>
				</div>
			</div>
			<div class="flex flex-row items-center justify-between gap-4">
				<Label for="files">Images:</Label>
				<div class="flex flex-row items-center gap-4">
					<input id="files" bind:files type="file" multiple accept="image/png, image/jpeg" />
				</div>
			</div>
		</div>
		<Dialog.Footer>
			<Button
				on:click={async () => {
					if (formValid(update_product_form).status) {
						if (files.length > 0) {
							update_product_form.images = await compile_image_blobs();
						} else {
							update_product_form.images = JSON.parse(update_product_form.images);
						}
						const response = await update_product(
							update_product_form.product_brand,
							update_product_form.id,
							update_product_form.item_name,
							update_product_form.description,
							update_product_form.product_type,
							update_product_form.unit_cost,
							update_product_form.unit_price,
							update_product_form.images
						);
						if (response == 200) {
							toast.success('Action success', {
								description: update_product_form.item_name + ' has been updated.'
							});
							updateProductDialog = false;
							reload_product_list();
						} else {
							toast.error('Action failed', {
								description: 'An error occured in the server.'
							});
						}
					} else {
						toast.error('Action failed', {
							description: formValid(update_product_form).msg
						});
					}
				}}>Update product</Button
			>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root open={addProductDialog} closeOnEscape={true}>
	<Dialog.Content>
		<Dialog.Header class="pt-4">
			<Dialog.Title>Add New Product</Dialog.Title>
		</Dialog.Header>
		<div class="grid gap-4 py-4">
			<div class="mb-4 flex flex-row items-center gap-4">
				<Label for="name" class="min-w-max">Product Brand:</Label>
				<Input id="name" bind:value={add_product_form.product_brand} class="col-span-3" />
				<DropdownMenu.Root>
					<DropdownMenu.Trigger>
						<Button variant="outline">Brand List</Button>
					</DropdownMenu.Trigger>
					<DropdownMenu.Content>
						<DropdownMenu.Group>
							{#each current_brand_list as brand}
								<DropdownMenu.Item
									on:click={() => {
										add_product_form.product_brand = brand.product_brand;
									}}>{brand.product_brand}</DropdownMenu.Item
								>
							{/each}
						</DropdownMenu.Group>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			</div>
			<div class="flex flex-col gap-4">
				<Label for="name">Product Name:</Label>
				<Input id="name" bind:value={add_product_form.item_name} class="col-span-3" />
			</div>
			<div class="flex flex-col gap-4">
				<Label for="description">Product Description:</Label>
				<Textarea id="description" bind:value={add_product_form.description}></Textarea>
			</div>
			<div class="flex flex-row items-center justify-between gap-4">
				<Label for="username" class="min-w-max">Product Type:</Label>
				<Input
					id="name"
					bind:value={add_product_form.product_type}
					class="float-right min-w-min"
					placeholder="Clothing, Accessories, Bags"
				/>
				<DropdownMenu.Root>
					<DropdownMenu.Trigger>
						<Button variant="outline">Type List</Button>
					</DropdownMenu.Trigger>
					<DropdownMenu.Content>
						<DropdownMenu.Group>
							{#each product_types as type}
								<DropdownMenu.Item
									on:click={() => {
										add_product_form.product_type = type.type;
									}}>{type.type}</DropdownMenu.Item
								>
							{/each}
						</DropdownMenu.Group>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			</div>
			<div class="flex flex-row items-center justify-between gap-4">
				<Label for="cost" class="min-w-max">Unit Cost:</Label>
				<div class="flex flex-row items-center gap-4">
					<span>PHP</span>
					<Input
						id="cost"
						bind:value={add_product_form.unit_cost}
						class=""
						type="number"
						on:blur={() => {
							add_product_form.unit_cost = Math.abs(add_product_form.unit_cost);
						}}
					/>
				</div>
			</div>
			<div class="flex flex-row items-center justify-between gap-4">
				<Label for="price">Unit Price:</Label>
				<div class="flex flex-row items-center gap-4">
					<span>PHP</span>
					<Input
						id="price"
						bind:value={add_product_form.unit_price}
						class=""
						type="number"
						on:blur={() => {
							add_product_form.unit_price = Math.abs(add_product_form.unit_price);
						}}
					/>
				</div>
			</div>
			<div class="flex flex-row items-center justify-between gap-4">
				<Label for="price">Quantity:</Label>
				<div class="flex flex-row items-center gap-4">
					<span>Qty.</span>
					<Input
						id="price"
						bind:value={add_product_form.stock}
						class=""
						type="number"
						on:blur={() => {
							add_product_form.stock = Math.abs(add_product_form.stock);
						}}
					/>
				</div>
			</div>
			<div class="flex flex-row items-center justify-between gap-4">
				<Label for="files">Images:</Label>
				<div class="flex flex-row items-center gap-4">
					<input id="files" bind:files type="file" multiple accept="image/png, image/jpeg" />
				</div>
			</div>
		</div>
		<Dialog.Footer>
			<Button
				on:click={async () => {
					if (formValid(add_product_form).status) {
						add_product_form.images = await compile_image_blobs();
						const response = await add_product(
							add_product_form.product_brand,
							add_product_form.item_name,
							add_product_form.description,
							add_product_form.product_type,
							add_product_form.unit_cost,
							add_product_form.unit_price,
							add_product_form.images,
							add_product_form.stock
						);
						if (response == 200) {
							toast.success('Action success', {
								description: add_product_form.item_name + ' has been added to the inventory.'
							});
							addProductDialog = false;
							clearForm();
							reload_product_list();
						} else {
							toast.error('Action failed', {
								description: 'An error occured in the server.'
							});
						}
					} else {
						toast.error('Action failed', {
							description: formValid(add_product_form).msg
						});
					}
				}}>Add to inventory</Button
			>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root open={updateStockDialog} closeOnEscape={true}>
	<Dialog.Content>
		<Dialog.Header class="pt-4">
			<Dialog.Title>Add/Sell/Outgoing stock from {stock_product_form.item_name}</Dialog.Title>
		</Dialog.Header>
		<div class="grid gap-2 pt-8">
			<div class="flex flex-row items-center gap-4">
				<Label for="name" class="min-w-max">Current Available Stock:</Label>
				<Input
					id="name"
					value={stock_product_form.stock}
					class="pointer-events-none w-min disabled:opacity-100"
					disabled
				/>
			</div>
		</div>
		<div class="flex w-full">
			<Tabs.Root class="w-max" bind:value={tab_value}>
				<Tabs.List>
					<Tabs.Trigger value="add">Add stock</Tabs.Trigger>
					<Tabs.Trigger value="remove">Sell stock</Tabs.Trigger>
					<Tabs.Trigger value="outgoing">Outgoing</Tabs.Trigger>
				</Tabs.List>
				<Tabs.Content value="add">
					<div class="ml-1 mt-4 flex flex-row items-center gap-4">
						<Label for="name" class="min-w-max">Add Quantity:</Label>
						<Input
							id="name"
							bind:value={stock_count}
							type="number"
							class="w-min"
							on:blur={() => {
								stock_count = parseInt(stock_count.toString());
								if (stock_count < 0 || isNaN(stock_count) || stock_count == null) {
									toast.error('Number error', {
										description: 'The number you entered is not valid.'
									});
									stock_count = 0;
								}
							}}
						/>
					</div>
				</Tabs.Content>
				<Tabs.Content value="remove">
					<div class="ml-1 mt-4 flex flex-col gap-4">
						<div class="flex flex-row items-center justify-between gap-4">
							<Label for="name" class="min-w-max">Unit Price:</Label>
							<div class="flex flex-row items-center justify-between gap-2">
								<span class="font-bold">PHP</span>
								<Input value={stock_product_form.unit_price} class="pointer-events-none" tabindex={-1} />
							</div>
						</div>

						<div class="flex flex-row items-center justify-between gap-4">
							<Label for="name" class="min-w">Sell Quantity:</Label>
							<Input
								id="name"
								bind:value={stock_count}
								type="number"
								class="w-min"
								on:change={() => {
									calculate_receipt(stock_product_form.discount);
								}}
								on:blur={() => {
									stock_count = parseInt(stock_count.toString());
									if (stock_count < 0 || isNaN(stock_count) || stock_count == null) {
										toast.error('Number error', {
											description: 'The number you entered is not valid.'
										});
										stock_count = 0;
									}
									if (stock_count > stock_product_form.stock) {
										toast.error('Number error', {
											description: 'Stock to be removed exceeds current stock.'
										});
										stock_count = stock_product_form.stock;
									}
								}}
							/>
						</div>
						<div class="flex flex-row items-center justify-between gap-4">
							<Label for="name" class="min-w-max">Apply Discount:</Label>
							<div class="flex flex-row items-center justify-between gap-2">
								<span class="font-bold">%</span>
								<Input
									bind:value={stock_product_form.discount}
									type="number"
									on:change={() => {
										calculate_receipt(stock_product_form.discount);
									}}
									on:blur={() => {
										let discount = stock_product_form.discount;
										if (discount < 0 || isNaN(discount) || discount == null || discount > 100) {
											toast.error('Number error', {
												description: 'The discount percentage you entered is not valid.'
											});
											stock_product_form.discount = 0;
										}
									}}
								/>
							</div>
						</div>
						<div class="flex flex-row items-center justify-between gap-4">
							<Label for="name" class="min-w-max">Price discount:</Label>
							<div class="flex flex-row items-center justify-between gap-2">
								<span class="font-bold">PHP</span>
								<Input
									value={(stock_product_form.unit_price * stock_count) - stock_product_form.total_price}
									type="number"
									class="pointer-events-none"
									tabindex={-1}
								/>
							</div>
						</div>
						<hr>
						<div class="flex flex-row items-center justify-between gap-4">
							<Label for="name" class="min-w-max">Total Price:</Label>
							<div class="flex flex-row items-center justify-between gap-2">
								<span class="font-bold">PHP</span>
								<Input
									bind:value={stock_product_form.total_price}
									type="number"
									class="pointer-events-none"
									tabindex={-1}
								/>
							</div>
						</div>
					</div>
				</Tabs.Content>
				<Tabs.Content value="outgoing">
					<div class="ml-1 mt-4 flex flex-col gap-4">
						<div class="flex flex-row items-center justify-between gap-4">
							<Label for="name" class="min-w-max">Outgoing quantity:</Label>
							<Input
								id="name"
								bind:value={stock_count}
								type="number"
								class="w-min"
								on:blur={() => {
									stock_count = parseInt(stock_count.toString());
									if (stock_count < 0 || isNaN(stock_count) || stock_count == null) {
										toast.error('Number error', {
											description: 'The number you entered is not valid.'
										});
										stock_count = 0;
									}
									if (stock_count > stock_product_form.stock) {
										toast.error('Number error', {
											description: 'Stock to be removed exceeds current stock.'
										});
										stock_count = stock_product_form.stock;
									}
								}}
							/>
						</div>
						<div class="flex min-w-max flex-row items-center justify-between gap-4">
							<Label for="" class="min-w-max">Reason:</Label>
							<div class="flex flex-row items-center gap-2">
								<Input id="" bind:value={outgoing_form.reason} class="w-min" />
								<DropdownMenu.Root>
									<DropdownMenu.Trigger>
										<Button variant="outline">...</Button>
									</DropdownMenu.Trigger>
									<DropdownMenu.Content>
										<DropdownMenu.Group>
											{#each reason_list as reason}
												<DropdownMenu.Item
													on:click={() => {
														outgoing_form.reason = reason;
													}}>{reason}</DropdownMenu.Item
												>
											{/each}
										</DropdownMenu.Group>
									</DropdownMenu.Content>
								</DropdownMenu.Root>
							</div>
						</div>
						{#if outgoing_form.reason == reason_list[0]}
							<div class="flex flex-row items-center justify-between gap-4">
								<Label for="" class="min-w-max">Recipient:</Label>
								<div class="flex flex-row items-center gap-2">
									<Input id="" bind:value={outgoing_form.recipient} class="w-min" />
								</div>
							</div>
						{/if}
					</div>
				</Tabs.Content>
			</Tabs.Root>
		</div>
		<Dialog.Footer>
			<Button
				on:click={async () => {
					if (stock_count > 0) {
						const response = await update_stock(
							stock_product_form.id,
							stock_product_form.item_name,
							stock_product_form.stock,
							tab_value,
							stock_count,
							outgoing_form,
							stock_product_form.discount
						);
						if (response == 200) {
							toast.success('Action success', {
								description: stock_product_form.item_name + ' stock has been updated.'
							});
							updateStockDialog = false;
							stock_count = 0;
							reload_product_list();
						} else {
							toast.error('Action failed', {
								description: 'An error occured in the server.'
							});
						}
					} else {
						toast.error('Action failed', {
							description: 'Value must be greater than 0.'
						});
					}
				}}>Update stock</Button
			>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root open={deleteDialog} closeOnEscape={true}>
	<Dialog.Content class="flex flex-col items-center justify-center gap-8">
		<Dialog.Header class="text-cente pt-4">
			<Dialog.Title
				>Are you sure you want to delete this <span class="font-bold text-red-500"
					>{delete_item_name}</span
				></Dialog.Title
			>
		</Dialog.Header>
		<Dialog.Footer>
			<Button
				variant="outline"
				class="text-red-500"
				on:click={async () => {
					const response = await delete_product(delete_product_id);
					if (response == 200) {
						toast.success('Action success', {
							description: delete_item_name + ' has been deleted from the inventory.'
						});
						deleteDialog = false;
						delete_product_id = 0;
						delete_item_name = '';
						reload_product_list();
					} else {
						toast.error('Action failed', {
							description: 'An error occured in the server.'
						});
					}
				}}>Yes, delete product</Button
			>
			<Button
				variant="outline"
				on:click={() => {
					deleteDialog = false;
				}}>No, cancel this action</Button
			>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root open={image_modal} closeOnEscape={true}>
	<Dialog.Content class="flex flex-col items-center justify-center gap-8">
		<Dialog.Header class="pt-4 text-center">
			<Dialog.Title>Show Images</Dialog.Title>
		</Dialog.Header>
		<Carousel.Root
			opts={{
				align: 'start'
			}}
			class="w-full max-w-sm"
		>
			<Carousel.Content>
				{#if image_carousel_list.length > 0}
					{#each image_carousel_list as image, i}
						<Carousel.Item>
							<div class="p-1">
								<Card.Root>
									<Card.Content class="flex aspect-square items-center justify-center p-6">
										<img src="data:image/png;base64,{image.encoded}" alt="" srcset="" />
									</Card.Content>
								</Card.Root>
							</div>
						</Carousel.Item>
					{/each}
				{/if}
			</Carousel.Content>
			<Carousel.Previous />
			<Carousel.Next />
		</Carousel.Root>
		<Dialog.Footer>
			<Button
				variant="outline"
				on:click={() => {
					image_modal = false;
				}}>Close</Button
			>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<Toaster />
