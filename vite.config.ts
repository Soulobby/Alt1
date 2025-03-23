import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
	root: resolve(__dirname, "source"),
	publicDir: resolve(__dirname, "public"),
	resolve: {
		alias: {
			"~": resolve(__dirname, "./source"),
		},
	},
	build: {
		outDir: resolve(__dirname, "distribution"),
		emptyOutDir: true,
		assetsDir: ".",
		rollupOptions: {
			external: ["sharp", "canvas", "electron/common"],
			output: {
				entryFileNames: "main.js",
			},
		},
	},
	plugins: [
		react(),
		// For Alt1's unique requirements, we need to keep some behaviours consistent.
		{
			name: "alt1-compatibility",
			transformIndexHtml(html) {
				return html.replace(
					"</head>",
					`  <link rel="stylesheet" type="text/css" href="https://runeapps.org/nis/nis.css" />
<link rel="stylesheet" type="text/css" href="https://runeapps.org/runeappslib.css" />
</head>`,
				);
			},
		},
	],
});
