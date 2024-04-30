import { sveltekit } from '@sveltejs/kit/vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [sveltekit(), nodePolyfills()],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
