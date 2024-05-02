//const indexPathName = "/p/order/index.html"; // страница списка заказов
//const blankPathName = "/p/";

//https://www.aliexpress.com/p/tracking/index.html?spm=a2g0o.order_detail.order_detail_item.2.1043f19cjO8JHB&_addShare=no&_login=yes&tradeOrderId=5354579456413465

//const orderPathName = "/p/order/detail.html"; // страница просмотра заказа
//const orderPathName = "/order-list/"; // страница просмотра заказа

// chrome.tabs.onActivated.addListener(async () => {
// 	await chrome.tabs.query({ active: true, lastFocusedWindow: true }).then((currenTab) => {
// 		let tab = currenTab[0];

// 		if (!getUriParams(tab, "alimanager")) {
// 			return false;
// 		}

// 		// список заказов
// 		// if (getPathNameTab(tab) == indexPathName) {
// 		// 	(async () => {
// 		// 		let dates = null;

// 		// 		await chrome.storage.local.get(["datesSearch"]).then((result) => {
// 		// 			dates = result["datesSearch"];
// 		// 		});

// 		// 		// это можно удлаить после перехода на storage
// 		// 		await chrome.scripting.executeScript({
// 		// 			target: { tabId: tab.id },
// 		// 			func: (dates) => {
// 		// 				localStorage.setItem("datesSearch", dates);
// 		// 			},
// 		// 			args: [JSON.stringify(dates.split("\n"))],
// 		// 		});
// 		// 		// --

// 		// 		await chrome.scripting.executeScript({
// 		// 			target: { tabId: tab.id },
// 		// 			files: ["./src/dates.js"],
// 		// 		});

// 		// 		await chrome.scripting.executeScript({
// 		// 			target: { tabId: tab.id },
// 		// 			files: ["./src/orders.js"],
// 		// 		});

// 		// 		// дата проверки
// 		// 		let dateNow = new Date();

// 		// 		chrome.storage.local.set({
// 		// 			["lastSearchOrders"]: dateNow.getDate() + "-" + (dateNow.getMonth() + 1) + "-" + dateNow.getFullYear(),
// 		// 		});
// 		// 	})();
// 		// }

// 		// страница результата -- вскоре убрать при переходе на свой сайт
// 		if (getPathNameTab(tab) == blankPathName) {
// 			chrome.scripting.executeScript({
// 				target: { tabId: tab.id },
// 				files: ["./src/result.js"],
// 			});

// 			chrome.scripting.insertCSS({
// 				target: { tabId: tab.id },
// 				files: ["./src/result.css"],
// 			});
// 		}
// 		// --
// 	});
// });

// страница отслеживания посылки
const trackUrl = "https://www.aliexpress.com/p/tracking/index.html?alimanager=track-number&tradeOrderId=";

let activeTab = null;
let orders = null;
let ordersData = [];
let indexOrder = 0;
const trackings = new Map();

//let stopScriptInjectedOrderData = false;

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
	// запуск поиска
	if (request.startSearch) {
		await chrome.tabs
			.create({
				url: "https://www.aliexpress.com/p/order/index.html",
			})
			.then((tab) => (activeTab = tab));

		await addFilesTab(activeTab, ["./src/dates.js", "./src/orders.js"]);

		// записываем дату поиска
		setDateSearch();

		// await chrome.scripting.executeScript({
		// 	target: { tabId: activeTab.id },
		// 	files: ["./src/dates.js", "./src/orders.js"],
		// });

		//let datesSearch = null;
		//await chrome.storage.local.get(["datesSearch"]).then((result) => (datesSearch = result["datesSearch"]));

		//let datesSearch = await getStorage("datesSearch");
		//await setStorage("datesSearch", datesSearch.split("\n"));

		//await setStorage("datesSearch", );

		// это можно удалить после перехода на storage
		// await chrome.scripting.executeScript({
		// 	target: { tabId: activeTab.id },
		// 	func: (dates) => {
		// 		localStorage.setItem("datesSearch", datesSearch);
		// 	},
		// 	args: [JSON.stringify(dates.split("\n"))],
		// });
		// --
	}

	// получает список заказов и запускает сбор данных
	// открываем сразу страницу с логином, иначе если открыть просто страницу с заказом, то встраиваемый скрипт не будет работать
	if (request.ordersComplete) {
		orders = await getStorage("orders");

		if (orders) {
			chrome.tabs.update(activeTab.id, {
				url:
					"https://login.aliexpress.ru/?flag=1&return_url=https%3A%2F%2Faliexpress.ru%2Forder-list%2F" +
					orders[0].orderNumber +
					"%3Falimanager%3Dorder",
			});

			// .then(() => {
			// 	let i = false;
			// 	let idInterval = setInterval(() => {
			// 		chrome.tabs.query({ active: true }).then((tabs) => {
			// 			//console.log(tabs[0]);
			// 			if (tabs[0].status == "complete" && i) {
			// 				i = true;
			// 				clearInterval(idInterval);
			// 				activeTab.stepAlimanager = "orderData";
			// 			}
			// 		});
			// 	}, 10);
			// });

			// chrome.tabs.create({
			// 	url:
			// 		"https://login.aliexpress.ru/?flag=1&return_url=https%3A%2F%2Faliexpress.ru%2Forder-list%2F" +
			// 		orders[0].orderNumber +
			// 		"%3Falimanager%3Dorder",
			// });
		}
	}

	// возвращает данные о заказе
	if (request.orderDataComplete) {
		ordersData.push(request.orderDataComplete);
		//stopScriptInjectedOrderData = false;

		if (indexOrder === orders.length - 1) {
			// 1. закрываем активную вкладку после получения данных о заказах
			chrome.tabs.remove(activeTab.id, () => {
				activeTab = null;
				indexOrder = 0;
				setStorage("ordersData", ordersData);
			});

			// 2. запуск сбор трек-кодов отслеживания посылок
			startGetOrdersTrackNumbers();
		} else {
			indexOrder++;
			getOrderData();
		}
	}

	// возращает трек-коды отслеживания посылок
	if (request.orderTrackingNumbersComplete) {
		let result = request.orderTrackingNumbersComplete;

		trackings.set(orders[indexOrder].orderNumber, {
			original: result.original,
		});

		if (indexOrder === orders.length - 1) {
			chrome.tabs.remove(activeTab.id, () => {
				activeTab = null;
				indexOrder = 0;
				console.log(trackings);
				//setStorage("ordersData", ordersData);
			});
		} else {
			indexOrder++;
			getOrderTrackNumbers();
		}
	}
});

chrome.tabs.onUpdated.addListener(async () => {
	// обновение данных активной вкладки
	await chrome.tabs.query({ active: true }).then((tabs) => (activeTab = tabs[0]));

	// страница данных о заказе - RU версия
	if (getUriParams(activeTab, "alimanager") === "order" && activeTab.status === "complete") {
		addFilesTab(activeTab, ["./src/order-ru.js"]);
		// chrome.scripting.executeScript({
		// 	target: { tabId: activeTab.id },
		// 	files: ["./src/order-ru.js"],
		// });

		// if (stopScriptInjectedOrderData) {
		// 	return null;
		// }

		// stopScriptInjectedOrderData = true;
	}

	// страница трек-кода посылки
	if (getUriParams(activeTab, "alimanager") === "track-number" && activeTab.status === "complete") {
		addFilesTab(activeTab, ["./src/tracking-number.js"]);
		//console.log(activeTab);
	}
});

/**
 * Выполняет скрипт из указанной вкладки.
 *
 * @param {Object} tab - Объект вкладки, в которой будет выполнен скрипт.
 * @param {Array} files - Массив путей к файлам скриптов для выполнения.
 * @return {Promise}
 */

function addFilesTab(tab, files) {
	return chrome.scripting.executeScript({
		target: { tabId: tab.id },
		files: files,
	});
}

function setDateSearch() {
	let dateNow = new Date();
	let dateLastSearch = dateNow.getDate() + "-" + (dateNow.getMonth() + 1) + "-" + dateNow.getFullYear();

	setStorage("lastSearchOrders", dateLastSearch);
}

function getOrderData() {
	chrome.tabs.update(activeTab.id, { url: "https://aliexpress.ru/order-list/" + orders[indexOrder].orderNumber + "?alimanager=order" });
}

function startGetOrdersTrackNumbers() {
	chrome.tabs.create({
		url: trackUrl + orders[0].orderNumber,
	});
}

function getOrderTrackNumbers() {
	chrome.tabs.update(activeTab.id, { url: trackUrl + orders[indexOrder].orderNumber });
}

async function setStorage(key, value) {
	await chrome.storage.local.set({ [key]: value });
}

async function getStorage(key) {
	let value = null;

	await chrome.storage.local.get([key]).then((result) => (value = result[key]));

	return value;
}

// chrome.tabs.onCreated.addListener(() => {
// 	chrome.tabs.query({ active: true, lastFocusedWindow: true }).then((currenTab) => {
// 		let tab = currenTab[0];

// 		if (!getUriParams(tab, "alimanager")) {
// 			return false;
// 		}

// 		// страница информации о заказе
// 		// if (getPageNameRu(tab) == orderPathName) {
// 		// 	console.log(tab);

// 		// 	chrome.scripting.executeScript({
// 		// 		target: { tabId: tab.id },
// 		// 		files: ["./src/order-data-ru.js"],
// 		// 	});
// 		// }

// 		// chrome.scripting.executeScript({
// 		// 	target: { tabId: tab.id },
// 		// 	files: ["./src/order-data-ru.js"],
// 		// });

// 		// трек-номер
// 		if (getPathNameTab(tab) == trackingPathName) {
// 			chrome.scripting.executeScript({
// 				target: { tabId: tab.id },
// 				files: ["./src/tracking-number.js"],
// 			});
// 		}

// 		// запись трек-номера
// 		if (getUriParams(tab, "originalTrackingNumber") || getUriParams(tab, "combinedTrackingNumber")) {
// 			chrome.scripting.executeScript({
// 				target: { tabId: tab.id },
// 				files: ["./src/set-tracking-number.js"],
// 			});
// 		}
// 	});
// });

/**
 * pathname tab
 * @param {Object} tab
 * @returns {String, Boolean}
 */

// function getPathNameTab(tab) {
// 	let urlString = tab.pendingUrl;

// 	if (!urlString) {
// 		return false;
// 	}

// 	let url = new URL(urlString);

// 	return url ? url.pathname : false;
// }

/**
 * возвращает значение get параметра
 * @param {String} param заказы
 * @returns {String | Number}
 */

function getUriParams(tab, param) {
	let url = null;

	if (tab.url) url = tab.url;
	if (tab.pendingUrl) url = tab.pendingUrl;

	//console.log(url);

	if (!url) {
		return false;
	}

	let params = new URL(url).searchParams;
	return params.get(param);
}

// function getPageNameRu(tab) {
// 	let urlString = tab.url;

// 	if (!urlString) {
// 		return false;
// 	}

// 	let url = new URL(urlString);
// 	let pathname = url.pathname;

// 	let pathnameArr = pathname.split("/");

// 	return pathnameArr[1];
// }
