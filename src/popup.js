/**
 * расширение для браузера
 */

class Popup {
	api = "https://alimanager-server.web/api/v1";
	keyLicense = null;
	isAuth = false;

	errorAuth = {
		code: null,
		text: null,
	};

	// Elements
	// popup
	popupContainer = null;

	// auth
	authContainer = null;
	inputKeyAuthElement = null;
	btnSendKeyAuthElement = null;
	btnPaymentAuthElement = null;
	helpAuthElement = null;
	errorAuthElement = null;

	// app
	appContainer = null;
	inputDatesAppElement = null;
	btnSearchAppElement = null;
	btnClearDatesAppElement = null;
	btnLastSearchAppElement = null;
	paramsSearchAppElement = null;

	constructor() {
		(async () => {
			await Promise.all([this.getKeyAuth(), this.initElementsPopup(), this.initElementsAuth(), this.initElementsApp()]);

			await this.checkAuth();

			this.initEventsAuth();
			this.initEventsApp();
			this.initAuth();
			this.initApp();
		})();
	}

	async getKeyAuth() {
		await chrome.storage.local.get(["alimanagerKey"]).then((result) => {
			if (!result["alimanagerKey"]) {
				return false;
			}

			this.keyLicense = result["alimanagerKey"];
		});
	}

	initElementsPopup() {
		return new Promise((resolve) => {
			this.popupContainer = document.querySelector(".popup-wrapper");

			resolve();
		});
	}

	async checkAuth() {
		if (this.keyLicense) {
			this.isAuth = true;

			this.stateApp(true);

			return false;
			// let error = {
			// 	code: 1,
			// 	text: "Закончилась подписка",
			// };

			let error = {
				code: 0,
				text: "Ключ недействителен",
			};

			this.onErrorAuth(error);
			this.stateAuthHelp(false);
		} else {
			this.stateAuthHelp(true);
		}

		// return fetch(this.api + "/auth-extansion/", {
		// 	method: "POST",
		// 	headers: {
		// 		key: this.keyLicense,
		// 	},
		// })
		// 	.then((response) => response.json())
		// 	.then((result) => {
		// 		console.log(result);
		// 	});
	}

	initElementsAuth() {
		return new Promise((resolve) => {
			document.addEventListener("DOMContentLoaded", () => {
				this.authContainer = document.querySelector(".auth");
				this.inputKeyAuthElement = this.authContainer.querySelector("input[name='key-auth']");
				this.btnSendKeyAuthElement = this.authContainer.querySelector(".btn-send-key-auth");
				this.btnPaymentAuthElement = this.authContainer.querySelector(".btn-payment");
				this.helpAuthElement = this.authContainer.querySelector(".auth-help");
				this.errorAuthElement = this.authContainer.querySelector(".auth-error");

				resolve();
			});
		});
	}

	initEventsAuth() {
		// поле ввода ключа
		this.inputKeyAuthElement.addEventListener("input", () => {
			this.inputKeyAuthElement.value = this.inputKeyAuthElement.value.replace(/\s/g, "");

			let stateBtnSendKey = false;

			if (this.inputKeyAuthElement.value.length == 8) {
				stateBtnSendKey = true;
			} else {
				this.clearErrorAuth();
			}

			if (!this.inputKeyAuthElement.value.length) {
				this.stateAuthHelp(true);
			}

			this.stateBtnSendKey(stateBtnSendKey);
		});

		// кнопка отправки ключа
		this.btnSendKeyAuthElement.addEventListener("click", () => {
			let key = this.inputKeyAuthElement.value;

			if (!key) return false;

			chrome.storage.local.set({ ["alimanagerKey"]: key });

			this.checkAuth();
		});
	}

	initAuth() {
		if (this.keyLicense) {
			this.inputKeyAuthElement.value = this.keyLicense;
			this.stateBtnSendKey(true);
		}

		if (this.isAuth) {
			this.authContainer.remove();
		}
	}

	stateBtnSendKey(state = false) {
		if (state) {
			this.btnSendKeyAuthElement.removeAttribute("disabled");
		} else {
			this.btnSendKeyAuthElement.setAttribute("disabled", true);
		}
	}

	onErrorAuth(error) {
		this.isAuth = false;

		this.errorAuth.code = error.code;
		this.errorAuth.text = error.text;

		this.errorAuthElement.textContent = error.text;

		if (error.code == 1) {
			this.stateBtnPaymentAuth(true);
		}
	}

	clearErrorAuth() {
		this.errorAuth.code = null;
		this.errorAuth.text = null;

		this.errorAuthElement.textContent = "";
	}

	stateBtnPaymentAuth(state) {
		if (state) {
			this.btnPaymentAuthElement.classList.remove("hidden");
		} else {
			this.btnPaymentAuthElement.classList.add("hidden");
		}
	}

	stateAuthHelp(state) {
		if (state) {
			this.helpAuthElement.classList.remove("hidden");
		} else {
			this.helpAuthElement.classList.add("hidden");
		}
	}

	// APP
	initElementsApp() {
		return new Promise((resolve) => {
			document.addEventListener("DOMContentLoaded", () => {
				this.appContainer = document.querySelector(".app");

				this.inputDatesAppElement = this.appContainer.querySelector("#dates");
				this.btnSearchAppElement = this.appContainer.querySelector("#search");
				this.btnClearDatesAppElement = this.appContainer.querySelector("#clear-dates");
				this.btnLastSearchAppElement = this.appContainer.querySelector("#last-search");
				this.paramsSearchAppElement = this.appContainer.querySelectorAll(".params input");

				resolve();
			});
		});
	}

	initEventsApp() {
		// очистка поля ввода даты
		this.btnClearDatesAppElement.addEventListener("click", () => this.onClearDatesApp());

		// отслеживание поля ввода даты
		this.inputDatesAppElement.addEventListener("input", () => this.onChangeDatesApp());
	}

	stateApp(state) {
		if (state) {
			this.appContainer.classList.remove("hidden");
			//this.popupContainer.append(this.appContainer);
		} else {
			this.appContainer.classList.add("hidden");
			//this.appContainer.remove();
		}
	}

	onClearDatesApp() {
		this.clearStorageLocal("dates_am");
		this.inputDatesAppElement.value = "";

		this.stateBtnSearchApp(false);
	}

	stateBtnSearchApp(state) {
		if (state) {
			this.btnSearchAppElement.classList.remove("disabled");
		} else {
			this.btnSearchAppElement.classList.add("disabled");
		}
	}

	onChangeDatesApp() {
		this.setStorageLocal("dates_am", this.inputDatesAppElement.value.trim());

		if (this.inputDatesAppElement.value && this.btnSearchAppElement.classList.contains("disabled")) {
			this.stateBtnSearchApp(true);
		}

		if (!this.inputDatesAppElement.value) {
			this.stateBtnSearchApp(false);
		}
	}

	stateLastChecking(state) {
		if (state) {
			this.btnLastSearchAppElement.classList.remove("hidden");
		} else {
			this.btnLastSearchAppElement.classList.add("hidden");
		}
	}

	initApp() {
		// дата
		this.getStorageLocal("dates_am").then((result) => {
			if (result) {
				this.inputDatesAppElement.value = result;
				this.stateBtnSearchApp(true);
			}
		});

		// дата последней проверки заказа
		chrome.storage.local.get(["last_checked_ali_manager"]).then((result) => {
			this.btnLastSearchAppElement.textContent = result["last_checked_ali_manager"];
			this.stateLastChecking(true);
		});
	}

	// other

	setStorageLocal(key, value) {
		chrome.storage.local.set({ [key]: value });
	}

	async getStorageLocal(key) {
		let value = null;

		await chrome.storage.local.get([key]).then((result) => {
			value = result[key];
		});

		return value;
	}

	clearStorageLocal(key) {
		chrome.storage.local.remove([key]);
	}
}

new Popup();

document.addEventListener("DOMContentLoaded", () => {
	return false;

	let dates = document.getElementById("dates");
	let btnStart = document.getElementById("start");
	let btnClearDates = document.getElementById("clear-dates");
	let params = document.querySelectorAll(".params input");
	let lastChecking = document.querySelector(".last-checking");

	// let content = document.querySelector(".app-content");

	// document.querySelector(".app-content").remove();
	// document.querySelector(".app-wrapper").append(content);

	// console.log(content);

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
		setStorageLocal("dates_am", dates.value.trim());

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
	paramsChange();

	function init() {
		// дата
		getStorageLocal("dates_am").then((result) => {
			if (result) {
				dates.value = result;
				btnStart.classList.remove("disabled");
			}
		});

		// дата последней проверки заказа
		chrome.storage.local.get(["last_checked_ali_manager"]).then((result) => {
			lastChecking.querySelector("span").textContent = result["last_checked_ali_manager"];
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
