const path = require("node:path");
const Image = require("@11ty/eleventy-img");

const IMAGE_OPTIONS = {
	widths: [400, 800, 1600],
	formats: ["avif", "webp", "jpeg", "svg"],
	outputDir: "./_site/optimized/",
	urlPath: "/optimized/",
};

async function image(inputFilePath, alt, sizes, preferSvg) {
	let before = Date.now();
	let metadata = await Image(inputFilePath, Object.assign({
		svgShortCircuit: preferSvg ? "size" : false,
	}, IMAGE_OPTIONS));
	console.log( "[11ty/eleventy-img]", `${Date.now() - before}ms`, inputFilePath );

	let imageAttributes = {
		alt,
		sizes,
		loading: "eager",
		decoding: "async",
		// fetchpriority: "high", // "auto",
	};

	// You bet we throw an error on a missing alt (alt="" works okay)
	return Image.generateHTML(metadata, imageAttributes);
}

module.exports = function(eleventyConfig) {
	eleventyConfig.addShortcode("image", (srcFilePath, ...args) => {
		let filePath = path.join(eleventyConfig.dir.input, srcFilePath);
		return image(filePath, ...args)
	});

	// Server
	eleventyConfig.setServerOptions({
		domDiff: false,
	})

	// Ignores
	eleventyConfig.ignores.add("README.md");
	eleventyConfig.ignores.add("src/_schemas/*");

	// Components
	eleventyConfig.addPassthroughCopy({
		"./public/*": "/",
		"./node_modules/@zachleat/browser-window/browser-window.js": "/browser-window.js",
	});

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