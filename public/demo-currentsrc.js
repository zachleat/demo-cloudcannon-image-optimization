/* On-off script to highlight active src */
if("ResizeObserver" in window) {
	let resizer = new ResizeObserver((entries) => {
		for(let entry of entries) {
			let img = entry.target;
			if(img.currentSrc) {
				let u = new URL(img.currentSrc);

				let section = img.closest("section");

				let previousRow = section.querySelector(`tr.currentsrc`);
				previousRow?.classList.remove("currentsrc");

				let currentSrcRow = section.querySelector(`tr[data-url="${u.pathname}"]`);
				currentSrcRow?.classList.add("currentsrc", "loadedsrc");
			}
		}
	});

	let images = document.querySelectorAll("img");
	for(let i of images) {
		resizer.observe(i);
	}
}