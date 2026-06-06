<script lang="ts">
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';
	import type { Submission } from '$lib/types';

	let { data }: { data: PageData } = $props();

	let openId = $state<string | null>(null);

	function toggle(id: string) {
		openId = openId === id ? null : id;
	}

	function formatDate(iso: string) {
		return new Date(iso).toLocaleDateString('en-CA', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	const unreadCount = $derived(data.submissions.filter((s: Submission) => !s.read).length);
</script>

<svelte:head>
	<title>Submissions — bray.ink Admin</title>
</svelte:head>

<div class="page-header">
	<h2>Submissions</h2>
	<p class="subtitle">
		{#if unreadCount > 0}
			<span class="unread-pill">{unreadCount} new</span>
		{/if}
		{data.submissions.length} total
	</p>
</div>

{#if data.submissions.length === 0}
	<p class="empty">No submissions yet.</p>
{:else}
	<div class="log">
		<div class="log-header">
			<span>Name</span>
			<span class="col-email">Email</span>
			<span class="col-preview">Message</span>
			<span class="col-date">Date</span>
		</div>

		{#each data.submissions as sub (sub.id)}
			<div class="log-row-wrap" class:is-open={openId === sub.id}>
				<!-- svelte-ignore a11y_interactive_supports_focus -->
				<div
					class="log-row"
					class:unread={!sub.read}
					role="button"
					tabindex="0"
					onclick={() => toggle(sub.id)}
					onkeydown={(e) => e.key === 'Enter' && toggle(sub.id)}
				>
					<span class="col-name">
						{#if !sub.read}<span class="dot" aria-label="Unread"></span>{/if}
						{sub.name}
					</span>
					<span class="col-email text-muted">{sub.email}</span>
					<span class="col-preview text-muted">{sub.message.slice(0, 80)}{sub.message.length > 80 ? '…' : ''}</span>
					<span class="col-date text-muted">{formatDate(sub.created_at)}</span>
					<span class="chevron" class:open={openId === sub.id}>›</span>
				</div>

				{#if openId === sub.id}
					<div class="detail">
						<div class="detail-meta">
							<a href="mailto:{sub.email}" class="detail-email">{sub.email}</a>
							<span class="detail-date">{formatDate(sub.created_at)}</span>
						</div>
						<p class="detail-message">{sub.message}</p>
						<div class="detail-actions">
							{#if !sub.read}
								<form method="POST" action="?/markRead" use:enhance={({ cancel }) => {
									return async ({ update }) => {
										await update();
										// keep panel open after marking read
									};
								}}>
									<input type="hidden" name="id" value={sub.id} />
									<button type="submit" class="btn-mark-read">Mark as read</button>
								</form>
							{:else}
								<span class="read-label">Read</span>
							{/if}
						</div>
					</div>
				{/if}
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

	.subtitle {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		color: var(--text-muted);
		font-size: 0.85rem;
		margin-top: 0.35rem;
	}

	.unread-pill {
		background: var(--accent-grad);
		color: #fff;
		font-size: 0.7rem;
		font-weight: 700;
		letter-spacing: 0.5px;
		padding: 0.15rem 0.55rem;
		border-radius: 20px;
	}

	.empty { color: var(--text-muted); font-size: 0.95rem; }

	/* Log table */
	.log {
		border: 1px solid rgba(255, 255, 255, 0.06);
		border-radius: 10px;
		overflow: hidden;
	}

	.log-header {
		display: grid;
		grid-template-columns: 200px 220px 1fr 160px;
		padding: 0.55rem 1.25rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.06);
		background: rgba(255, 255, 255, 0.02);
		font-size: 0.7rem;
		font-weight: 700;
		letter-spacing: 1.2px;
		text-transform: uppercase;
		color: var(--text-muted);
		gap: 1rem;
	}

	.log-row-wrap {
		border-bottom: 1px solid rgba(255, 255, 255, 0.04);
	}
	.log-row-wrap:last-child { border-bottom: none; }

	.log-row {
		display: grid;
		grid-template-columns: 200px 220px 1fr 160px 24px;
		align-items: center;
		padding: 0.85rem 1.25rem;
		gap: 1rem;
		cursor: pointer;
		transition: background 0.15s;
		position: relative;
	}

	.log-row:hover { background: rgba(255, 255, 255, 0.025); }

	.log-row.unread {
		border-left: 2px solid color-mix(in srgb, var(--accent-start) 70%, transparent);
	}

	.log-row-wrap.is-open .log-row {
		background: rgba(255, 255, 255, 0.03);
	}

	.dot {
		display: inline-block;
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--accent-grad);
		margin-right: 0.5rem;
		flex-shrink: 0;
		vertical-align: middle;
		position: relative;
		top: -1px;
	}

	.col-name {
		font-size: 0.9rem;
		font-weight: 600;
		color: var(--text-color);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		display: flex;
		align-items: center;
	}

	.col-email, .col-preview, .col-date {
		font-size: 0.82rem;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.text-muted { color: var(--text-muted); }

	.chevron {
		color: var(--text-muted);
		font-size: 1.1rem;
		line-height: 1;
		transition: transform 0.2s;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.chevron.open { transform: rotate(90deg); }

	/* Detail panel */
	.detail {
		padding: 1.25rem 1.5rem 1.5rem;
		border-top: 1px solid rgba(255, 255, 255, 0.05);
		background: rgba(255, 255, 255, 0.015);
	}

	.detail-meta {
		display: flex;
		align-items: center;
		gap: 1.25rem;
		margin-bottom: 1rem;
	}

	.detail-email {
		color: var(--accent-start);
		font-size: 0.85rem;
		text-decoration: none;
	}
	.detail-email:hover { text-decoration: underline; }

	.detail-date {
		color: var(--text-muted);
		font-size: 0.8rem;
	}

	.detail-message {
		color: var(--text-color);
		font-size: 0.92rem;
		line-height: 1.7;
		white-space: pre-wrap;
		margin-bottom: 1.25rem;
		max-width: 680px;
	}

	.detail-actions { display: flex; align-items: center; gap: 1rem; }

	.btn-mark-read {
		background: none;
		border: 1px solid rgba(255, 255, 255, 0.12);
		color: var(--text-muted);
		padding: 0.35rem 0.9rem;
		border-radius: 6px;
		font-size: 0.8rem;
		font-weight: 600;
		cursor: pointer;
		transition: border-color 0.2s, color 0.2s;
	}
	.btn-mark-read:hover {
		border-color: var(--accent-start);
		color: var(--text-color);
	}

	.read-label {
		font-size: 0.78rem;
		color: var(--text-muted);
		opacity: 0.45;
	}

	/* Responsive: hide email + preview columns on narrow screens */
	@media (max-width: 860px) {
		.log-header, .log-row {
			grid-template-columns: 1fr 140px 24px;
		}
		.col-email, .col-preview { display: none; }
		.log-header .col-email, .log-header .col-preview { display: none; }
	}
</style>
