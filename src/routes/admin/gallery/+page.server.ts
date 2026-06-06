import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { createSupabaseAdminClient } from '$lib/supabase-server';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';

const BUCKET = 'site-images';

function storageUrl(path: string) {
	return `${PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
}

export const load: PageServerLoad = async () => {
	const supabase = createSupabaseAdminClient();

	const { data: files } = await supabase.storage.from(BUCKET).list('', {
		sortBy: { column: 'created_at', order: 'desc' }
	});

	const images = (files ?? [])
		.filter((f) => f.name !== '.emptyFolderPlaceholder')
		.map((f) => ({
			name: f.name,
			url: storageUrl(f.name),
			size: f.metadata?.size ?? 0
		}));

	const { data: copyRows } = await supabase
		.from('copy')
		.select('key, value')
		.in('key', ['hero_image_url', 'studio_image_url']);

	const current: Record<string, string> = {};
	for (const row of copyRows ?? []) current[row.key] = row.value;

	return { images, current };
};

export const actions: Actions = {
	upload: async ({ request }) => {
		const supabase = createSupabaseAdminClient();
		const form = await request.formData();
		const file = form.get('file') as File;

		if (!file || file.size === 0) return fail(400, { error: 'No file provided.' });
		if (file.size > 10 * 1024 * 1024) return fail(400, { error: 'File too large (max 10 MB).' });

		const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
		if (!['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext))
			return fail(400, { error: 'Only jpg, png, webp, gif files are allowed.' });

		const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
		const fileName = `${Date.now()}-${safeName}`;
		const bytes = await file.arrayBuffer();

		const { error } = await supabase.storage
			.from(BUCKET)
			.upload(fileName, bytes, { contentType: file.type, upsert: false });

		if (error) return fail(500, { error: error.message });
		return { uploaded: storageUrl(fileName) };
	},

	setHero: async ({ request }) => {
		const form = await request.formData();
		const url = form.get('url') as string;
		const supabase = createSupabaseAdminClient();
		await supabase
			.from('copy')
			.upsert({ key: 'hero_image_url', value: url, updated_at: new Date().toISOString() }, { onConflict: 'key' });
		return { success: true };
	},

	setStudio: async ({ request }) => {
		const form = await request.formData();
		const url = form.get('url') as string;
		const supabase = createSupabaseAdminClient();
		await supabase
			.from('copy')
			.upsert({ key: 'studio_image_url', value: url, updated_at: new Date().toISOString() }, { onConflict: 'key' });
		return { success: true };
	},

	delete: async ({ request }) => {
		const form = await request.formData();
		const name = form.get('name') as string;
		const supabase = createSupabaseAdminClient();
		const { error } = await supabase.storage.from(BUCKET).remove([name]);
		if (error) return fail(500, { error: error.message });
		return { success: true };
	}
};
