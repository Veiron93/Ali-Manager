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
		this.btnLoginElement.addEventListener("click", () => this.sendLogin());
	}

	sendLogin() {
		if (this.validationEmail(this.inputPasswordElement.value)) {
			this.stateElementClass(window.loader.container, true);
			this.stateElementDisabled(this.btnLoginElement, false);
			this.onAuth();
			this.onError();
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
			.then(async (response) => {
				if (!response.ok) {
					return response.text().then((data) => {
						throw new Error(data);
					});
				}

				return response.json();
			})
			.then((response) => {
				this.successLogin(response);
			})
			.catch((error) => {
				console.log(error);
			})
			.finally(() => {
				this.stateElementClass(window.loader.container, false);
				this.stateElementDisabled(this.btnLoginElement, true);
			});
	}

	successLogin(data) {
		// новый пользователь
		if (data.type == 1) {
			this.newUser(data.user);
		}

		// пользователь успешно аутентицирован
		if (data.type == 2) {
			// this.stateApp(true);
			// this.stateClassElement(false, this.loginWrapperAuthElement);
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
}
