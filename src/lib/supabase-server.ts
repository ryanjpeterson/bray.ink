import { createServerClient } from '@supabase/ssr';
import { PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { env } from '$env/dynamic/private';
import { createClient } from '@supabase/supabase-js';
import type { RequestEvent } from '@sveltejs/kit';

// SUPABASE_URL is read at runtime so Docker can supply http://kong:8000 without a rebuild.
// Falls back to PUBLIC_SUPABASE_URL if SUPABASE_URL is not set (local dev without Docker).
const supabaseUrl = () => env.SUPABASE_URL ?? env.PUBLIC_SUPABASE_URL ?? 'http://localhost:8000';

export function createSupabaseServerClient(event: RequestEvent) {
	return createServerClient(supabaseUrl(), PUBLIC_SUPABASE_ANON_KEY, {
		cookies: {
			getAll() {
				return event.cookies.getAll();
			},
			setAll(cookiesToSet) {
				cookiesToSet.forEach(({ name, value, options }) =>
					event.cookies.set(name, value, { ...options, path: '/' })
				);
			}
		}
	});
}

export function createSupabaseAdminClient() {
	return createClient(supabaseUrl(), env.SUPABASE_SERVICE_ROLE_KEY ?? '', {
		auth: { persistSession: false }
	});
}
