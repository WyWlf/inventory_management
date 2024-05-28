
export async function update_account_information(full_name: string, phone_number: string, address: string, old_password: string, new_password: string, change_pass: boolean) {
    const res = await fetch('/api/update_self_account', {
        method: 'POST',
        body: JSON.stringify({
            full_name,
            phone_number,
            address,
            old_password,
            new_password,
            change_pass
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const response = await res.json();
    return response
}