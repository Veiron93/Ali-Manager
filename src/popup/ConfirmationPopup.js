class ConfirmationPopup extends HelpersPopup {
	container;
	userEmailElement;
	inputCodeElement;
	btnSendCodeElement;
	btnCancelElement;
	error;

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
			this.container = document.querySelector(".confirmation");
			this.userEmailElement = this.container.querySelector(".user-email");
			this.inputCodeElement = this.container.querySelector("input[name='confirmation-code']");
			this.btnSendCodeElement = this.container.querySelector(".btn-send-code");
			this.btnCancelElement = this.container.querySelector(".btn-cancel");
			this.error = this.container.querySelector(".error");

			resolve();
		});
	}

	async initEvents() {
		// поле ввода кода подтверждения
		this.inputCodeElement.addEventListener("input", () => this.stateBtnSendCode());

		// кнопка Отправить код
		this.btnSendCodeElement.addEventListener("click", () => this.sendCode());

		// кнопка Отмена
		this.btnCancelElement.addEventListener("click", () => this.cancel());
	}

	async init() {
		const user = await this.getStorageLocal("user");

		if (user && user.email) {
			this.userEmailElement.textContent = user.email;
		}
	}

	stateBtnSendCode() {
		let state = false;

		if (this.inputCodeElement.value.length === 4) {
			state = true;
		}

		this.stateElementDisabled(this.btnSendCodeElement, state);
	}

	async sendCode() {
		this.stateElementClass(window.loader.container, true);
		let user = await this.getStorageLocal("user");

		if (!user || !user.email) {
			this.onError("Ошибка, попробуйте ещё раз");
			return false;
		}

		this.onSend(user.email);
	}

	async onSend(email) {
		fetch(this.api + "/confirm-registration", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				email: email,
				code: this.inputCodeElement.value,
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
					this.successSendCode(response);
				}
			})
			.catch((error) => {
				this.onError(error);
				//console.log(error);
			})
			.finally(() => {
				this.stateElementClass(window.loader.container, false);
			});
	}

	cancel() {
		this.onError();
		this.clearStorageLocal("user");
		this.clearStorageLocal("waitingConfirmation");

		this.stateElementClass(this.container, false);
		this.stateElementClass(window.login.container, true);

		this.userEmailElement.textContent = "";
		this.inputCodeElement.value = "";
		this.stateElementDisabled(this.btnSendCodeElement, false);
	}

	successSendCode(data) {
		this.setStorageLocal("authToken", data.token);
		this.setStorageLocal("isAuth", true);
		this.clearStorageLocal("waitingConfirmation");
		this.stateElementClass(this.container, false);
		//this.stateApp(true);
		this.onError();
	}

	// вывод ошибки
	onError(message = "") {
		this.error.textContent = message;
	}
}
