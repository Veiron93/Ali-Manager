class SubscriptionPopup extends HelpersPopup {
	container;
	emailElement;

	constructor() {
		super();

		(async () => {
			await this.getSubscription();
			await this.initElements();
			await this.init();
		})();
	}

	initElements() {
		return new Promise((resolve) => {
			this.container = document.querySelector(".subscription");

			this.emailElement = this.container.querySelector(".subscription_user-email");
			resolve();
		});
	}

	async init() {
		// пользователь
		const user = await this.getStorageLocal("user");

		if (user && user.email) {
			this.emailElement.innerHTML = user.email;
		}
	}

	async getSubscription() {
		const authToken = await this.getStorageLocal("authToken");
		const user = await this.getStorageLocal("user");

		if (!authToken || !user || !user.email) {
			return false;
		}

		await this.onSubscription(authToken, user.email);
	}

	async onSubscription(authToken, email) {
		return fetch(this.DEV_API_HOST + this.API_v1 + "/subscription/user/" + email, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				Authorization: "Bearer " + authToken,
			},
		})
			.then((res) => this.handlerResponse(res))
			.then(() => this.successGetSubscription(res))
			.catch((error) => this.failedGetSubscription(error));
	}

	async successGetSubscription(subscriptionData) {
		//await this.setStorageLocal("subscription", subscriptionData);
		// if (1 == 1) {
		// 	this.stateElementClass(window.searchOrders.container, false);
		// }
	}

	async failedGetSubscription() {}
}
