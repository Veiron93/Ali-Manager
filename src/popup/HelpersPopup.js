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

	async clearStorageLocal(key) {
		await chrome.storage.local.remove([key]);
	}

	stateElementClass(element, state) {
		if (state) {
			element.classList.remove("hidden");
		} else {
			element.classList.add("hidden");
		}
	}

	stateElementDisabled(element, state) {
		if (state) {
			element.removeAttribute("disabled");
		} else {
			element.setAttribute("disabled", true);
		}
	}

	validationEmail() {
		return true;
	}
}
