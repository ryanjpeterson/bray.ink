import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;
const BOOKING_FORWARD_TO = Deno.env.get('BOOKING_FORWARD_TO')!;
const BOOKING_FROM_EMAIL = Deno.env.get('BOOKING_FROM_EMAIL') ?? 'bookings@bray.ink';

serve(async (req) => {
	const payload = await req.json();
	const record = payload.record;

	if (!record) return new Response('No record', { status: 400 });

	const html = `
    <h2>New Booking Request</h2>
    <p><strong>Name:</strong> ${record.name}</p>
    <p><strong>Email:</strong> <a href="mailto:${record.email}">${record.email}</a></p>
    <p><strong>Message:</strong></p>
    <blockquote style="border-left:3px solid #00c6ff;padding-left:1em;color:#555">${record.message.replace(/\n/g, '<br>')}</blockquote>
    <hr>
    <p style="font-size:0.8em;color:#888">Submitted at ${new Date(record.created_at).toLocaleString('en-CA')}</p>
  `;

	const res = await fetch('https://api.resend.com/emails', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${RESEND_API_KEY}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			from: `bray.ink Bookings <${BOOKING_FROM_EMAIL}>`,
			to: [BOOKING_FORWARD_TO],
			reply_to: record.email,
			subject: `New booking request from ${record.name}`,
			html
		})
	});

	if (!res.ok) {
		const err = await res.text();
		console.error('Resend error:', err);
		return new Response('Email send failed', { status: 500 });
	}

	return new Response('OK', { status: 200 });
});
