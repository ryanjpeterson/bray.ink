<script lang="ts">
	import type { LayoutData } from './$types';

	let { data, children }: { data: LayoutData; children: import('svelte').Snippet } = $props();

	const isLoggedIn = $derived(!!data.session);
</script>

{#if !isLoggedIn}
	{@render children()}
{:else}
	<div class="admin-shell">
		<nav class="sidebar">
			<a href="/" class="sidebar-logo">bray<span>.ink</span></a>
			<ul>
				<li><a href="/admin/submissions">Submissions</a></li>
				<li><a href="/admin/content">Site Content</a></li>
				<li><a href="/admin/gallery">Gallery</a></li>
			</ul>
			<form method="POST" action="/admin/login?/logout" class="logout-form">
				<button type="submit">Log out</button>
			</form>
		</nav>
		<main class="admin-main">
			{@render children()}
		</main>
	</div>
{/if}

<style>
	.admin-shell {
		display: flex;
		min-height: 100vh;
		background: var(--bg-color);
	}

	.sidebar {
		width: 220px;
		flex-shrink: 0;
		background: var(--card-bg);
		border-right: 1px solid rgba(255, 255, 255, 0.06);
		display: flex;
		flex-direction: column;
		padding: 2rem 1.5rem;
		gap: 2rem;
	}

	.sidebar-logo {
		font-family: var(--font-gothic);
		font-size: 1.4rem;
		text-decoration: none;
		color: var(--text-color);
	}

	.sidebar-logo span {
		background: var(--accent-grad);
		-webkit-background-clip: text;
		background-clip: text;
		-webkit-text-fill-color: transparent;
	}

	.sidebar ul {
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		flex: 1;
	}

	.sidebar ul a {
		display: block;
		padding: 0.6rem 0.8rem;
		border-radius: 6px;
		text-decoration: none;
		color: var(--text-muted);
		font-size: 0.9rem;
		font-weight: 500;
		transition: background 0.2s, color 0.2s;
	}

	.sidebar ul a:hover {
		background: rgba(255, 255, 255, 0.05);
		color: var(--text-color);
	}

	.logout-form button {
		width: 100%;
		background: none;
		border: 1px solid rgba(255, 255, 255, 0.1);
		color: var(--text-muted);
		padding: 0.5rem;
		border-radius: 6px;
		cursor: pointer;
		font-size: 0.85rem;
		transition: border-color 0.2s, color 0.2s;
	}

	.logout-form button:hover {
		border-color: rgba(255, 255, 255, 0.3);
		color: var(--text-color);
	}

	.admin-main {
		flex: 1;
		padding: 3rem;
		overflow-y: auto;
	}
</style>
