import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async () => {
	const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

	const { data: tokenRow, error } = await supabase
		.from('instagram_token')
		.select('token, expires_at')
		.single();

	if (error || !tokenRow) {
		console.error('No Instagram token found:', error);
		return new Response('No token', { status: 404 });
	}

	// Refresh via Instagram Basic Display API
	const refreshRes = await fetch(
		`https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${tokenRow.token}`
	);

	if (!refreshRes.ok) {
		const err = await refreshRes.text();
		console.error('Instagram refresh failed:', err);
		return new Response('Refresh failed', { status: 500 });
	}

	const refreshData = await refreshRes.json();
	const newToken = refreshData.access_token;
	const expiresIn = refreshData.expires_in; // seconds

	const newExpiry = new Date(Date.now() + expiresIn * 1000).toISOString();

	await supabase
		.from('instagram_token')
		.update({ token: newToken, expires_at: newExpiry, updated_at: new Date().toISOString() })
		.eq('id', tokenRow.id ?? 1);

	// Also refresh the cached posts
	const postsRes = await fetch(
		`https://graph.instagram.com/me/media?fields=id,media_url,permalink,media_type,caption,timestamp&limit=12&access_token=${newToken}`
	);

	if (postsRes.ok) {
		const postsData = await postsRes.json();
		const posts = (postsData.data ?? []).filter((p: { media_type: string }) => p.media_type !== 'VIDEO');

		await supabase.from('instagram_posts_cache').delete().neq('id', '');
		if (posts.length > 0) {
			await supabase.from('instagram_posts_cache').insert(posts);
		}
	}

	return new Response(JSON.stringify({ ok: true, expires_at: newExpiry }), {
		headers: { 'Content-Type': 'application/json' }
	});
});
