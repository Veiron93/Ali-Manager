class HelpersPopup {
	api = "http://alimanager-server.web/api/app/v1";

	constructor() {}

	// Storage
	async getStorageLocal(key) {
		let value = null;

		await chrome.storage.local.get([key]).then((result) => {
			value = result[key];
		});

		return value;
	}

	async setStorageLocal(key, value) {
		await chrome.storage.local.set({ [key]: value });
	}

	stateElementClass(element, state) {
		if (state) {
			element.classList.remove("hidden");
		} else {
			element.classList.add("hidden");
		}
	}
}
