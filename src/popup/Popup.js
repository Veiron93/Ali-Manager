class Popup extends HelpersPopup {
	container;

	constructor() {
		super();

		(async () => {
			window.login = new AuthLoginPopup();
			window.confirmation = new ConfirmationPopup();

			await this.onAuth();
			await this.initElements();
			await this.init();
		})();
	}

	initElements() {
		return new Promise((resolve) => {
			this.container = document.querySelector(".auth-login");
			console.log(this.container);
			resolve();
		});
	}

	async onAuth() {
		await this.setStorageLocal("isAuth", false);
		//await this.setStorageLocal("waitingConfirmation", true);
	}

	async init() {
		let isAuth = await this.getStorageLocal("isAuth");
		let waitingConfirmation = await this.getStorageLocal("waitingConfirmation");

		let showContainer = null;

		if (!isAuth) {
			showContainer = window.login.container;
		}

		if (isAuth) {
			// поиск
		}

		if (waitingConfirmation) {
			showContainer = window.confirmation.container;
		}

		this.stateElementClass(showContainer, true);
	}
}

document.addEventListener("DOMContentLoaded", () => {
	new Popup();
});
