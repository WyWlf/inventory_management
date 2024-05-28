export async function log_in(username: string, password: string) {
    const res = await fetch('/api/login', {
        method: 'POST',
        body: JSON.stringify({
            username,
            password
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const response = await res.json();
    return response
}