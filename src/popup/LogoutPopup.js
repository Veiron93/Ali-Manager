class LogoutPopup extends HelpersPopup {
	btnLogoutElement;

	constructor() {
		super();

		(async () => {
			await this.initElements();
			this.initEvents();
			this.init();
		})();
	}

	initElements() {
		return new Promise((resolve) => {
			this.btnLogoutElement = document.querySelector(".btn-logout");
			resolve();
		});
	}

	initEvents() {
		this.btnLogoutElement.addEventListener("click", () => this.logout());
	}

	async init() {
		this.accessToken = await this.getStorageLocal("accessToken");

		if (this.accessToken) {
			this.stateElementClass(this.btnLogoutElement, true);
		}
	}

	async logout() {
		if (!this.accessToken) {
			return false;
		}

		await this.onLogout()
			.then((res) => this.handlerResponse(res))
			.then(this.successLogout())
			.catch((error) => this.failedLogout(error));
	}

	// выход
	onLogout() {
		return fetch(this.DEV_API_HOST + this.API_v1 + "/auth/logout", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: "Bearer " + this.accessToken,
			},
		});
	}

	async successLogout() {
		await this.clearStorageLocal();
		window.location.reload();
	}

	failedLogout(error) {
		console.log(error);
	}
}
