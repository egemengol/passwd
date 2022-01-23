// import adapter from '@sveltejs/adapter-auto';
import preprocess from 'svelte-preprocess';
import adapter from '@sveltejs/adapter-netlify';

export default {
	preprocess: preprocess(),
	kit: {
		adapter: adapter({
			// if true, will split your app into multiple functions
			// instead of creating a single one for the entire app
			split: false
		}),
		target: '#svelte'
	}
};

// /** @type {import('@sveltejs/kit').Config} */
// const config = {
// 	// Consult https://github.com/sveltejs/svelte-preprocess
// 	// for more information about preprocessors
// 	preprocess: preprocess(),

// 	kit: {
// 		adapter: adapter(),

// 		// hydrate the <div id="svelte"> element in src/app.html
// 		target: '#svelte'
// 	}
// };

// export default config;
