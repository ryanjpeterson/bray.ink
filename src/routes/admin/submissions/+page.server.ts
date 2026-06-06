import type { PageServerLoad, Actions } from './$types';
import { createSupabaseAdminClient } from '$lib/supabase-server';

export const load: PageServerLoad = async () => {
	const supabase = createSupabaseAdminClient();
	const { data } = await supabase
		.from('submissions')
		.select('*')
		.order('created_at', { ascending: false });

	return { submissions: data ?? [] };
};

export const actions: Actions = {
	markRead: async ({ request }) => {
		const form = await request.formData();
		const id = form.get('id') as string;
		const supabase = createSupabaseAdminClient();
		await supabase.from('submissions').update({ read: true }).eq('id', id);
	}
};
