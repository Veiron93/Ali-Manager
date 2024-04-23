const indexPathName = "/p/order/index.html"; // страница списка заказов
const orderPathName = "/p/order/detail.html"; // страница просмотра заказа
const trackingPathName = "/logisticsdetail.htm"; // страница отслеживания посылки

const blankPathName = "/p/";

chrome.tabs.onActivated.addListener(async () => {
	await chrome.tabs.query({ active: true, lastFocusedWindow: true }).then((currenTab) => {
		let tab = currenTab[0];

		if (!getUriParams(tab, "alimanager")) {
			return false;
		}

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

		//console.log(getPathNameTab(tab));
		if (getPathNameTab(tab) == blankPathName) {
			chrome.scripting.executeScript({
				target: { tabId: tab.id },
				files: ["./src/result.js"],
			});

			chrome.scripting.insertCSS({
				target: { tabId: tab.id },
				files: ["./src/result.css"],
			});
		}
	});
});

chrome.tabs.onCreated.addListener(() => {
	chrome.tabs.query({ active: true, lastFocusedWindow: true }).then((currenTab) => {
		let tab = currenTab[0];

		if (!getUriParams(tab, "alimanager")) {
			return false;
		}

		// страница информации о заказе
		if (getPathNameTab(tab) == orderPathName) {
			chrome.scripting.executeScript({
				target: { tabId: tab.id },
				files: ["./src/order-data.js"],
			});
		}

		// трек-номер
		if (getPathNameTab(tab) == trackingPathName) {
			chrome.scripting.executeScript({
				target: { tabId: tab.id },
				files: ["./src/tracking-number.js"],
			});
		}

		// запись трек-номера
		if (getUriParams(tab, "originalTrackingNumber") || getUriParams(tab, "combinedTrackingNumber")) {
			chrome.scripting.executeScript({
				target: { tabId: tab.id },
				files: ["./src/set-tracking-number.js"],
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

/**
 * возвращает значение get параметра
 * @param {String} param заказы
 * @returns {String | Number}
 */

function getUriParams(tab, param) {
	if (!tab.pendingUrl) {
		return false;
	}

	let params = new URL(tab.pendingUrl).searchParams;
	return params.get(param);
}
