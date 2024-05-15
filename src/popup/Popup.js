class Popup extends HelpersPopup {
	container;

	constructor() {
		super();

		(async () => {
			window.loader = new LoaderPopup();
			window.login = new AuthLoginPopup();
			window.confirmation = new ConfirmationPopup();
			window.searchOrders = new SearchOrdersPopup();

			await this.onAuth();
			await this.initElements();
			await this.init();
		})();
	}

	initElements() {
		return new Promise((resolve) => {
			this.container = document.querySelector(".auth-login");
			resolve();
		});
	}

	async onAuth() {
		await this.setStorageLocal("isAuth", true);
	}

	async init() {
		let isAuth = await this.getStorageLocal("isAuth");
		let waitingConfirmation = await this.getStorageLocal("waitingConfirmation");

		let showContainer = null;

		if (!isAuth) {
			showContainer = window.login.container;
		}

		if (isAuth) {
			showContainer = window.searchOrders.container;
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
