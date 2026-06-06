import type { PageServerLoad } from './$types';
import type { SiteCopy, InstagramPost } from '$lib/types';

const FALLBACK_COPY: SiteCopy = {
	// SEO
	meta_title: 'bray.ink | Tattoo Studio in Alliston, ON',
	meta_description: 'Custom fine line and blackwork tattooing in Alliston, ON. Appointment-only private studio specializing in anime, illustrative, and pop-culture tattoos.',
	// Hero
	hero_booking_status: 'Now booking for June/July 2026',
	hero_tagline: 'Custom Fine Line & Blackwork Tattooing',
	hero_cta: 'Contact',
	hero_image_url: '/assets/brayden.jpg',
	// The Shop
	about_p1: 'Located in Alliston, ON, <strong>bray.ink</strong> is an appointment-only private space specializing in illustrative art, bold stencils, clean fine lines, and vibrant custom pop-culture tattooing.',
	about_p2: 'Whether you are looking for a highly detailed anime piece, a sharp blackwork design, or custom nostalgic illustration, every canvas receives a unique, meticulously designed piece built to last.',
	about_p3: 'We work in a relaxed, ultra-hygienic private atmosphere designed to make your session as comfortable and creative as possible.',
	studio_chip_1: 'Appointment Only',
	studio_chip_2: 'Private Studio',
	studio_chip_3: 'Alliston, ON',
	studio_image_url: 'https://images.unsplash.com/photo-1671750145942-da9fed292290?q=80&w=2070',
	// Contact
	contact_location: '36 Victoria St W, Alliston, ON',
	contact_location_url: 'https://www.google.ca/maps/place/Bray.ink/@44.1539348,-79.8729879,17z',
	contact_phone: '(289) 970-1828',
	contact_email: 'brayinktats@gmail.com',
	booking_note_1: 'To submit a booking request, please provide your design idea (any reference characters, anime series, or elements), desired size in inches, placement on the body, and preferred dates.',
	booking_note_2: 'We only tattoo clients 18+ with valid ID. Make sure to come rested, hydrated, and ready for clean lines.',
	// Social / Footer
	instagram_handle: 'bray.ink',
	footer_location: '36 Victoria St W — Alliston, ON',
	// Brand
	gradient_start: '#00c6ff',
	gradient_end: '#ff007f'
};

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
	const [copyResult, instagramResult] = await Promise.all([
		supabase.from('copy').select('key, value'),
		supabase.from('instagram_posts_cache').select('*').order('timestamp', { ascending: false }).limit(12)
	]);

	const copy: SiteCopy = { ...FALLBACK_COPY };
	if (copyResult.data) {
		for (const row of copyResult.data) {
			copy[row.key] = row.value;
		}
	}

	const posts: InstagramPost[] = instagramResult.data ?? [];

	return { copy, posts };
};
