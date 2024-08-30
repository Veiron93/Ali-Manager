class LoginPopup extends HelpersPopup {
	container;
	keyElement;
	btnLoginElement;
	errorElement;

	constructor() {
		super();

		(async () => {
			await this.initElements();
			await this.initEvents();
			await this.init();
		})();
	}

	initElements() {
		return new Promise((resolve) => {
			this.container = document.querySelector(".login");
			this.keyElement = this.container.querySelector("input[name='key']");
			this.btnLoginElement = this.container.querySelector(".btn-login");
			this.errorElement = this.container.querySelector(".error");

			resolve();
		});
	}

	async initEvents() {
		// поле ввода ключа
		this.keyElement.addEventListener("input", () => this.stateBthLogin());

		// кнопка Войти
		this.btnLoginElement.addEventListener("click", () => this.logIn());
	}

	async init() {
		this.accessToken = await this.getStorageLocal("accessToken");

		if (!this.accessToken) {
			this.stateElementClass(this.container, true);
		}
	}

	logIn() {
		if (this.keyElement.value.length === 19) {
			window.loader.start();
			this.onAuth();
			this.stateElementDisabled(this.btnLoginElement, false);
		} else {
			this.onError("Введите корректный ключ авторизации");
		}
	}

	async onAuth() {
		fetch(this.DEV_API_HOST + this.API_v1 + "/auth", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				key: this.keyElement.value,
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
		await this.setStorageLocal("accessToken", data.token);
		await this.setStorageLocal("user", data.user);
		window.location.reload();
	}

	// состояние кнопки Войти
	stateBthLogin() {
		const state = this.keyElement.value.length === 19 ? true : false;
		this.stateElementDisabled(this.btnLoginElement, state);
	}

	// вывод ошибки
	onError(message = "") {
		this.errorElement.textContent = message;
	}
}
