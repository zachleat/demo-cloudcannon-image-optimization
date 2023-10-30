/* On-off script to highlight active src */
let images = document.querySelectorAll("img");

function updateActiveSource(img) {
	if(img.currentSrc) {
		let u = new URL(img.currentSrc);

		let section = img.closest("section");

		let previousRow = section.querySelector(`tr.currentsrc`);
		previousRow?.classList.remove("currentsrc");

		let currentSrcRow = section.querySelector(`tr[data-url="${u.pathname}"]`);
		currentSrcRow?.classList.add("currentsrc", "loadedsrc");
	}
}

if("ResizeObserver" in window) {
	let resizer = new ResizeObserver((entries) => {
		for(let entry of entries) {
			let img = entry.target;
			updateActiveSource(img);
		}
	});

	for(let i of images) {
		resizer.observe(i);
	}
}
