
export async function get_outgoing_history(search: string, start_date: string, end_date: string, filter: string) {
    const res = await fetch('/api/get_outgoing', {
        method: 'POST',
        body: JSON.stringify({
            search,
            start_date,
            end_date,
            filter
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const response = await res.json();
    return response.data
}