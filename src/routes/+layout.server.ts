import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals: { safeGetSession, supabase } }) => {
	const [{ session }, { data: gradData }] = await Promise.all([
		safeGetSession(),
		supabase.from('copy').select('key, value').in('key', ['gradient_start', 'gradient_end'])
	]);

	const gradientStart = gradData?.find((r) => r.key === 'gradient_start')?.value ?? '#00c6ff';
	const gradientEnd = gradData?.find((r) => r.key === 'gradient_end')?.value ?? '#ff007f';

	return { session, gradientStart, gradientEnd };
};
