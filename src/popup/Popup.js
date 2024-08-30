class Popup extends HelpersPopup {
	accessToken;
	user;

	constructor() {
		super();

		(async () => {
			this.accessToken = await this.getStorageLocal("accessToken");
			this.user = await this.getStorageLocal("user");

			await this.checkAccessToken();

			window.loader = new LoaderPopup();
			window.login = new LoginPopup();
			window.searchOrders = new SearchOrdersPopup();
			window.logout = new LogoutPopup();
			window.subscriptionPopup = new SubscriptionPopup();
		})();
	}

	async checkAccessToken() {
		if (!this.accessToken) {
			return false;
		}

		return fetch(this.DEV_API_HOST + this.API_v1 + "/auth/check-token", {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				Authorization: "Bearer " + this.accessToken,
			},
		})
			.then((res) => this.handlerResponse(res))
			.then((res) => {
				if (!res) this.clearStorageLocal();
			})
			.catch(() => this.clearStorageLocal());
	}
}

document.addEventListener("DOMContentLoaded", () => new Popup());
