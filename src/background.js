/**
 * запись даты заказов в localstorage из расширения для браузера
 */

const indexPathName = "/p/order/index.html";
const orderPathName = "/p/order/detail.html";
const resultPathName = "/p/";

chrome.tabs.onActivated.addListener(async () => {
	await chrome.tabs.query({ active: true, lastFocusedWindow: true }).then((currenTab) => {
		let tab = currenTab[0];

		// список заказов
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

				// дата проверки
				let dateNow = new Date();
				chrome.storage.local.set({
					["last_checked_ali_manager"]: dateNow.getDate() + "-" + (dateNow.getMonth() + 1) + "-" + dateNow.getFullYear(),
				});
			})();
		}

		// страница результата
		if (getPathNameTab(tab) == resultPathName) {
			chrome.scripting.executeScript({
				target: { tabId: tab.id },
				files: ["./src/result.js"],
			});
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
