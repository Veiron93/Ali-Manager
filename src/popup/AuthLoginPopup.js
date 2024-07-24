class AuthLoginPopup extends HelpersPopup {
	container;
	inputEmailElement;
	inputPasswordElement;
	btnLoginElement;
	error;

	constructor() {
		super();

		(async () => {
			await this.initElements();
			await this.initEvents();
		})();
	}

	initElements() {
		return new Promise((resolve) => {
			this.container = document.querySelector(".auth-login");
			this.inputEmailElement = this.container.querySelector("input[name='email']");
			this.inputPasswordElement = this.container.querySelector("input[name='password']");
			this.btnLoginElement = this.container.querySelector(".btn-login");
			this.error = this.container.querySelector(".error");

			resolve();
		});
	}

	async initEvents() {
		this.inputEmailElement.addEventListener("input", () => this.stateBthLogin());
		this.inputPasswordElement.addEventListener("input", () => this.stateBthLogin());

		// кнопка Войти
		this.btnLoginElement.addEventListener("click", () => this.logIn());
	}

	logIn() {
		const validEmail = this.validationEmail(this.inputPasswordElement.value);

		if (validEmail) {
			window.loader.start();
			this.onAuth();
			this.stateElementDisabled(this.btnLoginElement, false);
		} else {
			this.onError("Некорректный формат электронной почты");
		}
	}

	async onAuth() {
		fetch(this.DEV_API_HOST + this.API_v1 + "/auth", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				email: this.inputEmailElement.value,
				password: this.inputPasswordElement.value,
			}),
		})
			.then((res) => this.handlerResponse(res))
			.then((response) => {
				this.successLogin(response);
			})
			.catch((error) => {
				this.onError(error);
			})
			.finally(() => {
				window.loader.stop();
				this.stateElementDisabled(this.btnLoginElement, true);
			});
	}

	async successLogin(data) {
		// новый пользователь
		if (data.type == 1) {
			await this.clearUserDataStore();
			await this.newUser(data.user);
		}

		// пользователь успешно вошел
		if (data.type == 2) {
			// удкление данных если зашел другой пользователь
			const lastUser = await this.getStorageLocal("user");

			if (lastUser && lastUser.email !== data.user.email) {
				await this.clearUserDataStore();
			}

			await this.setStorageLocal("authToken", data.authToken);
			await this.setStorageLocal("user", data.user);

			window.location.reload();
		}
	}

	async newUser(userData) {
		return new Promise((resolve) => {
			this.setStorageLocal("user", userData);
			this.setStorageLocal("waitingConfirmation", true);

			window.confirmation.userEmailElement.textContent = userData.email;

			this.stateElementClass(this.container, false);
			this.stateElementClass(window.confirmation.container, true);

			resolve();
		});
	}

	// состояние кнопки Войти
	stateBthLogin() {
		let state = false;

		if (this.inputEmailElement.value.length > 5 && this.inputPasswordElement.value.length > 5) {
			state = true;
		}

		this.stateElementDisabled(this.btnLoginElement, state);
	}

	// вывод ошибки
	onError(message = "") {
		this.error.textContent = message;
	}

	// очистка данных если зашли под другим пользователем
	clearUserDataStore() {
		return new Promise((resolve) => {
			const userDataStorage = ["codeResultSearchOrders", "datesSearch", "lastSearchOrders"];

			userDataStorage.forEach((element, index) => {
				this.clearStorageLocal(element);

				if (index === userDataStorage.length - 1) {
					resolve();
				}
			});
		});
	}
}
