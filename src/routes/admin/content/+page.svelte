<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let saving = $state(false);

	type FieldDef = { key: string; label: string; hint?: string; multiline?: boolean; type?: 'color' | 'url' | 'image'; section: string };

	const sections = $derived(() => {
		const map = new Map<string, FieldDef[]>();
		for (const field of data.fields as FieldDef[]) {
			if (!map.has(field.section)) map.set(field.section, []);
			map.get(field.section)!.push(field);
		}
		return map;
	});

	const gradientStart = $derived(data.copy['gradient_start'] ?? '#00c6ff');
	const gradientEnd = $derived(data.copy['gradient_end'] ?? '#ff007f');

	// Local reactive state for image field values so the picker can update them
	const imageFields = (data.fields as FieldDef[]).filter((f) => f.type === 'image');
	let imageValues = $state<Record<string, string>>(
		Object.fromEntries(imageFields.map((f) => [f.key, (data as typeof data).copy[f.key] ?? '']))
	);

	// Gallery picker
	let pickerKey = $state<string | null>(null);
	let galleryImages = $state<{ name: string; url: string }[]>([]);
	let galleryLoading = $state(false);
	let galleryLoaded = $state(false);

	async function openPicker(key: string) {
		pickerKey = key;
		if (!galleryLoaded) {
			galleryLoading = true;
			const res = await fetch('/admin/api/gallery');
			galleryImages = await res.json();
			galleryLoading = false;
			galleryLoaded = true;
		}
	}

	function selectImage(url: string) {
		if (pickerKey) imageValues[pickerKey] = url;
		pickerKey = null;
	}
</script>

<svelte:head>
	<title>Site Content — bray.ink Admin</title>
</svelte:head>

{#if saving}
	<div class="save-overlay" aria-live="polite">
		<span class="save-spinner"></span>
		Saving…
	</div>
{/if}

<!-- Gallery picker modal -->
{#if pickerKey}
	<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_noninteractive_element_interactions -->
	<div class="modal-overlay" role="dialog" aria-modal="true" tabindex="-1" onclick={() => (pickerKey = null)}>
		<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_noninteractive_element_interactions -->
		<div class="modal" role="document" onclick={(e) => e.stopPropagation()}>
			<div class="modal-header">
				<h3>Pick from Gallery</h3>
				<button class="modal-close" onclick={() => (pickerKey = null)} aria-label="Close">✕</button>
			</div>
			{#if galleryLoading}
				<p class="modal-status">Loading…</p>
			{:else if galleryImages.length === 0}
				<p class="modal-status">
					No images uploaded yet. <a href="/admin/gallery">Go to Gallery →</a>
				</p>
			{:else}
				<div class="picker-grid">
					{#each galleryImages as img}
						<button type="button" class="picker-item" onclick={() => selectImage(img.url)}>
							<img src={img.url} alt={img.name} />
						</button>
					{/each}
				</div>
			{/if}
		</div>
	</div>
{/if}

<div class="page-header">
	<h2>Site Content</h2>
	<p class="subtitle">Changes go live immediately after saving.</p>
</div>

{#if form?.success}
	<p class="success-banner">Saved successfully!</p>
{/if}

{#if form?.error}
	<p class="error-banner">{form.error}</p>
{/if}

<form
	method="POST"
	action="?/save"
	use:enhance={() => {
		saving = true;
		return async ({ update }) => {
			await update({ reset: false });
			saving = false;
		};
	}}
>
	{#each sections() as [sectionName, fields]}
		<div class="section-block">
			<h3 class="section-heading">{sectionName}</h3>

			{#if sectionName === 'Brand'}
				<div class="gradient-preview" style="background: linear-gradient(135deg, {gradientStart}, {gradientEnd});"></div>
			{/if}

			<div class="fields">
				{#each fields as field}
					<div class="field-group" class:field-inline={field.type === 'color'}>
						<label for={field.key}>{field.label}</label>
						{#if field.type === 'color'}
							<div class="color-row">
								<input
									type="color"
									id={field.key}
									name={field.key}
									value={data.copy[field.key] ?? '#00c6ff'}
									class="color-input"
								/>
								<span class="color-hex">{data.copy[field.key] ?? '#00c6ff'}</span>
							</div>
						{:else if field.type === 'image'}
							<div class="image-input-row">
								<input
									type="url"
									id={field.key}
									name={field.key}
									value={imageValues[field.key]}
									oninput={(e) => (imageValues[field.key] = e.currentTarget.value)}
									placeholder="https://... or /assets/filename.jpg"
									class="url-input"
								/>
								<button type="button" class="browse-btn" onclick={() => openPicker(field.key)}>
									Browse Gallery
								</button>
							</div>
							{#if imageValues[field.key]}
								<img src={imageValues[field.key]} alt="Preview" class="img-preview" />
							{/if}
						{:else if field.multiline}
							<textarea
								id={field.key}
								name={field.key}
								rows={3}
								value={data.copy[field.key] ?? ''}
							></textarea>
						{:else}
							<input
								type={field.type ?? 'text'}
								id={field.key}
								name={field.key}
								value={data.copy[field.key] ?? ''}
							/>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	{/each}

	<button type="submit" class="btn save-btn" disabled={saving}>
		{saving ? 'Saving...' : 'Save Changes'}
	</button>
</form>

<style>
	.page-header { margin-bottom: 2rem; }

	h2 {
		font-family: var(--font-gothic);
		font-size: 1.8rem;
		font-weight: 400;
		color: var(--text-color);
		letter-spacing: 1px;
	}

	.subtitle { color: var(--text-muted); font-size: 0.85rem; margin-top: 0.3rem; }

	.success-banner {
		background: rgba(74, 222, 128, 0.1);
		border: 1px solid rgba(74, 222, 128, 0.3);
		color: #4ade80;
		padding: 0.8rem 1rem;
		border-radius: 8px;
		font-size: 0.9rem;
		margin-bottom: 1.5rem;
	}

	.error-banner {
		background: rgba(248, 113, 113, 0.1);
		border: 1px solid rgba(248, 113, 113, 0.3);
		color: #f87171;
		padding: 0.8rem 1rem;
		border-radius: 8px;
		font-size: 0.9rem;
		margin-bottom: 1.5rem;
	}

	.section-block { margin-bottom: 3rem; max-width: 700px; }

	.section-heading {
		font-family: var(--font-gothic);
		font-size: 1rem;
		font-weight: 400;
		letter-spacing: 2px;
		text-transform: uppercase;
		color: var(--text-muted);
		margin-bottom: 1.25rem;
		padding-bottom: 0.6rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.06);
	}

	.gradient-preview {
		height: 6px;
		border-radius: 50px;
		margin-bottom: 1.25rem;
		opacity: 0.8;
	}

	.fields { display: flex; flex-direction: column; gap: 1.25rem; }

	.field-group { display: flex; flex-direction: column; gap: 0.5rem; }

	label {
		font-size: 0.78rem;
		font-weight: 600;
		letter-spacing: 0.8px;
		text-transform: uppercase;
		color: var(--text-muted);
	}

	input, textarea {
		background: var(--card-bg);
		border: 1px solid rgba(255, 255, 255, 0.08);
		padding: 0.9rem 1rem;
		color: var(--text-color);
		border-radius: 8px;
		font-family: var(--font-main);
		font-size: 0.95rem;
		transition: border-color 0.2s;
		width: 100%;
	}

	textarea { resize: vertical; line-height: 1.5; }

	input:focus, textarea:focus {
		outline: none;
		border-color: var(--accent-end);
	}

	/* Image field */
	.image-input-row {
		display: flex;
		gap: 0.5rem;
		align-items: stretch;
	}

	.url-input { font-family: monospace; font-size: 0.85rem; flex: 1; }

	.browse-btn {
		flex-shrink: 0;
		padding: 0 1rem;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 8px;
		color: var(--text-muted);
		font-family: var(--font-main);
		font-size: 0.8rem;
		font-weight: 600;
		cursor: pointer;
		white-space: nowrap;
		transition: background 0.2s, color 0.2s, border-color 0.2s;
	}

	.browse-btn:hover {
		background: rgba(255, 255, 255, 0.09);
		color: var(--text-color);
		border-color: rgba(255, 255, 255, 0.2);
	}

	.img-preview {
		margin-top: 0.6rem;
		width: 100%;
		max-height: 180px;
		object-fit: cover;
		border-radius: 8px;
		border: 1px solid rgba(255, 255, 255, 0.08);
		display: block;
	}

	/* Color picker row */
	.color-row { display: flex; align-items: center; gap: 0.75rem; }

	.color-input { width: 56px; height: 44px; padding: 2px 4px; border-radius: 8px; cursor: pointer; flex-shrink: 0; }

	.color-hex { font-family: monospace; font-size: 0.9rem; color: var(--text-muted); letter-spacing: 1px; }

	.save-btn { padding: 0.9rem 2.5rem; font-size: 0.95rem; margin-top: 1rem; }

	/* Modal */
	.modal-overlay {
		position: fixed;
		inset: 0;
		background: rgba(3, 3, 4, 0.85);
		z-index: 500;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem;
		backdrop-filter: blur(4px);
	}

	.modal {
		background: #18181f;
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 14px;
		width: 100%;
		max-width: 680px;
		max-height: 80vh;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1.25rem 1.5rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.06);
		flex-shrink: 0;
	}

	.modal-header h3 {
		font-family: var(--font-gothic);
		font-size: 1.1rem;
		font-weight: 400;
		letter-spacing: 1px;
		color: var(--text-color);
	}

	.modal-close {
		background: none;
		border: 1px solid rgba(255, 255, 255, 0.1);
		color: var(--text-muted);
		width: 30px;
		height: 30px;
		border-radius: 50%;
		cursor: pointer;
		font-size: 0.75rem;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: border-color 0.2s, color 0.2s;
	}
	.modal-close:hover { border-color: rgba(255,255,255,0.3); color: var(--text-color); }

	.modal-status {
		padding: 2rem 1.5rem;
		color: var(--text-muted);
		font-size: 0.9rem;
		text-align: center;
	}
	.modal-status a { color: var(--accent-start); text-decoration: none; }

	.picker-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
		gap: 0.75rem;
		padding: 1.25rem 1.5rem;
		overflow-y: auto;
	}

	.picker-item {
		aspect-ratio: 4 / 3;
		border-radius: 8px;
		overflow: hidden;
		border: 2px solid transparent;
		cursor: pointer;
		padding: 0;
		background: rgba(255,255,255,0.03);
		transition: border-color 0.2s, transform 0.2s;
	}
	.picker-item:hover {
		border-color: var(--accent-start);
		transform: scale(1.03);
	}
	.picker-item img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	/* Saving overlay */
	.save-overlay {
		position: fixed;
		inset: 0;
		z-index: 600;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		background: rgba(6, 6, 8, 0.7);
		backdrop-filter: blur(3px);
		color: var(--text-color);
		font-size: 0.95rem;
		font-weight: 500;
		letter-spacing: 0.5px;
	}

	.save-spinner {
		width: 18px;
		height: 18px;
		border: 2px solid rgba(255, 255, 255, 0.15);
		border-top-color: var(--accent-start);
		border-radius: 50%;
		animation: spin 0.7s linear infinite;
		flex-shrink: 0;
	}
	@keyframes spin { to { transform: rotate(360deg); } }
</style>
