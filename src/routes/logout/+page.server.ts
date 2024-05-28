import { redirect } from '@sveltejs/kit';
import { logger } from '$lib/connection'
import type { PageServerLoad } from './$types';

export const load = (async ({ cookies }) => {
    logger(cookies.get('username')!, `${cookies.get('username')} has logged out of the system`)
    cookies.delete('id', { path: '/' })
    cookies.delete('token', { path: '/' })
    cookies.delete('username', { path: '/' })
    redirect(308, '/')
}) satisfies PageServerLoad;