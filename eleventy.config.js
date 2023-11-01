const path = require("node:path");
const Image = require("@11ty/eleventy-img");

const IMAGE_OPTIONS = {
	widths: [400, 800, 1600],
	formats: ["avif", "webp", "svg", "jpeg"],
	outputDir: "./_site/optimized/",
	urlPath: "/optimized/",
	// svgCompressionSize: "br",
};

module.exports = function(eleventyConfig) {
	eleventyConfig.addShortcode("image", async (srcFilePath, alt, sizes, preferSvg) => {
		let before = Date.now();
		let inputFilePath = path.join(eleventyConfig.dir.input, srcFilePath);
		let metadata = await Image(inputFilePath, Object.assign({
			svgShortCircuit: preferSvg ? "size" : false,
		}, IMAGE_OPTIONS));
		console.log( `[11ty/eleventy-img] ${Date.now() - before}ms: ${inputFilePath}` );

		return Image.generateHTML(metadata, {
			alt,
			sizes,
			loading: "eager",
			decoding: "async",
		});
	});

	// Components
	eleventyConfig.addPassthroughCopy({
		"./public/*": "/",
		"./node_modules/@zachleat/browser-window/browser-window.js": "/browser-window.js",
	});

	// Server
	eleventyConfig.setServerOptions({
		domDiff: false,
	});

	// Liquid
	eleventyConfig.setLiquidOptions({
		jsTruthy: true
	});

	// Ignores
	eleventyConfig.ignores.add("README.md");
	eleventyConfig.ignores.add("src/_schemas/*");

	// Plugin to show optimized Image file sizes in a nice table.
	eleventyConfig.addPlugin(require("./11ty/filesize-table.js"), {
		imageOptions: IMAGE_OPTIONS
	});

	return {
		dir: {
			input: "src"
		}
	}
};