<script lang="ts">
	import '../app.css';
	import type { LayoutData } from './$types';

	let { children, data }: { children: import('svelte').Snippet; data: LayoutData } = $props();
</script>

<div style="--accent-start: {data.gradientStart}; --accent-end: {data.gradientEnd}; --accent-grad: linear-gradient(135deg, {data.gradientStart} 0%, {data.gradientEnd} 100%);">
	{@render children()}
</div>
