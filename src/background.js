/**
 * запись даты заказов в localstorage из расширения для браузера
 */

const indexPageUrl = "https://www.aliexpress.com/p/order/index.html";

chrome.tabs.onActivated.addListener(async () => {
	await chrome.tabs.query({ active: true, lastFocusedWindow: true }).then((currenTab) => {
		let tab = currenTab[0];

		if (tab && tab.pendingUrl == indexPageUrl) {
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
