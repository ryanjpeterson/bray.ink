<script lang="ts">
	import type { ActionData } from './$types';
	import { enhance } from '$app/forms';

	let { form }: { form: ActionData } = $props();
</script>

<svelte:head>
	<title>Admin Login — bray.ink</title>
</svelte:head>

<div class="login-wrap">
	<div class="login-card">
		<h1>bray<span>.ink</span></h1>
		<p class="subtitle">Studio Admin</p>

		<form method="POST" action="?/login" use:enhance>
			{#if form?.error}
				<p class="error">{form.error}</p>
			{/if}
			<div class="field">
				<input type="email" name="email" placeholder="Email" autocomplete="email" required />
			</div>
			<div class="field">
				<input type="password" name="password" placeholder="Password" autocomplete="current-password" required />
			</div>
			<button type="submit" class="btn">Sign in</button>
		</form>
	</div>
</div>

<style>
	.login-wrap {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem;
	}

	.login-card {
		background: var(--card-bg);
		border: 1px solid rgba(255, 255, 255, 0.06);
		border-radius: 12px;
		padding: 3rem 2.5rem;
		width: 100%;
		max-width: 400px;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	h1 {
		font-family: var(--font-gothic);
		font-size: 2rem;
		font-weight: 400;
	}

	h1 span {
		background: var(--accent-grad);
		-webkit-background-clip: text;
		background-clip: text;
		-webkit-text-fill-color: transparent;
	}

	.subtitle {
		color: var(--text-muted);
		font-size: 0.85rem;
		letter-spacing: 1px;
		text-transform: uppercase;
		margin-top: -1rem;
	}

	form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.field input {
		width: 100%;
		background: rgba(255, 255, 255, 0.04);
		border: 1px solid rgba(255, 255, 255, 0.08);
		padding: 0.9rem 1rem;
		color: var(--text-color);
		border-radius: 8px;
		font-family: var(--font-main);
		font-size: 0.9rem;
		transition: border-color 0.2s;
	}

	.field input:focus {
		outline: none;
		border-color: var(--accent-end);
	}

	.error {
		color: #f87171;
		font-size: 0.85rem;
	}

	.btn {
		width: 100%;
		padding: 0.9rem;
		font-size: 0.95rem;
	}
</style>
