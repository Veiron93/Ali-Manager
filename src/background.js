/**
 * запись даты заказов в localstorage из расширения для браузера
 */

const indexPathName = "/p/order/index.html";
const orderPathName = "/p/order/detail.html";

chrome.tabs.onActivated.addListener(async () => {
	await chrome.tabs.query({ active: true, lastFocusedWindow: true }).then((currenTab) => {
		let tab = currenTab[0];

		if (getPathNameTab(tab) == indexPathName) {
			(async () => {
				let dates = null;

				await chrome.storage.local.get(["dates_am"]).then((result) => {
					dates = result["dates_am"];
				});

				await chrome.scripting.executeScript({
					target: { tabId: tab.id },
					func: (dates) => {
						localStorage.setItem("dates_am", dates);
					},
					args: [JSON.stringify(dates.split("\n"))],
				});

				await chrome.scripting.executeScript({
					target: { tabId: tab.id },
					files: ["./src/dates.js"],
				});

				await chrome.scripting.executeScript({
					target: { tabId: tab.id },
					files: ["./src/clientside.js"],
				});
			})();
		}
	});
});

chrome.tabs.onCreated.addListener(() => {
	chrome.tabs.query({ active: true, lastFocusedWindow: true }).then((currenTab) => {
		let tab = currenTab[0];

		// страница информации о заказе
		if (getPathNameTab(tab) == orderPathName) {
			chrome.scripting.executeScript({
				target: { tabId: tab.id },
				files: ["./src/order-data.js"],
			});
		}
	});
});

/**
 * pathname tab
 * @param {Object} tab
 * @returns {String, Boolean}
 */

function getPathNameTab(tab) {
	let urlString = tab.pendingUrl;

	if (!urlString) {
		return false;
	}

	let url = new URL(urlString);

	return url ? url.pathname : false;
}
