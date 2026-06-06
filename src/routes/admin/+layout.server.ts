import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals: { safeGetSession }, url }) => {
	const { session } = await safeGetSession();
	if (!session && url.pathname !== '/admin/login') {
		redirect(303, '/admin/login');
	}
	return { session };
};
