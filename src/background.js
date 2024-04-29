const indexPathName = "/p/order/index.html"; // страница списка заказов
//const orderPathName = "/p/order/detail.html"; // страница просмотра заказа
const orderPathName = "order-list"; // страница просмотра заказа
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

		// if (getPageNameRu(tab) == orderPathName) {
		// 	console.log(tab);

		// }
	});
});

let scriptInjectedOrderData = false;

chrome.tabs.onUpdated.addListener(() => {
	chrome.tabs.query({ active: true }).then((currenTab) => {
		//console.log(currenTab[0]);
		//&& currenTab[0].status == "complete"

		//console.log(9999);

		let tab = currenTab[0];

		if (getPageNameRu(currenTab[0]) == orderPathName) {
			if (!scriptInjectedOrderData) {
				scriptInjectedOrderData = true;

				//console.log(tab);

				console.log(111);

				chrome.scripting.executeScript({
					target: { tabId: currenTab[0].id },
					files: ["./src/order-data-ru.js"],
				});
			}
		}
	});
});

// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
// 	if (message.scriptInjected) {
// 		// Скрипт был встроен
// 		console.log("Скрипт был встроен");
// 	} else {
// 		// Скрипт не был встроен
// 		console.log("Скрипт не был встроен");
// 	}
// });

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	if (request.orderDataComplete) {
		console.log(request.orderDataComplete);
	}

	// if (request.scriptInjectedPage) {
	// 	scriptInjectedOrderData = false;

	// 	console.log(scriptInjectedOrderData);
	// }

	// if (request.stopLoadPage) {
	// 	chrome.tabs.query({ active: true }).then((currenTab) => {
	// 		chrome.tabs.update(currenTab[0].id, { url: "" }, function (tab) {
	// 			// Tab loading stopped
	// 			console.log("страница остановлена");
	// 		});
	// 	});
	// }

	//console.log(request);
	//console.log("Received message from content script:", request);
	// Handle the message and send a response if necessary
	//sendResponse({ message: "Response from background script" });
});

chrome.tabs.onCreated.addListener(() => {
	chrome.tabs.query({ active: true, lastFocusedWindow: true }).then((currenTab) => {
		let tab = currenTab[0];

		if (!getUriParams(tab, "alimanager")) {
			return false;
		}

		// страница информации о заказе
		// if (getPageNameRu(tab) == orderPathName) {
		// 	console.log(tab);

		// 	chrome.scripting.executeScript({
		// 		target: { tabId: tab.id },
		// 		files: ["./src/order-data-ru.js"],
		// 	});
		// }

		// chrome.scripting.executeScript({
		// 	target: { tabId: tab.id },
		// 	files: ["./src/order-data-ru.js"],
		// });

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

function getPageNameRu(tab) {
	let urlString = tab.url;

	if (!urlString) {
		return false;
	}

	let url = new URL(urlString);
	let pathname = url.pathname;

	let pathnameArr = pathname.split("/");

	return pathnameArr[1];
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
