/**
 * расширение для браузера
 */

//chrome.action.setPopup({ popup: "/src/popup2.html" });

class Popup {
	api = "http://alimanager-server.web/api/app/v1";

	isAuth = false;

	authToken = null;
	user = false;

	waitingConfirmReg = false;

	// ELEMENTS
	// Popup
	popupContainer = null;
	btnLogoutElement = null;

	// Auth
	authContainer = null;
	errorAuthElement = null;

	// login
	loginWrapperAuthElement = null;
	inputEmailAuthElement = null;
	inputPasswordAuthElement = null;
	btnSendAuthElement = null;

	// confirmation code
	confirmationCodeWrapperAuthElement = null;
	specifiedEmailAuthElement = null;
	inputConfirmationCodeAuthElement = null;
	btnSendConfirmationCodeAuthElement = null;
	btnCancelConfirmationCodeAuthElement = null;

	// App
	appContainer = null;
	inputDatesAppElement = null;
	btnSearchAppElement = null;
	btnClearDatesAppElement = null;
	lastSearchAppElement = null;
	paramsSearchAppElement = null;
	documentationAppElement = null;
	btnDocumentationMoreAppElement = null;

	constructor() {
		(async () => {
			await Promise.all([this.onIsAuth(), this.initElementsPopup(), this.initElementsAuth(), this.initElementsApp()]);

			this.initEventsPopup();
			this.initEventsAuth();
			this.initEventsApp();

			this.initPopup();
			this.initAuth();
			this.initApp();

			///////// это для тестов
			// this.btnSend = document.getElementById("send");

			// this.btnSend.addEventListener("click", () => {
			// 	chrome.runtime.sendMessage({ send: true });
			// });
		})();
	}

	// INIT ELEMENTS
	// popup
	initElementsPopup() {
		return new Promise((resolve) => {
			document.addEventListener("DOMContentLoaded", () => {
				this.popupContainer = document.querySelector(".popup-wrapper");
				this.btnLogoutElement = this.popupContainer.querySelector(".btn-logout");

				resolve();
			});
		});
	}

	// auth
	initElementsAuth() {
		return new Promise((resolve) => {
			document.addEventListener("DOMContentLoaded", () => {
				this.authContainer = document.querySelector(".auth");
				this.errorAuthElement = this.authContainer.querySelector(".auth-error");

				// login
				this.loginWrapperAuthElement = this.authContainer.querySelector(".auth-login");
				this.inputEmailAuthElement = this.loginWrapperAuthElement.querySelector("input[name='email']");
				this.inputPasswordAuthElement = this.loginWrapperAuthElement.querySelector("input[name='password']");
				this.btnSendAuthElement = this.loginWrapperAuthElement.querySelector(".btn-send-auth");

				// confirmation code
				this.confirmationCodeWrapperAuthElement = this.authContainer.querySelector(".auth-confirmation-code");
				this.specifiedEmailAuthElement = this.confirmationCodeWrapperAuthElement.querySelector(".specified-email");
				this.inputConfirmationCodeAuthElement = this.confirmationCodeWrapperAuthElement.querySelector("input[name='confirmation-code']");
				this.btnSendConfirmationCodeAuthElement = this.confirmationCodeWrapperAuthElement.querySelector(".btn-send-confirmation-code");
				this.btnCancelConfirmationCodeAuthElement = this.confirmationCodeWrapperAuthElement.querySelector(".btn-cancel-confirmation-code");

				resolve();
			});
		});
	}

	// app
	initElementsApp() {
		return new Promise((resolve) => {
			document.addEventListener("DOMContentLoaded", () => {
				this.appContainer = document.querySelector(".app");
				this.inputDatesAppElement = this.appContainer.querySelector("#dates");
				this.btnSearchAppElement = this.appContainer.querySelector("#search");
				this.btnClearDatesAppElement = this.appContainer.querySelector("#clear-dates");
				this.lastSearchAppElement = this.appContainer.querySelector("#last-search");
				this.paramsSearchAppElement = this.appContainer.querySelectorAll(".params input");
				this.documentationAppElement = this.appContainer.querySelector(".documentation");
				this.btnDocumentationMoreAppElement = this.documentationAppElement.querySelector(".documentation_btn-more");

				resolve();
			});
		});
	}

	// INIT EVENTS
	// popup
	initEventsPopup() {
		// очистка поля ввода даты
		this.btnLogoutElement.addEventListener("click", () => this.onLogout());
	}

	// auth
	initEventsAuth() {
		// login
		this.inputEmailAuthElement.addEventListener("input", () => this.stateBthAuth());
		this.inputPasswordAuthElement.addEventListener("input", () => this.stateBthAuth());

		// confirmation
		// кнопка Войти
		this.btnSendAuthElement.addEventListener("click", () => {
			if (this.validationEmail(this.inputEmailAuthElement.value)) {
				this.onAuth();
			} else {
				this.onErrorAuth("Некорректный формат электронной почты");
			}
		});

		// кнопка Отмена
		this.btnCancelConfirmationCodeAuthElement.addEventListener("click", () => this.cancelRegistration());

		// поле ввода кода подтверждения
		this.inputConfirmationCodeAuthElement.addEventListener("input", () => {
			this.stateElementDisabled(
				this.inputConfirmationCodeAuthElement.value.length === 4 ? true : false,
				this.btnSendConfirmationCodeAuthElement
			);
		});

		// кнопка отправки кода подтверждения
		this.btnSendConfirmationCodeAuthElement.addEventListener("click", () => this.confirmRegistration());
	}

	// app
	initEventsApp() {
		// поиск
		this.btnSearchAppElement.addEventListener("click", () => this.sendStartSearchApp());

		// очистка поля ввода даты
		this.btnClearDatesAppElement.addEventListener("click", () => this.onClearDatesApp());

		// отслеживание поля ввода даты
		this.inputDatesAppElement.addEventListener("input", () => this.onChangeDatesApp());

		// документация
		this.btnDocumentationMoreAppElement.addEventListener("click", () => this.stateDocumentationApp());
	}

	// INIT
	// popup
	initPopup() {
		if (this.isAuth) {
			this.stateClassElement(true, this.btnLogoutElement);
		}
	}

	// auth
	async initAuth() {
		// console.log("2");

		this.user = await this.getStorageLocal("user");
		this.waitingConfirmReg = await this.getStorageLocal("waitingConfirmReg");

		this.stateClassElement(this.isAuth ? false : true, this.authContainer);

		// форма авторизации/регистрации
		if (!this.isAuth && !this.waitingConfirmReg) {
			this.stateClassElement(true, this.loginWrapperAuthElement);

			if (this.user.email) {
				this.inputEmailAuthElement.value = this.user.email;
			}
		}

		// форма подтверждения регистрации
		if (!this.isAuth && this.waitingConfirmReg) {
			this.specifiedEmailAuthElement.textContent = this.user.email;
			this.stateClassElement(true, this.confirmationCodeWrapperAuthElement);
		}
	}

	// app
	initApp() {
		if (this.isAuth) {
			this.stateClassElement(true, this.appContainer);
		}

		// дата
		this.getStorageLocal("datesSearch").then((result) => {
			if (result) {
				this.inputDatesAppElement.value = result.join("\n");
				this.stateBtnSearchApp(true);
			}
		});

		this.onLastSearch();
	}

	onLogout() {
		this.clearStorageLocal("isAuth");
		this.appContainer.remove();
		this.popupContainer.append(this.authContainer);
		this.stateClassElement(false, this.btnLogoutElement);
	}

	async onAuth() {
		// сделать прелоадер отправки данных
		fetch(this.api + "/auth", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				email: this.inputEmailAuthElement.value,
				password: this.inputPasswordAuthElement.value,
			}),
		})
			.then(async (response) => {
				if (!response.ok) {
					return response.text().then((data) => {
						throw new Error(data);
					});
				}

				return response.json();
			})
			.then((response) => {
				if (response.type == 1) {
					this.newUser(response.user);
				}

				if (response.type == 2) {
					this.stateApp(true);
					this.stateClassElement(false, this.loginWrapperAuthElement);
				}
			})
			.catch((error) => {
				console.log(error);
			});
	}

	stateApp(state) {
		this.waitingConfirmReg = false;
		this.clearStorageLocal("waitingConfirmReg");

		if (state) {
			this.isAuth = true;

			this.setStorageLocal("isAuth", true);
			this.setStorageLocal("authToken", response.token);

			this.stateClassElement(true, this.appContainer);
		} else {
			this.isAuth = false;

			this.setStorageLocal("isAuth", false);
			this.clearStorageLocal("authToken");

			this.stateClassElement(false, this.appContainer);
		}
	}

	async newUser(userData) {
		return new Promise((resolve) => {
			this.user = userData;

			this.setStorageLocal("user", userData);
			this.setStorageLocal("waitingConfirmReg", true);
			this.specifiedEmailAuthElement.textContent = userData.email;

			this.stateClassElement(false, this.loginWrapperAuthElement);
			this.stateClassElement(true, this.confirmationCodeWrapperAuthElement);

			resolve();
		});
	}

	async onIsAuth() {
		return new Promise(async (resolve) => {
			//console.log(1);

			this.authToken = await this.getStorageLocal("authToken");
			this.user = await this.getStorageLocal("user");

			if (!this.authToken) {
				resolve();
				return false;
			}

			fetch(this.api + "/is-auth", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: "Bearer " + this.authToken,
				},
				body: JSON.stringify({ email: this.user.email }),
			})
				.then(async (response) => {
					if (!response.ok) {
						return response.text().then((data) => {
							throw new Error(data);
						});
					}

					return response.json();
				})
				.then((response) => {
					//this.stateApp(true);

					this.isAuth = true;
					this.setStorageLocal("isAuth", true);

					resolve();
				})
				.catch((error) => {
					console.log(error);
					resolve();
				});
		});
	}

	cancelRegistration() {
		this.onErrorAuth();
		this.user = false;
		this.clearStorageLocal("user");
		this.clearStorageLocal("waitingConfirmReg");
		this.stateClassElement(false, this.confirmationCodeWrapperAuthElement);
		this.stateClassElement(true, this.loginWrapperAuthElement);

		this.specifiedEmailAuthElement.textContent = "";
		this.inputConfirmationCodeAuthElement.value = "";
		this.stateElementDisabled(false, this.btnSendConfirmationCodeAuthElement);
	}

	// состояние кнопки Войти
	stateBthAuth() {
		this.stateElementDisabled(
			this.inputEmailAuthElement.value.length > 5 && this.inputPasswordAuthElement.value.length > 5 ? true : false,
			this.btnSendAuthElement
		);
	}

	async confirmRegistration() {
		fetch(this.api + "/confirm-registration", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				email: this.user.email,
				code: this.inputConfirmationCodeAuthElement.value,
			}),
		})
			.then(async (response) => {
				if (!response.ok) {
					return response.text().then((data) => {
						throw new Error(data);
					});
				}

				return response.json();
			})
			.then((response) => {
				if (response.token) {
					this.setStorageLocal("authToken", response.token);
					this.stateClassElement(false, this.confirmationCodeWrapperAuthElement);
					this.stateApp(true);
					this.onErrorAuth();
				}
			})
			.catch((error) => {
				this.onErrorAuth(error);
				//console.log(error);
			});
	}

	stateElementDisabled(state, element) {
		if (state) {
			element.removeAttribute("disabled");
		} else {
			element.setAttribute("disabled", true);
		}
	}

	validationEmail(email) {
		// const regex = /^a-zA-Z0-9._%+-+@a-zA-Z0-9.-+\.a-zA-Z{2,}$/;
		// return regex.test(email);

		return true;
	}

	onErrorAuth(errorText = "") {
		this.errorAuthElement.textContent = errorText;
	}

	// APP
	stateApp(state) {
		if (state) {
			this.appContainer.classList.remove("hidden");
			//this.popupContainer.append(this.appContainer);
		} else {
			this.appContainer.classList.add("hidden");
			//this.appContainer.remove();
		}
	}

	sendStartSearchApp() {
		chrome.runtime.sendMessage({ startSearch: true });
	}

	onClearDatesApp() {
		this.clearStorageLocal("datesSearch");
		this.inputDatesAppElement.value = "";

		this.stateBtnSearchApp(false);
	}

	validationDatesApp() {
		this.inputDatesAppElement.value = this.inputDatesAppElement.value.replace(/[^0-9~\-\s\n]/g, "");
	}

	stateBtnSearchApp(state) {
		if (state) {
			this.btnSearchAppElement.removeAttribute("disabled");
		} else {
			this.btnSearchAppElement.setAttribute("disabled", true);
		}
	}

	onChangeDatesApp() {
		this.validationDatesApp();
		this.setStorageLocal("datesSearch", this.inputDatesAppElement.value.split("\n"));

		if (this.inputDatesAppElement.value && this.btnSearchAppElement.hasAttribute("disabled")) {
			this.stateBtnSearchApp(true);
		}

		if (!this.inputDatesAppElement.value) {
			this.stateBtnSearchApp(false);
		}
	}

	stateDocumentationApp() {
		this.documentationAppElement.classList.toggle("active");
	}

	// дата последней проверки заказа
	onLastSearch() {
		chrome.storage.local.get(["lastSearchOrders"]).then((result) => {
			if (result["lastSearchOrders"]) {
				this.lastSearchAppElement.textContent = "Последний поиск: " + result["lastSearchOrders"];
			}
		});
	}

	// other
	async setStorageLocal(key, value) {
		await chrome.storage.local.set({ [key]: value });
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

	stateClassElement(state, element) {
		if (state) {
			element.classList.remove("hidden");
		} else {
			element.classList.add("hidden");
		}
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
		chrome.storage.local.get(["lastSearchOrders"]).then((result) => {
			lastChecking.querySelector("span").textContent = result["lastSearchOrders"];
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
