import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { createSupabaseAdminClient } from '$lib/supabase-server';
import type { SiteCopy } from '$lib/types';

type FieldDef = {
	key: string;
	label: string;
	hint?: string;
	multiline?: boolean;
	type?: 'color' | 'url' | 'image';
	section: string;
};

const EDITABLE_FIELDS: FieldDef[] = [
	// Brand
	{ section: 'Brand', key: 'gradient_start', label: 'Gradient — Start Color', type: 'color' },
	{ section: 'Brand', key: 'gradient_end', label: 'Gradient — End Color', type: 'color' },
	// SEO
	{ section: 'SEO', key: 'meta_title', label: 'Page Title (browser tab & Google)' },
	{ section: 'SEO', key: 'meta_description', label: 'Meta Description', multiline: true },
	// Hero
	{ section: 'Hero', key: 'hero_booking_status', label: 'Booking Status Badge' },
	{ section: 'Hero', key: 'hero_tagline', label: 'Tagline' },
	{ section: 'Hero', key: 'hero_cta', label: 'CTA Button Text' },
	{ section: 'Hero', key: 'hero_image_url', label: 'Background Photo', type: 'image' },
	// The Shop
	{ section: 'The Shop', key: 'about_p1', label: 'About — Paragraph 1', multiline: true },
	{ section: 'The Shop', key: 'about_p2', label: 'About — Paragraph 2', multiline: true },
	{ section: 'The Shop', key: 'about_p3', label: 'About — Paragraph 3', multiline: true },
	{ section: 'The Shop', key: 'studio_chip_1', label: 'Studio Tag 1' },
	{ section: 'The Shop', key: 'studio_chip_2', label: 'Studio Tag 2' },
	{ section: 'The Shop', key: 'studio_chip_3', label: 'Studio Tag 3' },
	{ section: 'The Shop', key: 'studio_image_url', label: 'Studio Photo', type: 'image' },
	// Contact
	{ section: 'Contact', key: 'contact_location', label: 'Location Text' },
	{ section: 'Contact', key: 'contact_location_url', label: 'Google Maps URL', type: 'url' },
	{ section: 'Contact', key: 'contact_phone', label: 'Phone Number' },
	{ section: 'Contact', key: 'contact_email', label: 'Email Address' },
	{ section: 'Contact', key: 'booking_note_1', label: 'Booking Instructions', multiline: true },
	{ section: 'Contact', key: 'booking_note_2', label: 'Age / ID Notice', multiline: true },
	// Social
	{ section: 'Social', key: 'instagram_handle', label: 'Instagram Handle (without @)' },
	{ section: 'Social', key: 'footer_location', label: 'Footer Location Line' }
];

export const load: PageServerLoad = async () => {
	const supabase = createSupabaseAdminClient();
	const { data } = await supabase.from('copy').select('key, value');

	const copy: SiteCopy = {};
	if (data) {
		for (const row of data) copy[row.key] = row.value;
	}

	return { copy, fields: EDITABLE_FIELDS };
};

export const actions: Actions = {
	save: async ({ request }) => {
		const form = await request.formData();
		const supabase = createSupabaseAdminClient();

		const upserts = EDITABLE_FIELDS.map(({ key }) => ({
			key,
			value: (form.get(key) as string)?.trim() ?? '',
			updated_at: new Date().toISOString()
		}));

		const { error } = await supabase.from('copy').upsert(upserts, { onConflict: 'key' });

		if (error) return fail(500, { error: 'Failed to save. Please try again.' });
		return { success: true };
	}
};
