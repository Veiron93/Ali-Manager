/**
 * расширение для браузера
 */

document.addEventListener("DOMContentLoaded", () => {
	let dates = document.getElementById("dates");
	let btnCheckOrders = document.getElementById("btn-check-orders");
	let btnStart = document.getElementById("start");
	let btnClearDates = document.getElementById("clear-dates");

	let params = document.querySelectorAll(".params input");

	let testWrapper = document.querySelector(".test");

	// инициализация расширения
	init();

	// очистка поля ввода даты
	btnClearDates.addEventListener("click", () => {
		clearStorageLocal("dates_am");
		dates.value = "";
		btnStart.classList.add("disabled");
	});

	// отслеживание поля ввода даты
	dates.addEventListener("input", () => {
		setStorageLocal("dates_am", dates.value);

		if (dates.value && btnStart.classList.contains("disabled")) {
			btnStart.classList.remove("disabled");
		}

		if (!dates.value) {
			btnStart.classList.add("disabled");
		}
	});

	// отслеживание параметров
	// параметры
	paramsInit();
	//clearStorageLocal("params_dates_am");
	paramsChange();

	function init() {
		// дата
		getStorageLocal("dates_am").then((result) => {
			if (result) {
				dates.value = result;
				btnStart.classList.remove("disabled");
			}
		});
	}

	function paramsInit() {
		getStorageLocal("params_dates_am").then((result) => {
			if (result && result.length != params.length) {
				console.log("хранилище очищено");
				clearStorageLocal("params_dates_am");
				return false;
			}

			if (result) {
				for (const item of result) {
					let param = Array.from(params).find((p) => p.name == Object.keys(item));

					if (param) {
						param.checked = item[param.name];
					}
				}
			} else {
				let paramsArr = [];

				for (const item of params) {
					paramsArr.push({
						[item.name]: item.checked ? true : false,
					});

					if (paramsArr.length == params.length) {
						setStorageLocal("params_dates_am", paramsArr);
					}
				}
			}
		});
	}

	function paramsChange() {
		Array.from(params).forEach((param) =>
			param.addEventListener("change", () => {
				getStorageLocal("params_dates_am").then((result) => {
					let index = result.findIndex((item) => Object.keys(item) == param.name);

					if (index != -1) {
						result[index][param.name] = param.checked;
						setStorageLocal("params_dates_am", result);
					}
				});
			})
		);
	}

	// валидация введеных пользоватлем дат
	// function validationDates(dates) {
	// 	return new Promise((resolve) => {
	// 		let datesArr = dates.split(" ");

	// 		testWrapper.textContent = JSON.stringify(datesArr);

	// 		// for (const date of dates) {
	// 		// }

	// 		resolve();
	// 	});
	// }

	// Методы для работы с хранилищем Chrome
	// запись в хранилище
	function setStorageLocal(key, value) {
		chrome.storage.local.set({ [key]: value });
	}

	// получение данных их хранилища
	async function getStorageLocal(key) {
		let value = null;

		await chrome.storage.local.get([key]).then((result) => {
			value = result[key];
		});

		return value;
	}

	// удаление данных из хранилища
	function clearStorageLocal(key) {
		chrome.storage.local.remove([key]);
	}
});

// class PopupAliManage {
// 	currenTab = null;

// 	constructor() {
// 		(async () => {
// 			await this.getCurrentTab().then((result) => (this.currenTab = result));

// 			//test.textContent = tab.url;
// 		})();
// 	}

// 	// активная вкладка
// 	async getCurrentTab() {
// 		let queryOptions = { active: true };
// 		let tabs = await chrome.tabs.query(queryOptions);
// 		return tabs[0];
// 	}
// }

// new PopupAliManage();

// document.addEventListener("DOMContentLoaded", () => {
// 	let test = document.querySelector(".test");

// 	let currenTab = null;

// 	(async () => {
// 		await getCurrentTab().then((result) => (currenTab = result));

// 		test.textContent = JSON.stringify(currenTab);
// 	})();

// 	// активная вкладка
// 	async function getCurrentTab() {
// 		let queryOptions = { active: true };
// 		let tabs = await chrome.tabs.query(queryOptions);
// 		return tabs[0];
// 	}

// 	// chrome.tabs.query({ active: true }, function (tabs) {
// 	// 	let tab = tabs[0];

// 	// 	if (tab) {
// 	// 		//let pathName = location.pathname;
// 	// 		// test.textContent = JSON.stringify(tab);
// 	// 		pageActiveUrl = tab.url;
// 	// 		test.textContent = pageActiveUrl;
// 	// 	}

// 	// 	// if (tab) {
// 	// 	// 	chrome.scripting.executeScript(
// 	// 	// 		{
// 	// 	// 			target: { tabId: tab.id, allFrames: true },
// 	// 	// 			func: grabImages,
// 	// 	// 		},
// 	// 	// 		onResult
// 	// 	// 	);
// 	// 	// } else {
// 	// 	// 	alert("There are no active tabs");
// 	// 	// }
// 	// });

// 	// const btnCheckOrders = document.getElementById("btn-check-orders");

// 	// let test = document.querySelector(".test");

// 	// document.getElementById("btn-check-orders").addEventListener("click", () => {
// 	// 	chrome.tabs.query({ active: true }, function (tabs) {
// 	// 		var tab = tabs[0];

// 	// 		if (tab) {
// 	// 			//let pathName = location.pathname;
// 	// 			//test.textContent = JSON.stringify(tab);

// 	// 			test.textContent = tab.url;

// 	// 			//console.log(777)
// 	// 		}

// 	// 		// if (tab) {
// 	// 		// 	chrome.scripting.executeScript(
// 	// 		// 		{
// 	// 		// 			target: { tabId: tab.id, allFrames: true },
// 	// 		// 			func: grabImages,
// 	// 		// 		},
// 	// 		// 		onResult
// 	// 		// 	);
// 	// 		// } else {
// 	// 		// 	alert("There are no active tabs");
// 	// 		// }
// 	// 	});
// 	// });

// 	// document.getElementById("btn-check-orders").addEventListener("click", myFunction);
// 	// chrome.storage.local.get(["test"]).then((result) => {
// 	// 	//console.log("Value currently is " + result.key);
// 	// 	document.querySelector("#dates").value = result.test;
// 	// 	//www.innerHTML = result.test;
// 	// });
// 	// function myFunction() {
// 	// 	let btn = document.querySelector("#btn-check-orders");
// 	// 	// if (btn) {
// 	// 	// 	btn.textContent = "поменяли текст";
// 	// 	// }
// 	// 	let data = document.querySelector("#dates").value;
// 	// 	let dates = document.querySelector(".test");
// 	// 	chrome.storage.local.set({ test: data });
// 	// 	//chrome.storage.local.clear();
// 	// }
// });
