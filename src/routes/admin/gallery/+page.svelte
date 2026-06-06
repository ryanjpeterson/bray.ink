<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let uploading = $state(false);
	let dragover = $state(false);
	let confirmDelete = $state<string | null>(null);

	function fmt(bytes: number) {
		return bytes < 1024 ? `${bytes} B` : `${Math.round(bytes / 1024)} KB`;
	}

	function isActive(url: string, key: 'hero_image_url' | 'studio_image_url') {
		return data.current[key] === url;
	}
</script>

<svelte:head>
	<title>Gallery — bray.ink Admin</title>
</svelte:head>

<div class="page-header">
	<h2>Gallery</h2>
	<p class="subtitle">Upload photos and assign them to the site.</p>
</div>

{#if form?.error}
	<p class="error-banner">{form.error}</p>
{/if}

<!-- Upload -->
<div
	class="upload-zone"
	class:dragover
	ondragover={(e) => { e.preventDefault(); dragover = true; }}
	ondragleave={() => (dragover = false)}
	ondrop={(e) => { e.preventDefault(); dragover = false; }}
	role="region"
	aria-label="Upload zone"
>
	<form
		method="POST"
		action="?/upload"
		enctype="multipart/form-data"
		use:enhance={() => {
			uploading = true;
			return async ({ update }) => { await update(); uploading = false; };
		}}
	>
		<input
			type="file"
			name="file"
			id="file-input"
			accept="image/jpeg,image/png,image/webp,image/gif"
			class="file-input"
			onchange={(e) => (e.currentTarget.form as HTMLFormElement).requestSubmit()}
		/>
		<label for="file-input" class="upload-label">
			{#if uploading}
				<span class="upload-spinner"></span>
				Uploading…
			{:else}
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
					<path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 12V4m0 0L8 8m4-4 4 4"/>
				</svg>
				Click to upload or drag & drop
			{/if}
		</label>
	</form>
	<p class="upload-hint">JPG, PNG, WebP, GIF — max 10 MB</p>
</div>

<!-- Current assignments -->
<div class="assignments">
	<div class="assignment-badge">
		<span class="badge-label">Hero Background</span>
		{#if data.current.hero_image_url}
			<img src={data.current.hero_image_url} alt="Current hero" class="badge-thumb" />
		{:else}
			<span class="badge-empty">Not set</span>
		{/if}
	</div>
	<div class="assignment-badge">
		<span class="badge-label">Studio Photo</span>
		{#if data.current.studio_image_url}
			<img src={data.current.studio_image_url} alt="Current studio" class="badge-thumb" />
		{:else}
			<span class="badge-empty">Not set</span>
		{/if}
	</div>
</div>

<!-- Image Grid -->
{#if data.images.length === 0}
	<p class="empty">No images uploaded yet.</p>
{:else}
	<div class="grid">
		{#each data.images as img}
			<div class="card">
				<div class="card-img-wrap">
					<img src={img.url} alt={img.name} loading="lazy" />
					{#if isActive(img.url, 'hero_image_url')}
						<span class="badge hero-badge">Hero BG</span>
					{/if}
					{#if isActive(img.url, 'studio_image_url')}
						<span class="badge studio-badge">Studio</span>
					{/if}
				</div>
				<div class="card-meta">
					<span class="card-name" title={img.name}>{img.name.replace(/^\d+-/, '')}</span>
					<span class="card-size">{fmt(img.size)}</span>
				</div>
				<div class="card-actions">
					<form method="POST" action="?/setHero" use:enhance>
						<input type="hidden" name="url" value={img.url} />
						<button type="submit" class="action-btn hero-btn" class:active={isActive(img.url, 'hero_image_url')}>
							{isActive(img.url, 'hero_image_url') ? '✓ Hero BG' : 'Set Hero BG'}
						</button>
					</form>
					<form method="POST" action="?/setStudio" use:enhance>
						<input type="hidden" name="url" value={img.url} />
						<button type="submit" class="action-btn studio-btn" class:active={isActive(img.url, 'studio_image_url')}>
							{isActive(img.url, 'studio_image_url') ? '✓ Studio' : 'Set Studio'}
						</button>
					</form>

					{#if confirmDelete === img.name}
						<div class="confirm-row">
							<span class="confirm-label">Delete?</span>
							<form method="POST" action="?/delete" use:enhance={() => {
								return async ({ update }) => { confirmDelete = null; await update(); };
							}}>
								<input type="hidden" name="name" value={img.name} />
								<button type="submit" class="action-btn delete-confirm-btn">Yes</button>
							</form>
							<button class="action-btn cancel-btn" onclick={() => (confirmDelete = null)}>No</button>
						</div>
					{:else}
						<button class="action-btn delete-btn" onclick={() => (confirmDelete = img.name)}>Delete</button>
					{/if}
				</div>
			</div>
		{/each}
	</div>
{/if}

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

	.error-banner {
		background: rgba(248, 113, 113, 0.1);
		border: 1px solid rgba(248, 113, 113, 0.3);
		color: #f87171;
		padding: 0.8rem 1rem;
		border-radius: 8px;
		font-size: 0.9rem;
		margin-bottom: 1.5rem;
	}

	/* Upload zone */
	.upload-zone {
		border: 2px dashed rgba(255, 255, 255, 0.1);
		border-radius: 12px;
		padding: 2rem;
		text-align: center;
		margin-bottom: 2rem;
		transition: border-color 0.2s, background 0.2s;
		background: rgba(255, 255, 255, 0.01);
	}
	.upload-zone.dragover {
		border-color: var(--accent-start);
		background: rgba(0, 198, 255, 0.04);
	}

	.file-input { display: none; }

	.upload-label {
		display: inline-flex;
		align-items: center;
		gap: 0.6rem;
		cursor: pointer;
		color: var(--text-muted);
		font-size: 0.9rem;
		font-weight: 500;
		transition: color 0.2s;
	}
	.upload-label:hover { color: var(--text-color); }
	.upload-label svg { width: 20px; height: 20px; flex-shrink: 0; }

	.upload-hint { font-size: 0.75rem; color: rgba(142, 142, 156, 0.5); margin-top: 0.6rem; }

	.upload-spinner {
		width: 16px;
		height: 16px;
		border: 2px solid rgba(255, 255, 255, 0.15);
		border-top-color: var(--accent-start);
		border-radius: 50%;
		animation: spin 0.7s linear infinite;
		flex-shrink: 0;
	}
	@keyframes spin { to { transform: rotate(360deg); } }

	/* Assignment strip */
	.assignments {
		display: flex;
		gap: 1.5rem;
		margin-bottom: 2rem;
		flex-wrap: wrap;
	}
	.assignment-badge {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		background: var(--card-bg);
		border: 1px solid rgba(255, 255, 255, 0.06);
		border-radius: 10px;
		padding: 0.6rem 1rem;
	}
	.badge-label {
		font-size: 0.72rem;
		font-weight: 700;
		letter-spacing: 1.2px;
		text-transform: uppercase;
		color: var(--text-muted);
	}
	.badge-thumb {
		width: 48px;
		height: 36px;
		object-fit: cover;
		border-radius: 5px;
		border: 1px solid rgba(255, 255, 255, 0.1);
	}
	.badge-empty { font-size: 0.8rem; color: rgba(142, 142, 156, 0.4); }

	.empty { color: var(--text-muted); font-size: 0.9rem; }

	/* Grid */
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
		gap: 1.25rem;
	}

	.card {
		background: var(--card-bg);
		border: 1px solid rgba(255, 255, 255, 0.06);
		border-radius: 10px;
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}

	.card-img-wrap {
		position: relative;
		aspect-ratio: 4 / 3;
		overflow: hidden;
		background: rgba(255, 255, 255, 0.03);
	}
	.card-img-wrap img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
		transition: transform 0.3s;
	}
	.card:hover .card-img-wrap img { transform: scale(1.04); }

	.badge {
		position: absolute;
		top: 0.5rem;
		font-size: 0.65rem;
		font-weight: 700;
		letter-spacing: 1px;
		text-transform: uppercase;
		padding: 0.2rem 0.5rem;
		border-radius: 4px;
	}
	.hero-badge { left: 0.5rem; background: var(--accent-grad); color: #fff; }
	.studio-badge { right: 0.5rem; background: rgba(74, 222, 128, 0.85); color: #000; }

	.card-meta {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		padding: 0.6rem 0.75rem 0.4rem;
		gap: 0.5rem;
	}
	.card-name {
		font-size: 0.78rem;
		color: var(--text-color);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		flex: 1;
	}
	.card-size { font-size: 0.7rem; color: var(--text-muted); flex-shrink: 0; }

	.card-actions {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		padding: 0.4rem 0.75rem 0.75rem;
	}
	.card-actions form { display: contents; }

	.action-btn {
		width: 100%;
		padding: 0.4rem 0.6rem;
		border-radius: 6px;
		border: 1px solid rgba(255, 255, 255, 0.08);
		background: rgba(255, 255, 255, 0.03);
		color: var(--text-muted);
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.5px;
		cursor: pointer;
		transition: background 0.2s, color 0.2s, border-color 0.2s;
		text-align: center;
	}

	.hero-btn:hover, .hero-btn.active {
		background: var(--accent-grad);
		color: #fff;
		border-color: transparent;
	}
	.studio-btn:hover, .studio-btn.active {
		background: rgba(74, 222, 128, 0.15);
		color: #4ade80;
		border-color: rgba(74, 222, 128, 0.3);
	}
	.delete-btn:hover {
		background: rgba(248, 113, 113, 0.1);
		color: #f87171;
		border-color: rgba(248, 113, 113, 0.3);
	}

	.confirm-row {
		display: flex;
		align-items: center;
		gap: 0.4rem;
	}
	.confirm-row form { display: contents; }
	.confirm-label { font-size: 0.72rem; color: #f87171; flex: 1; }
	.delete-confirm-btn {
		flex: 1;
		background: rgba(248, 113, 113, 0.15) !important;
		color: #f87171 !important;
		border-color: rgba(248, 113, 113, 0.3) !important;
	}
	.cancel-btn { flex: 1; }
</style>
