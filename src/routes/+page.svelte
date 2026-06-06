<script lang="ts">
	import type { PageData } from './$types';
	import type { InstagramPost } from '$lib/types';

	let { data }: { data: PageData } = $props();

	let lightboxSrc = $state('');
	let lightboxOpen = $state(false);
	let formStatus = $state<'idle' | 'submitting' | 'success' | 'error'>('idle');
	let formMessage = $state('');
	let mobileMenuOpen = $state(false);

	function closeMenu() { mobileMenuOpen = false; }

	function openLightbox(src: string) {
		lightboxSrc = src;
		lightboxOpen = true;
	}

	function closeLightbox() {
		lightboxOpen = false;
	}

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		formStatus = 'submitting';
		const form = e.target as HTMLFormElement;
		const body = new FormData(form);
		const res = await fetch('/api/submit', { method: 'POST', body });
		if (res.ok) {
			formStatus = 'success';
			formMessage = "Your request has been submitted! We'll be in touch soon.";
			form.reset();
		} else {
			formStatus = 'error';
			formMessage = 'Something went wrong. Please try again or email us directly.';
		}
	}
</script>

<svelte:head>
	<title>{data.copy.meta_title}</title>
	<meta name="description" content={data.copy.meta_description} />
	<meta property="og:title" content={data.copy.meta_title} />
	<meta property="og:description" content={data.copy.meta_description} />
	<meta property="og:type" content="website" />
	<meta name="robots" content="index, follow" />
</svelte:head>

<svg width="0" height="0" style="position:absolute">
	<defs>
		<linearGradient id="inst-grad" x1="0%" y1="0%" x2="100%" y2="100%">
			<stop offset="0%" stop-color={data.copy.gradient_start ?? '#00c6ff'} />
			<stop offset="100%" stop-color={data.copy.gradient_end ?? '#ff007f'} />
		</linearGradient>
	</defs>
</svg>

{#if lightboxOpen}
	<div
		class="lightbox"
		onclick={closeLightbox}
		onkeydown={(e) => e.key === 'Escape' && closeLightbox()}
		role="dialog"
		aria-modal="true"
		aria-label="Image preview"
		tabindex="-1"
	>
		<button class="lightbox-close" onclick={closeLightbox} aria-label="Close">✕</button>
		<img src={lightboxSrc} alt="Enlarged tattoo preview" />
	</div>
{/if}

<!-- Navigation -->
<header>
	<div class="nav-container">
		<a href="#home" class="logo">bray<span>.ink</span></a>
		<ul class="nav-links" class:open={mobileMenuOpen}>
			<li><a href="#the-work" onclick={closeMenu}>The Work</a></li>
			<li><a href="#the-shop" onclick={closeMenu}>The Shop</a></li>
			<li><a href="#contact" class="nav-cta" onclick={closeMenu}>Contact</a></li>
		</ul>
		<button
			class="hamburger"
			class:open={mobileMenuOpen}
			onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
			aria-label="Toggle navigation"
			aria-expanded={mobileMenuOpen}
		>
			<span></span>
			<span></span>
			<span></span>
		</button>
	</div>
</header>

<!-- Hero -->
<section class="hero" id="home" style="--hero-img: url('{data.copy.hero_image_url ?? '/assets/brayden.jpg'}')">
	<div class="hero-content">
		<div class="hero-badge">{data.copy.hero_booking_status}</div>
		<h1>bray<span>.ink</span></h1>
		<p class="hero-tagline">{data.copy.hero_tagline}</p>
		<a href="#contact" class="btn">Contact</a>
	</div>
</section>

<!-- The Work -->
<section id="the-work">
	<h2 class="section-title">The Work</h2>

	<div class="gallery-grid">
		{#if data.posts.length > 0}
			{#each data.posts as post (post.id)}
				<button
					class="gallery-item"
					onclick={() => openLightbox(post.media_url)}
					aria-label="View tattoo image"
				>
					<img src={post.media_url} alt={post.caption ?? 'Tattoo by bray.ink'} loading="lazy" />
					<div class="gallery-overlay" aria-hidden="true">
						<svg viewBox="0 0 24 24" aria-hidden="true">
							<path fill="url(#inst-grad)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
						</svg>
					</div>
				</button>
			{/each}
		{:else}
			{#each Array.from({length: 8}, (_, i) => i + 1) as n}
				<button
					class="gallery-item"
					onclick={() => openLightbox(`/assets/tattoo${n}.jpg`)}
					aria-label="View tattoo image"
				>
					<img src={`/assets/tattoo${n}.jpg`} alt="Tattoo by bray.ink" loading="lazy" />
					<div class="gallery-overlay" aria-hidden="true">
						<svg viewBox="0 0 24 24" aria-hidden="true">
							<path fill="url(#inst-grad)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
						</svg>
					</div>
				</button>
			{/each}
		{/if}
	</div>

	<div class="gallery-footer">
		<a href="https://instagram.com/{data.copy.instagram_handle}" target="_blank" rel="noopener noreferrer" class="instagram-link">
			<svg viewBox="0 0 24 24" aria-hidden="true">
				<path fill="url(#inst-grad)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
			</svg>
			<span>Follow <strong>@{data.copy.instagram_handle}</strong> for more</span>
		</a>
	</div>
</section>

<!-- The Shop -->
<section id="the-shop" class="about-section">
	<h2 class="section-title">The Shop</h2>
	<div class="about-content">
		<div class="about-text">
			<p>{@html data.copy.about_p1}</p>
			<p>{@html data.copy.about_p2}</p>
			<p>{@html data.copy.about_p3}</p>
			<ul class="studio-chips">
				<li>{data.copy.studio_chip_1}</li>
				<li>{data.copy.studio_chip_2}</li>
				<li>{data.copy.studio_chip_3}</li>
			</ul>
		</div>
		<div class="about-image">
			<img
				src={data.copy.studio_image_url}
				alt="bray.ink tattoo studio in Alliston, ON"
				loading="lazy"
			/>
		</div>
	</div>
</section>

<!-- Contact -->
<section id="contact" class="book-section">
	<h2 class="section-title">Contact</h2>
	<div class="contact-container">
		<div class="contact-info">
			<div class="contact-details">
				<a
					class="contact-item"
					href={data.copy.contact_location_url}
					target="_blank"
					rel="noopener noreferrer"
				>
					<span class="contact-icon">
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
							<path d="M12 21c-4-4-8-7.5-8-12a8 8 0 1116 0c0 4.5-4 8-8 12z"/>
							<circle cx="12" cy="9" r="2.5"/>
						</svg>
					</span>
					<span class="contact-text">
						<strong>Location</strong>
						{data.copy.contact_location}
					</span>
				</a>
				<a class="contact-item" href="tel:{data.copy.contact_phone?.replace(/\D/g, '')}">
					<span class="contact-icon">
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
							<path d="M6.6 10.8a15.2 15.2 0 006.6 6.6l2.2-2.2a1 1 0 011-.25 11.4 11.4 0 003.57.57 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1 11.4 11.4 0 00.57 3.57 1 1 0 01-.25 1z"/>
						</svg>
					</span>
					<span class="contact-text">
						<strong>Phone</strong>
						{data.copy.contact_phone}
					</span>
				</a>
				<a class="contact-item" href="mailto:{data.copy.contact_email}">
					<span class="contact-icon">
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
							<rect x="2" y="4" width="20" height="16" rx="2"/>
							<path d="M2 7l10 7 10-7"/>
						</svg>
					</span>
					<span class="contact-text">
						<strong>Email</strong>
						{data.copy.contact_email}
					</span>
				</a>
			</div>

			<div class="booking-notes">
				<p>{@html data.copy.booking_note_1}</p>
				<p class="note-highlight"><strong>Note:</strong> {@html data.copy.booking_note_2}</p>
			</div>
		</div>

		<form class="booking-form" onsubmit={handleSubmit}>
			<div class="form-group">
				<label for="name">Your Name</label>
				<input id="name" type="text" name="name" placeholder="John Smith" required />
			</div>
			<div class="form-group">
				<label for="email">Email Address</label>
				<input id="email" type="email" name="email" placeholder="you@example.com" required />
			</div>
			<div class="form-group">
				<label for="message">Your Concept</label>
				<textarea
					id="message"
					name="message"
					rows={5}
					placeholder="Describe your idea — style, size, placement, reference images..."
					required
				></textarea>
			</div>
			{#if formStatus === 'success'}
				<p class="form-success">{formMessage}</p>
			{:else if formStatus === 'error'}
				<p class="form-error">{formMessage}</p>
			{/if}
			<button type="submit" class="btn" disabled={formStatus === 'submitting'}>
				{formStatus === 'submitting' ? 'Sending...' : 'Submit Request'}
			</button>
		</form>
	</div>
</section>

<!-- Footer -->
<footer>
	<div class="footer-inner">
		<a href="#home" class="footer-logo">bray<span>.ink</span></a>
		<p class="footer-location">{data.copy.footer_location}</p>
		<a href="https://instagram.com/{data.copy.instagram_handle}" class="footer-instagram" target="_blank" rel="noopener noreferrer">@{data.copy.instagram_handle}</a>
		<p class="footer-copy">&copy; {new Date().getFullYear()} bray.ink. All rights reserved.</p>
	</div>
</footer>

<style>
	/* ── Header ──────────────────────────────────────────────────────────── */
	header {
		position: fixed;
		top: 0;
		width: 100%;
		z-index: 1000;
		background: rgba(6, 6, 8, 0.8);
		backdrop-filter: blur(16px);
		-webkit-backdrop-filter: blur(16px);
		border-bottom: 1px solid rgba(255, 255, 255, 0.05);
	}

	.nav-container {
		max-width: 1200px;
		margin: 0 auto;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1.25rem 2rem;
	}

	.logo {
		font-family: var(--font-gothic);
		font-size: 1.8rem;
		font-weight: 400;
		letter-spacing: 1px;
		text-decoration: none;
		color: var(--text-color);
		transition: opacity 0.3s;
	}

	.logo:hover { opacity: 0.85; }

	.logo span {
		background: var(--accent-grad);
		-webkit-background-clip: text;
		background-clip: text;
		-webkit-text-fill-color: transparent;
	}

	.nav-links {
		display: flex;
		align-items: center;
		gap: 2.5rem;
		list-style: none;
	}

	.nav-links a {
		text-decoration: none;
		color: var(--text-muted);
		font-size: 0.8rem;
		font-weight: 600;
		letter-spacing: 1.5px;
		text-transform: uppercase;
		transition: color 0.25s ease;
		position: relative;
	}

	.nav-links a:not(.nav-cta)::after {
		content: '';
		position: absolute;
		bottom: -5px;
		left: 0;
		width: 0;
		height: 1.5px;
		background: var(--accent-grad);
		transition: width 0.25s ease;
	}

	.nav-links a:not(.nav-cta):hover { color: var(--text-color); }
	.nav-links a:not(.nav-cta):hover::after { width: 100%; }

	.nav-cta {
		background: var(--accent-grad);
		color: #fff !important;
		-webkit-text-fill-color: #fff;
		border: none;
		padding: 0.45rem 1.1rem;
		border-radius: 50px;
		box-shadow: 0 2px 12px rgba(0, 198, 255, 0.25), 0 2px 12px rgba(255, 0, 127, 0.15);
		transition: box-shadow 0.25s, transform 0.2s !important;
	}

	.nav-cta:hover {
		box-shadow: 0 4px 20px rgba(0, 198, 255, 0.45), 0 4px 20px rgba(255, 0, 127, 0.3) !important;
		transform: translateY(-1px);
	}

	/* ── Hamburger ────────────────────────────────────────────────────────── */
	.hamburger {
		display: none;
		flex-direction: column;
		justify-content: center;
		gap: 5px;
		width: 36px;
		height: 36px;
		background: none;
		border: none;
		cursor: pointer;
		padding: 0;
		flex-shrink: 0;
	}

	.hamburger span {
		display: block;
		width: 22px;
		height: 2px;
		background: var(--text-color);
		border-radius: 2px;
		transition: transform 0.25s ease, opacity 0.25s ease;
	}

	.hamburger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
	.hamburger.open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
	.hamburger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

	/* ── Hero ─────────────────────────────────────────────────────────────── */
	section {
		padding: 8rem 2rem;
		max-width: 1200px;
		margin: 0 auto;
	}

	.hero {
		max-width: none;
		width: 100%;
		margin: 0;
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		padding: 0 2rem;
		position: relative;
		background:
			radial-gradient(ellipse at center top, rgba(0, 198, 255, 0.06) 0%, transparent 60%),
			radial-gradient(ellipse at center bottom, rgba(255, 0, 127, 0.06) 0%, transparent 60%),
			linear-gradient(to bottom, rgba(6, 6, 8, 0.45) 0%, rgba(6, 6, 8, 0.6) 50%, rgba(6, 6, 8, 0.75) 75%, rgba(6, 6, 8, 0.9) 90%),
			var(--hero-img) no-repeat center center / cover;
	}

	.hero::after {
		content: '';
		position: absolute;
		inset: auto 0 0 0;
		height: 260px;
		background: linear-gradient(to bottom, transparent, var(--bg-color));
		pointer-events: none;
	}

	.hero-content {
		max-width: 800px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0;
		opacity: 0;
		transform: translateY(24px);
		animation: fadeIn 1.1s forwards 0.2s;
	}

	.hero-badge {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.72rem;
		font-weight: 700;
		letter-spacing: 2.5px;
		text-transform: uppercase;
		color: #4ade80;
		border: 1px solid rgba(74, 222, 128, 0.3);
		border-radius: 50px;
		padding: 0.4rem 1rem;
		margin-bottom: 1.8rem;
		background: rgba(74, 222, 128, 0.06);
	}

	.hero-badge::before {
		content: '';
		display: inline-block;
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: #4ade80;
		animation: pulse 2s infinite;
	}

	.hero h1 {
		font-family: var(--font-gothic);
		font-size: clamp(4rem, 10vw, 7rem);
		font-weight: 400;
		letter-spacing: 2px;
		margin-bottom: 1.2rem;
		line-height: 1;
		color: var(--text-color);
		filter: drop-shadow(0 4px 24px rgba(0, 0, 0, 0.6));
	}

	.hero h1 span {
		background: var(--accent-grad);
		-webkit-background-clip: text;
		background-clip: text;
		-webkit-text-fill-color: transparent;
	}

	.hero-tagline {
		font-size: 0.85rem;
		color: var(--text-muted);
		letter-spacing: 2.5px;
		text-transform: uppercase;
		margin-bottom: 2.5rem;
		font-weight: 500;
	}

	/* ── Section Title (shared) ───────────────────────────────────────────── */
	:global(.section-title) {
		font-family: var(--font-gothic);
		font-size: clamp(2rem, 5vw, 2.8rem);
		font-weight: 400;
		text-align: center;
		margin-bottom: 3.5rem;
		letter-spacing: 2px;
		text-transform: uppercase;
		color: var(--text-color);
		position: relative;
	}

	:global(.section-title)::after {
		content: '';
		display: block;
		width: 48px;
		height: 2px;
		background: var(--accent-grad);
		border-radius: 2px;
		margin: 1rem auto 0;
	}

	/* ── Work / Gallery ───────────────────────────────────────────────────── */
	.gallery-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 1rem;
	}

	.gallery-item {
		position: relative;
		aspect-ratio: 1 / 1;
		overflow: hidden;
		background: var(--card-bg);
		cursor: pointer;
		border-radius: 6px;
		border: none;
		padding: 0;
		display: block;
		transition: transform 0.3s ease, box-shadow 0.3s ease;
	}

	.gallery-item:hover {
		transform: translateY(-3px);
		box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5);
	}

	.gallery-item img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.6s cubic-bezier(0.25, 1, 0.5, 1);
		display: block;
	}

	.gallery-item:hover img { transform: scale(1.06); }

	.gallery-overlay {
		position: absolute;
		inset: 0;
		background: linear-gradient(to top, rgba(6, 6, 8, 0.7) 0%, transparent 60%);
		display: flex;
		align-items: flex-end;
		justify-content: flex-end;
		padding: 0.75rem;
		opacity: 0;
		transition: opacity 0.3s ease;
	}

	.gallery-item:hover .gallery-overlay { opacity: 1; }

	.gallery-overlay svg { width: 24px; height: 24px; }

	.gallery-footer {
		margin-top: 2.5rem;
		display: flex;
		justify-content: center;
	}

	.instagram-link {
		display: inline-flex;
		align-items: center;
		gap: 0.6rem;
		text-decoration: none;
		color: var(--text-muted);
		font-size: 0.85rem;
		font-weight: 600;
		letter-spacing: 0.5px;
		transition: color 0.25s;
		border: 1px solid rgba(255, 255, 255, 0.07);
		padding: 0.6rem 1.2rem;
		border-radius: 50px;
		background: rgba(255, 255, 255, 0.02);
	}

	.instagram-link:hover { color: var(--text-color); border-color: rgba(255,255,255,0.15); }

	.instagram-link svg { width: 18px; height: 18px; flex-shrink: 0; }

	.instagram-link strong { color: var(--text-color); }

	/* ── The Studio ───────────────────────────────────────────────────────── */
	.about-section {
		background: linear-gradient(180deg, transparent 0%, rgba(0, 198, 255, 0.02) 50%, transparent 100%);
	}

	.about-content {
		display: grid;
		grid-template-columns: 1.1fr 1fr;
		gap: 5rem;
		align-items: center;
	}

	.about-text p {
		color: var(--text-muted);
		line-height: 1.85;
		margin-bottom: 1.4rem;
		font-size: 0.95rem;
	}

	.studio-chips {
		display: flex;
		flex-wrap: wrap;
		gap: 0.6rem;
		list-style: none;
		margin-top: 2rem;
	}

	.studio-chips li {
		font-size: 0.72rem;
		font-weight: 700;
		letter-spacing: 1.5px;
		text-transform: uppercase;
		color: var(--text-muted);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 50px;
		padding: 0.35rem 0.9rem;
		background: rgba(255, 255, 255, 0.02);
	}

	.about-image {
		position: relative;
		border-radius: 10px;
		overflow: hidden;
	}

	.about-image::before {
		content: '';
		position: absolute;
		inset: -1px;
		border-radius: 11px;
		background: var(--accent-grad);
		z-index: -1;
		opacity: 0.3;
	}

	.about-image img {
		width: 100%;
		aspect-ratio: 4 / 5;
		object-fit: cover;
		display: block;
		border-radius: 10px;
	}

	/* ── Book Now ─────────────────────────────────────────────────────────── */
	.book-section {
		border-top: 1px solid rgba(255, 255, 255, 0.04);
	}

	.contact-container {
		display: grid;
		grid-template-columns: 1fr 1.1fr;
		gap: 5rem;
		align-items: start;
	}

	.contact-details {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin-bottom: 2.5rem;
	}

	.contact-item {
		display: flex;
		align-items: center;
		gap: 1rem;
		text-decoration: none;
		padding: 1rem;
		border-radius: 10px;
		border: 1px solid rgba(255, 255, 255, 0.05);
		background: rgba(255, 255, 255, 0.02);
		transition: border-color 0.25s, background 0.25s;
	}

	.contact-item:hover {
		border-color: rgba(0, 198, 255, 0.2);
		background: rgba(0, 198, 255, 0.03);
	}

	.contact-icon {
		width: 38px;
		height: 38px;
		border-radius: 8px;
		background: rgba(255, 255, 255, 0.04);
		border: 1px solid rgba(255, 255, 255, 0.07);
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		color: var(--accent-start);
	}

	.contact-icon svg { width: 16px; height: 16px; }

	.contact-text {
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
	}

	.contact-text strong {
		font-size: 0.7rem;
		font-weight: 700;
		letter-spacing: 1.5px;
		text-transform: uppercase;
		color: var(--text-muted);
	}

	.contact-text,
	.contact-text :not(strong) {
		color: var(--text-color);
		font-size: 0.9rem;
	}

	.booking-notes p {
		color: var(--text-muted);
		font-size: 0.875rem;
		line-height: 1.7;
		margin-bottom: 0.75rem;
	}

	.note-highlight {
		padding: 0.75rem 1rem;
		border-left: 2px solid color-mix(in srgb, var(--accent-start) 60%, transparent);
		background: color-mix(in srgb, var(--accent-start) 5%, transparent);
		border-radius: 0 6px 6px 0;
	}

	/* ── Form ─────────────────────────────────────────────────────────────── */
	.booking-form {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
		background: var(--card-bg);
		border: 1px solid rgba(255, 255, 255, 0.06);
		border-radius: 14px;
		padding: 2rem;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}

	label {
		font-size: 0.72rem;
		font-weight: 700;
		letter-spacing: 1.5px;
		text-transform: uppercase;
		color: var(--text-muted);
	}

	.form-group input,
	.form-group textarea {
		width: 100%;
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid rgba(255, 255, 255, 0.08);
		padding: 0.85rem 1rem;
		color: var(--text-color);
		border-radius: 8px;
		font-family: var(--font-main);
		font-size: 0.9rem;
		transition: border-color 0.25s, box-shadow 0.25s;
	}

	.form-group textarea { resize: vertical; min-height: 130px; }

	.form-group input:focus,
	.form-group textarea:focus {
		outline: none;
		border-color: rgba(0, 198, 255, 0.5);
		box-shadow: 0 0 0 3px rgba(0, 198, 255, 0.06);
	}

	.form-group input::placeholder,
	.form-group textarea::placeholder {
		color: rgba(142, 142, 156, 0.5);
	}

	.form-success {
		color: #4ade80;
		font-size: 0.875rem;
		background: rgba(74, 222, 128, 0.06);
		border: 1px solid rgba(74, 222, 128, 0.2);
		padding: 0.75rem 1rem;
		border-radius: 8px;
	}

	.form-error {
		color: #f87171;
		font-size: 0.875rem;
		background: rgba(248, 113, 113, 0.06);
		border: 1px solid rgba(248, 113, 113, 0.2);
		padding: 0.75rem 1rem;
		border-radius: 8px;
	}

	/* ── Footer ───────────────────────────────────────────────────────────── */
	footer {
		border-top: 1px solid rgba(255, 255, 255, 0.05);
		padding: 3rem 2rem;
	}

	.footer-inner {
		max-width: 1200px;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.6rem;
		text-align: center;
	}

	.footer-logo {
		font-family: var(--font-gothic);
		font-size: 1.4rem;
		text-decoration: none;
		color: var(--text-color);
		margin-bottom: 0.3rem;
	}

	.footer-logo span {
		background: var(--accent-grad);
		-webkit-background-clip: text;
		background-clip: text;
		-webkit-text-fill-color: transparent;
	}

	.footer-location {
		color: var(--text-muted);
		font-size: 0.8rem;
		letter-spacing: 0.5px;
	}

	.footer-instagram {
		font-size: 0.8rem;
		font-weight: 700;
		letter-spacing: 0.5px;
		background: var(--accent-grad);
		-webkit-background-clip: text;
		background-clip: text;
		-webkit-text-fill-color: transparent;
		text-decoration: none;
		transition: opacity 0.25s;
	}

	.footer-instagram:hover { opacity: 0.75; }

	.footer-copy {
		color: rgba(142, 142, 156, 0.4);
		font-size: 0.75rem;
		margin-top: 0.5rem;
	}

	/* ── Lightbox ─────────────────────────────────────────────────────────── */
	.lightbox {
		position: fixed;
		inset: 0;
		background: rgba(3, 3, 4, 0.97);
		z-index: 2000;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.lightbox-close {
		position: absolute;
		top: 1.5rem;
		right: 1.5rem;
		background: none;
		border: 1px solid rgba(255, 255, 255, 0.15);
		color: var(--text-muted);
		width: 36px;
		height: 36px;
		border-radius: 50%;
		cursor: pointer;
		font-size: 0.8rem;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: border-color 0.2s, color 0.2s;
	}

	.lightbox-close:hover { border-color: rgba(255,255,255,0.4); color: var(--text-color); }

	.lightbox img {
		max-width: 90%;
		max-height: 85vh;
		box-shadow: 0 0 60px rgba(0, 0, 0, 0.9);
		border-radius: 8px;
	}

	/* ── Animations ───────────────────────────────────────────────────────── */
	@keyframes pulse {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.4; }
	}

	/* ── Responsive ───────────────────────────────────────────────────────── */
	@media (max-width: 1100px) {
		.gallery-grid { grid-template-columns: repeat(3, 1fr); }
	}

	@media (max-width: 900px) {
		.about-content { grid-template-columns: 1fr; gap: 3rem; }
		.contact-container { grid-template-columns: 1fr; gap: 3rem; }
	}

	@media (max-width: 768px) {
		.gallery-grid { grid-template-columns: repeat(2, 1fr); }
		.hamburger { display: flex; }

		.nav-links {
			position: absolute;
			top: 100%;
			left: 0;
			right: 0;
			flex-direction: column;
			align-items: stretch;
			gap: 0.25rem;
			background: rgba(6, 6, 8, 0.97);
			backdrop-filter: blur(16px);
			-webkit-backdrop-filter: blur(16px);
			padding: 1rem 1.5rem 1.5rem;
			border-bottom: 1px solid rgba(255, 255, 255, 0.06);
			opacity: 0;
			transform: translateY(-6px);
			pointer-events: none;
			transition: opacity 0.2s ease, transform 0.2s ease;
		}

		.nav-links.open {
			opacity: 1;
			transform: translateY(0);
			pointer-events: auto;
		}

		.nav-links li { width: 100%; }

		.nav-links a:not(.nav-cta) {
			display: block;
			padding: 0.75rem 0;
			font-size: 0.9rem;
			border-bottom: 1px solid rgba(255, 255, 255, 0.04);
		}

		.nav-cta {
			display: block;
			margin-top: 0.75rem;
			text-align: center;
			padding: 0.75rem 1rem !important;
		}
	}

	@media (max-width: 480px) {
		.gallery-grid { grid-template-columns: repeat(2, 1fr); gap: 0.5rem; }
		.booking-form { padding: 1.25rem; }
	}
</style>
