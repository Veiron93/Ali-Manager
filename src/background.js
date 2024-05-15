// страница отслеживания посылки
const trackUrl = "https://www.aliexpress.com/p/tracking/index.html?alimanager=track-number&tradeOrderId=";

let activeTab = null;
let orders = null;
let ordersData = [];
let indexOrder = 0;
const trackings = new Map();

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
		}
	}

	// Получает данные о заказе
	// все заказы записываем в массив
	// когда получены все заказы, то записываем в storage и закрываем активную вкладку
	// а так же запускаем сбор трек-кодов посылок
	if (request.orderDataComplete) {
		ordersData.push(request.orderDataComplete);

		if (indexOrder === orders.length - 1) {
			// 1. закрываем активную вкладку после получения данных о заказах
			chrome.tabs.remove(activeTab.id, () => {
				activeTab = null;
				indexOrder = 0;
				setStorage("ordersData", ordersData);
			});

			// !!! - можно сделать опционально
			// 2. запуск сбор трек-кодов отслеживания посылок
			startGetOrdersTrackNumbers();
		} else {
			indexOrder++;
			getOrderData();
		}
	}

	// получает трек-коды отслеживания посылок
	if (request.orderTrackingNumbersComplete) {
		let result = request.orderTrackingNumbersComplete;

		trackings.set(orders[indexOrder].orderNumber, {
			original: result.original,
		});

		if (indexOrder === orders.length - 1) {
			chrome.tabs.remove(activeTab.id, async () => {
				activeTab = null;
				indexOrder = 0;

				await addTrackingsToOrders();
				//await sendResult();
			});
		} else {
			indexOrder++;
			getOrderTrackNumbers();
		}
	}

	// темка для тестирования - удалить
	if (request.send) {
		await sendResult();
	}
});

chrome.tabs.onUpdated.addListener(async () => {
	// обновение данных активной вкладки
	await chrome.tabs.query({ active: true }).then((tabs) => (activeTab = tabs[0]));

	let page = getUriParams(activeTab, "alimanager");
	let pageStatus = activeTab.status;

	// страница данных о заказе - RU версия
	if (page === "order" && pageStatus === "complete") {
		addFilesTab(activeTab, ["./src/order-ru.js"]);
	}

	// страница трек-кода посылки
	if (page === "track-number" && pageStatus === "complete") {
		addFilesTab(activeTab, ["./src/tracking-number.js"]);
	}
});

function sendResult() {
	return new Promise(async (resolve) => {
		const orders = await getStorage("ordersData");

		fetch("http://alimanager-server.web/v1/result", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: "Bearer " + (await getStorage("auth-token")),
			},
			body: JSON.stringify(orders),
		})
			.then((response) => response.json())
			.then((data) => {
				console.log("Response:", data);
			})
			.catch((error) => {
				console.log(error);
			});

		resolve();
	});
}

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
	let dateLastSearch =
		dateNow.getDate() + "." + (dateNow.getMonth() + 1) + "." + dateNow.getFullYear() + " " + dateNow.getHours() + ":" + dateNow.getMinutes();

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

function addTrackingsToOrders() {
	return new Promise((resolve) => {
		if (!ordersData) {
			resolve();
			return false;
		}

		let i = 0;

		ordersData.forEach((order) => {
			i++;

			order.trackings = trackings.get(order.number);

			if (ordersData.length == i) {
				setStorage("ordersData", ordersData);
				resolve();
			}
		});
	});
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
