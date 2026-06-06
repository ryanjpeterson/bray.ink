import { json } from '@sveltejs/kit';
import { createSupabaseAdminClient } from '$lib/supabase-server';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const form = await request.formData();
	const name = (form.get('name') as string)?.trim();
	const email = (form.get('email') as string)?.trim();
	const message = (form.get('message') as string)?.trim();

	if (!name || !email || !message) {
		return json({ error: 'Missing fields' }, { status: 400 });
	}

	const supabase = createSupabaseAdminClient();
	const { error } = await supabase.from('submissions').insert({ name, email, message });

	if (error) {
		console.error('Submission insert error:', error);
		return json({ error: 'Failed to save submission' }, { status: 500 });
	}

	return json({ ok: true });
};
