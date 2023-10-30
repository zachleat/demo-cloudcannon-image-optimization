const fs = require("node:fs");
const { filesize } = require("filesize");
const path = require("node:path");

const Image = require("@11ty/eleventy-img");

const ORIGINAL_IMAGE_OPTIONS = {
	widths: ["auto"],
	formats: ["auto"],
};

async function imageStats(filePath, options, imageOptions) {
	let metadata = await Image(filePath, Object.assign({
		dryRun: true,
		svgShortCircuit: options.preferSvg ? "size" : false,
	}, imageOptions));
	return metadata;
}

function sizeEntryToHtml(sizeEntry, beforeSize) {
	let format = sizeEntry.format;
	if(format === "svg") {
		return "";
	}

	return `<tr data-url="${sizeEntry.url}">
<td><code>${filesize(sizeEntry.size)}</code></td>
<td>${format.toLowerCase()}</td>
<td><code class="demo-better">${((sizeEntry.size - beforeSize) * 100 / beforeSize + 100).toFixed(2)}%</code></td>
<td><code>${sizeEntry.width}w</code></td>
</tr>`
}
// Filters
function metadataString(metadata, beforeSize) {
	let formats = Object.keys(metadata).reverse();
	let sizeCount = metadata[formats[1]].length;

	let html = [];
	for(let j = sizeCount - 1; j>=0; j--) {
		for(let format of formats) {
			if(metadata[format][j]) {
				html.push(sizeEntryToHtml(metadata[format][j], beforeSize));
			}
		}
	}

	return html.join("\n");
}

module.exports = function(eleventyConfig, options) {

	eleventyConfig.addFilter("friendlySizeTable", async (srcFilePath, preferSvg) => {
		let filePath = path.join(eleventyConfig.dir.input, srcFilePath);
		let stats = fs.statSync(filePath);
		let before = stats.size;

		let originalImageOptions = Object.assign({}, options.imageOptions, ORIGINAL_IMAGE_OPTIONS);
		let originalMetadata = await imageStats(filePath, { preferSvg }, originalImageOptions);
		let originalFormat = Object.keys(originalMetadata).pop();

		let metadata = await imageStats(filePath, { preferSvg }, options.imageOptions);

		return `<table>
	<thead>
		<tr>
			<th>Size</th>
			<th>Format</th>
			<th>Percent</th>
			<th>Width</th>
		</tr>
	</thead>
	<tbody>
		<tr data-url="${originalMetadata[originalFormat][0].url}">
			<td><code>${filesize(before)}</code></td>
			<td>${originalFormat.toLowerCase()}</td>
			<td><code><em>100%</em></code></td>
			<td><code>${originalMetadata[originalFormat][0].width}w</code></td>
		</tr>
		${metadataString(metadata, before)}
	</tbody>
</table>`;
	});
}