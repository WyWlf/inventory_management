export async function add_staff(username: string, full_name: string | null, address: string | null, phone_number: number | null, password: string) {
    const res = await fetch('/api/add_staff', {
        method: 'POST',
        body: JSON.stringify({
            username,
            full_name,
            address,
            phone_number,
            password
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const response = await res.json();
    return response
}

export async function get_staff_list(search: string) {
    const res = await fetch('/api/get_staffs', {
        method: 'POST',
        body: JSON.stringify({
            search
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const response = await res.json();
    return response.data
}

export async function update_staff(id: number, username: string, full_name: string | null, address: string | null, phone_number: number | null, password: string) {
    const res = await fetch('/api/update_staff', {
        method: 'POST',
        body: JSON.stringify({
            id,
            username,
            full_name,
            address,
            phone_number,
            password
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const response = await res.json();
    return response
}

export async function delete_staff(id: number) {
    const res = await fetch('/api/delete_staff', {
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