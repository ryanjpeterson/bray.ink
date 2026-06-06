import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createSupabaseAdminClient } from '$lib/supabase-server';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';

const BUCKET = 'site-images';

export const GET: RequestHandler = async () => {
	const supabase = createSupabaseAdminClient();
	const { data: files } = await supabase.storage.from(BUCKET).list('', {
		sortBy: { column: 'created_at', order: 'desc' }
	});

	const images = (files ?? [])
		.filter((f) => f.name !== '.emptyFolderPlaceholder')
		.map((f) => ({
			name: f.name,
			url: `${PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${f.name}`
		}));

	return json(images);
};
