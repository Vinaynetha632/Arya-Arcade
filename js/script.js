
document.addEventListener("DOMContentLoaded", () => {

	function stopMedia(player) {
		if (!player) return;
		const tag = player.tagName?.toLowerCase();
		if (tag === "video" || tag === "audio") {
			try {
				player.pause();
				const src = player.querySelector("source");
				if (src) src.src = "";
				player.removeAttribute("src");
				player.load();
			} catch (e) { /* ignore */ }
		} else if (tag === "iframe") {
			player.src = "";
		}
	}


	const videoModal = document.getElementById("videoModal");
	const videoPlayer = document.getElementById("videoPlayer");
	if (videoModal && videoPlayer) {
		const closeVideoBtn = videoModal.querySelector(".close");
		closeVideoBtn?.addEventListener("click", () => {
			videoModal.style.display = "none";
			stopMedia(videoPlayer);
		});
		window.addEventListener("click", (e) => {
			if (e.target === videoModal) {
				videoModal.style.display = "none";
				stopMedia(videoPlayer);
			}
		});
	}


	const heroBookBtn = document.querySelector(".hero .book-btn");
	if (heroBookBtn) {
		heroBookBtn.addEventListener("click", (e) => {
			e.preventDefault();
			const contactEl = document.querySelector("#contact");
			if (contactEl) contactEl.scrollIntoView({ behavior: "smooth" });
		});
	}


	const navbarBookBtn = document.querySelector(".navbar .book-btn");
	if (navbarBookBtn) {
		navbarBookBtn.addEventListener("click", (e) => {
			e.preventDefault();
			const enquiryPopup = document.getElementById("enquiryPopup");
			if (enquiryPopup) enquiryPopup.classList.add("active");
		});
	}


	const pdfModal = document.getElementById("pdfModal");
	const pdfViewer = document.getElementById("pdfViewer");
	if (pdfModal && pdfViewer) {
		const closePdfBtn = pdfModal.querySelector(".close");
		closePdfBtn?.addEventListener("click", () => {
			pdfModal.style.display = "none";
			pdfViewer.src = "";
		});
		window.addEventListener("click", (e) => {
			if (e.target === pdfModal) {
				pdfModal.style.display = "none";
				pdfViewer.src = "";
			}
		});
	}

	document.querySelectorAll(".gallery-item").forEach(item => {
		item.addEventListener("click", () => {
			const type = item.dataset.type;
			const src = item.dataset.src;

			if (type === "video") {
				if (videoModal && videoPlayer) {
					videoModal.style.display = "flex";
					const sourceEl = videoPlayer.querySelector("source");
					if (sourceEl && src) {
						sourceEl.src = src;
						try { videoPlayer.load(); } catch (e) { }
					}
					videoPlayer.play().catch(() => { });
				}
			} else if (type === "image") {
				openImageModal(src);
			} else if (type === "pdf") {
				if (pdfModal && pdfViewer) {
					pdfModal.style.display = "flex";
					pdfViewer.src = src;
				}
			} else if (type === "floor") {
				const btn = document.getElementById("floorPlansBtn");
				if (btn) btn.click();
			} else if (type === "plans") {
				openPlans();
			} else if (type === "fullscreen") {
				openFullscreenModal();
			}
		});
	});

	function openImageModal(src) {
		let imageModal = document.getElementById("imageModal");
		if (!imageModal) {
			imageModal = document.createElement("div");
			imageModal.id = "imageModal";
			imageModal.className = "modal";
			imageModal.innerHTML = `
				<span class="close">&times;</span>
				<img src="" alt="Gallery Image" style="max-width:90%; max-height:90%; border-radius:10px;">
			`;
			document.body.appendChild(imageModal);

			imageModal.querySelector(".close").addEventListener("click", () => {
				imageModal.style.display = "none";
			});
			window.addEventListener("click", e => {
				if (e.target === imageModal) imageModal.style.display = "none";
			});
		}
		imageModal.querySelector("img").src = src;
		imageModal.style.display = "flex";
	}

	function openFullscreenModal() {
		let fullscreenModal = document.getElementById("fullscreenModal");
		if (!fullscreenModal) {
			fullscreenModal = document.createElement("div");
			fullscreenModal.id = "fullscreenModal";
			fullscreenModal.className = "modal fullscreen";
			fullscreenModal.innerHTML = `
				<span class="close">&times;</span>
				<div class="fullscreen-bg"></div>
			`;
			document.body.appendChild(fullscreenModal);
			fullscreenModal.querySelector(".close").addEventListener("click", () => {
				fullscreenModal.style.display = "none";
			});
			window.addEventListener("click", e => {
				if (e.target === fullscreenModal) fullscreenModal.style.display = "none";
			});
		}
		fullscreenModal.style.display = "flex";
	}


	const floorData = {
		root: [
			{ label: "Ground Floor", type: "submenu", key: "ground" },
			{ label: "First Floor", type: "submenu", key: "first" },
			{ label: "Second Floor", type: "image", src: "assets/images/second_layout.png" },
			{ label: "Third Floor", type: "image", src: "assets/images/third_layout.png" }
		],
		ground: [
			{ label: "Layout", type: "image", src: "assets/images/ground_layout.png" },
			{ label: "Block A", type: "image", src: "assets/images/ground_blockA.png" }
		],
		first: [
			{ label: "Layout", type: "image", src: "assets/images/first_layout.png" },
			{ label: "Block B", type: "image", src: "assets/images/first_blockB.png" }
		]
	};

	const plansData = {
		root: [
			{ label: "Commercial", type: "submenu", key: "commercial" },
			{ label: "Residential", type: "submenu", key: "residential" }
		],
		commercial: [
			{ label: "1 BHK plan 1", type: "image", src: "assets/images/plans/commercial1.png" },
			{ label: "1 BHK plan 2", type: "image", src: "assets/images/plans/commercial2.png" },
			{ label: "1 BHK plan 3", type: "image", src: "assets/images/plans/commercial3.png" }
		],
		residential: [
			{ label: "3 BHK plan 1", type: "image", src: "assets/images/plans/residential1.png" },
			{ label: "2 BHK plan 1", type: "image", src: "assets/images/plans/residential2.png" },
			{ label: "2 BHK plan 2", type: "image", src: "assets/images/plans/residential3.png" }
		]
	};

	function setupHierarchicalModal({
		openers = [],
		modalEl,
		menuEl,
		imageEl,
		backBtn,
		toggleBtn,
		data,
		defaultImage = ""
	}) {
		if (!modalEl || !menuEl || !imageEl || !backBtn || !toggleBtn) return;

		const closeBtn = modalEl.querySelector(".close");
		let stack = ["root"];

		function render(menuKey) {
			menuEl.innerHTML = "";
			const items = data[menuKey] || [];
			items.forEach(item => {
				const li = document.createElement("li");
				li.textContent = item.label;
				li.addEventListener("click", () => {
					if (item.type === "submenu") {
						stack.push(item.key);
						render(item.key);
					} else if (item.type === "image") {
						imageEl.src = item.src;
						menuEl.querySelectorAll("li").forEach(el => el.classList.remove("active"));
						li.classList.add("active");
					}
				});
				menuEl.appendChild(li);
			});
			backBtn.style.display = stack.length > 1 ? "block" : "none";
		}

		// open
		openers.forEach(opener => {
			opener.addEventListener("click", () => {
				modalEl.style.display = "flex";
				stack = ["root"];
				render("root");
				if (defaultImage) imageEl.src = defaultImage;
			});
		});

		// close
		closeBtn?.addEventListener("click", () => {
			modalEl.style.display = "none";
			imageEl.src = "";
		});

		// click outside to close
		window.addEventListener("click", (e) => {
			if (e.target === modalEl) {
				modalEl.style.display = "none";
				imageEl.src = "";
			}
		});

		// back
		backBtn.addEventListener("click", () => {
			if (stack.length > 1) {
				stack.pop();
				render(stack[stack.length - 1]);
			}
		});

		// toggle sidebar (< >)
		toggleBtn.addEventListener("click", () => {
			modalEl.classList.toggle("sidebar-hidden");
			toggleBtn.innerHTML = modalEl.classList.contains("sidebar-hidden")
				? "&#10095;"
				: "&#10094;";
		});

		return { render };
	}

	setupHierarchicalModal({
		openers: [document.getElementById("floorPlansBtn")].filter(Boolean),
		modalEl: document.getElementById("floorPlansModal"),
		menuEl: document.getElementById("floorMenu"),
		imageEl: document.getElementById("floorImage"),
		backBtn: document.getElementById("backBtn"),
		toggleBtn: document.getElementById("toggleSidebar"),
		data: floorData,
		defaultImage: "assets/images/ground_layout.png"
	});


	const plansOpeners = [];
	const plansTile = document.querySelector('.gallery-item[data-type="plans"]');
	if (plansTile) plansOpeners.push(plansTile);
	const plansBtn = document.getElementById("plansBtn");
	if (plansBtn) plansOpeners.push(plansBtn);

	function openPlans() {
		plansOpeners[0]?.dispatchEvent(new Event("click"));
	}

	setupHierarchicalModal({
		openers: plansOpeners,
		modalEl: document.getElementById("plansModal"),
		menuEl: document.getElementById("plansMenu"),
		imageEl: document.getElementById("plansImage"),
		backBtn: document.getElementById("plansBackBtn"),
		toggleBtn: document.getElementById("togglePlansSidebar"),
		data: plansData,
		defaultImage: "assets/images/plans/commercial1.png"
	});


	function highlightGalleryItem(selector) {
		document.querySelectorAll(".gallery-item").forEach(el => el.classList.remove("highlight"));
		const item = document.querySelector(selector);
		if (item) {
			item.classList.add("highlight");
			item.scrollIntoView({ behavior: "smooth", block: "center" });
			setTimeout(() => item.classList.remove("highlight"), 4000);
		}
	}


	const view360Link = document.querySelector('a[data-target="view360"]') || document.querySelector('a[href="#view360"]');
	if (view360Link) {
		view360Link.addEventListener("click", (e) => {
			e.preventDefault();
			document.querySelector("#gallery")?.scrollIntoView({ behavior: "smooth" });
			highlightGalleryItem('.gallery-item[data-key="view360"]');
		});
	}


	document.querySelectorAll('.dropdown-content a[data-target]').forEach(link => {
		link.addEventListener("click", (e) => {
			e.preventDefault();
			document.querySelector("#gallery")?.scrollIntoView({ behavior: "smooth" });

			document.querySelectorAll(".gallery-item").forEach(el => el.classList.remove("highlight"));

			const targetKey = link.getAttribute("data-target");
			const targetItem = document.querySelector(`.gallery-item[data-key="${targetKey}"]`);
			if (targetItem) {
				targetItem.classList.add("highlight");
				setTimeout(() => targetItem.classList.remove("highlight"), 4000);
			}
		});
	});

	const enquiryPopup = document.getElementById("enquiryPopup");
	const form = document.querySelector(".enquiry-form");
	const popupOverlay = document.querySelector(".popup-overlay");

	if (enquiryPopup && sessionStorage.getItem("popupAlreadySubmitted") !== "true") {
		setTimeout(() => enquiryPopup.classList.add("active"), 1000);
	}

	if (form) {
		form.addEventListener("submit", () => {
			sessionStorage.setItem("popupAlreadySubmitted", "true");
			setTimeout(() => {
				popupOverlay.classList.remove("active");
				form.reset();
			}, 100);
		});
	}

	if (sessionStorage.getItem("popupAlreadySubmitted") === "true") {
		popupOverlay?.classList.remove("active");
	}


	window.closePopup = function () {
		enquiryPopup?.classList.remove("active");
	};

	window.addEventListener("keydown", (e) => {
		if (e.key === "Escape") enquiryPopup?.classList.remove("active");
	});
	// SOCIAL ICONS -> Open Enquiry Popup instead of going to external site
	const socialIcons = document.querySelectorAll(".social-icons a");
	socialIcons.forEach(icon => {
		icon.addEventListener("click", (e) => {
			e.preventDefault(); // stop it from opening Instagram/Facebook/YouTube
			const enquiryPopup = document.getElementById("enquiryPopup");
			if (enquiryPopup) enquiryPopup.classList.add("active");
		});
	});

});
