export async function add_product(brand: string, product_name: string, description: string, product_type: string, unit_cost: number, unit_price: number, images: string, stock: number) {
    const res = await fetch('/api/add_product', {
        method: 'POST',
        body: JSON.stringify({
            brand,
            product_name,
            description,
            product_type,
            unit_cost,
            unit_price,
            images,
            stock
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const response = await res.json();
    return response.status
}

export async function get_products(search: string) {
    const res = await fetch('/api/get_products', {
        method: 'POST',
        body: JSON.stringify({
            search
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const response = await res.json();
    return response
}

export async function update_product(brand: string, id: number, item_name: string, description: string, product_type: string, unit_cost: number, unit_price: number, images: string) {
    const res = await fetch('/api/update_product', {
        method: 'POST',
        body: JSON.stringify({
            brand,
            id,
            item_name,
            description,
            product_type,
            unit_cost,
            unit_price,
            images
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const response = await res.json();
    return response.status
}

export async function update_stock(id: number, item_name: string, stock: number, action: string, value: number, outgoing_form: { reason: string, recipient: string }, discount: number) {
    let new_stock_value = 0;

    async function create_transaction() {
        const transaction = await fetch('/api/sale_transaction', {
            method: 'POST',
            body: JSON.stringify({
                id,
                value,
                discount
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const response = await transaction.json();
        return response.status
    }

    switch (action) {
        case 'add':
            new_stock_value = stock + value
            break;
        case 'remove':
            const res = await create_transaction()
            if (res == 200) {
                new_stock_value = stock - value
            } else {
                new_stock_value = stock
            }
            break;
        case 'outgoing':
            new_stock_value = stock - value
            break;
        default:
            new_stock_value = stock
            break;
    }

    const res = await fetch('/api/update_stock', {
        method: 'POST',
        body: JSON.stringify({
            id,
            new_stock_value,
            action,
            value,
            item_name,
            recipient: outgoing_form.recipient,
            reason: outgoing_form.reason
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const response = await res.json();
    return response.status
}

export async function delete_product(id: number) {

    const res = await fetch('/api/delete_product', {
        method: 'POST',
        body: JSON.stringify({
            id
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const response = await res.json();
    return response.status
}