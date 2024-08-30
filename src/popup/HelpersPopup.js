class HelpersPopup {
	PUBLIC_API_HOST = "https://api.alimanager.ru";
	DEV_API_HOST = "http://alimanager-server.web";

	API_v1 = "/api/extension/v1";

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

	async clearStorageLocal() {
		await chrome.storage.local.clear();
	}

	async removeStorageLocal(key) {
		await chrome.storage.local.remove([key]);
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

	stateElementClass(element, state) {
		if (state) {
			element.classList.remove("hidden");
		} else {
			element.classList.add("hidden");
		}
	}

	async handlerResponse(response) {
		if (!response.ok) {
			return response.text().then((data) => {
				throw new Error(data);
			});
		}

		return response.json();
	}
}
