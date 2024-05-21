class Tests {
	btnTestTracking;

	constructor() {
		this.initElements();
		this.initEvents();
	}

	initElements() {
		this.btnTestTracking = document.querySelector(".test-tracking");
	}

	initEvents() {
		this.btnTestTracking.addEventListener("click", () => {
			chrome.runtime.sendMessage({ send: true });
		});
	}
}

document.addEventListener("DOMContentLoaded", () => {
	new Tests();
});
