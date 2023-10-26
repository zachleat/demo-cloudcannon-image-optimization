const fs = require("node:fs");
const path = require("node:path");
const Image = require("@11ty/eleventy-img");
const { filesize } = require("filesize");

const IMAGE_OPTIONS = {
	widths: [400, 800, 1600],
	formats: ["avif", "webp", "jpeg"],
};

const ORIGINAL_IMAGE_OPTIONS = {
	widths: ["auto"],
	formats: ["auto"],
};

async function imageStats(filePath, forOriginal) {
	let metadata = await Image(filePath, Object.assign({
		dryRun: true,
	}, forOriginal ? ORIGINAL_IMAGE_OPTIONS : IMAGE_OPTIONS));
	return metadata;
}

async function image(filePath, title) {
	let metadata = await Image(filePath, Object.assign({
		outputDir: "./_site/optimized/",
		urlPath: "/optimized/",
	}, IMAGE_OPTIONS));

	let imageAttributes = {
		alt: title,
		class: "site-screenshot",
		sizes: "(min-width: 50em) 50em, 100vw",
		loading: "eager", // "lazy",
		fetchpriority: "high", // "auto",
		decoding: "async",
	};

	// You bet we throw an error on a missing alt (alt="" works okay)
	return Image.generateHTML(metadata, imageAttributes);
}

module.exports = function(eleventyConfig) {
	eleventyConfig.addShortcode("image", (srcFilePath, ...args) => {
		let filePath = path.join(eleventyConfig.dir.input, srcFilePath);
		return image(filePath, ...args)
	});

	// Ignores
	eleventyConfig.ignores.add("README.md");
	eleventyConfig.ignores.add("src/_schemas/*");

	// Components
	eleventyConfig.addPassthroughCopy({
		"./src/style.css": "/style.css",
		"./node_modules/@zachleat/browser-window/browser-window.js": "/browser-window.js",
	});

	// Filters
	function metadataString(metadata, before) {
		let formats = Object.keys(metadata).reverse();
		let sizeCount = metadata[formats[0]].length;
		let sizeIndexes = [sizeCount - 1, 0];

		let html = [];
		for(let j of sizeIndexes) {
			for(let format of formats) {
				let sizeEntry = metadata[format][j];
				html.push(`<tr>
	<td><code>${filesize(sizeEntry.size)}</code></td>
	<td><code class="demo-better">${((sizeEntry.size - before) * 100 / before + 100).toFixed(2)}%</code></td>
	<td>${format.toLowerCase()}</td>
	<td><code>${sizeEntry.width}w</code></td>
</tr>`);
			}
		}
		return html.join("\n");
	}

	eleventyConfig.addFilter("friendlySizeTable", async srcFilePath => {
		let filePath = path.join(eleventyConfig.dir.input, srcFilePath);
		let stats = fs.statSync(filePath);
		let before = stats.size;

		let metadata = await imageStats(filePath);
		let originalMetadata = await imageStats(filePath, true);
		let originalFormat = Object.keys(originalMetadata).pop();

		return `<table>
	<thead>
		<tr>
			<th>Size</th>
			<th>Difference</th>
			<th>Format</th>
			<th>Width</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td><code>${filesize(before)}</code></td>
			<td><code class="demo-worse">100%</code></td>
			<td>${originalFormat.toLowerCase()}</td>
			<td><code>${originalMetadata[originalFormat][0].width}w</td>
		</tr>
		${metadataString(metadata, before)}
	</tbody>
</table>`;
	});

	return {
		dir: {
			input: "src"
		}
	}
};