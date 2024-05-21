class Popup extends HelpersPopup {
	container;

	constructor() {
		super();

		(async () => {
			window.loader = new LoaderPopup();
			window.login = new AuthLoginPopup();
			window.confirmation = new ConfirmationPopup();
			window.searchOrders = new SearchOrdersPopup();
			window.logout = new LogoutPopup();

			await this.checkAuthToken();
			await this.initElements();
			await this.init();
		})();
	}

	initElements() {
		return new Promise((resolve) => {
			this.container = document.querySelector(".popup");
			resolve();
		});
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

	// проверка токена
	async checkAuthToken() {
		return new Promise(async (resolve) => {
			const authToken = await this.getStorageLocal("authToken");
			const user = await this.getStorageLocal("user");

			if (!authToken || !user || !user.email) {
				resolve();
				return false;
			}

			await this.onCheckAuthToken(user.email, authToken);
			resolve();
		});
	}

	onCheckAuthToken(email, authToken) {
		return new Promise(async (resolve) => {
			fetch(this.DEV_API_HOST + this.API_v1 + "/check-auth-token", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: "Bearer " + authToken,
				},
				body: JSON.stringify({
					email: email,
				}),
			})
				.then((res) => this.handlerResponse(res))
				.then(() => this.successIsActiveToken())
				.catch((error) => this.failedIsActiveToken(error))
				.finally(() => resolve());
		});
	}

	async successIsActiveToken() {
		await this.setStorageLocal("isAuth", true);
		this.stateElementClass(window.logout.btnLogoutElement, true);
	}

	async failedIsActiveToken(error) {
		await this.setStorageLocal("isAuth", false);
	}
}

document.addEventListener("DOMContentLoaded", () => new Popup());
