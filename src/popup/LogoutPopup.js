class LogoutPopup extends HelpersPopup {
	btnLogoutElement;

	constructor() {
		super();

		(async () => {
			await this.initElements();
			await this.initEvents();
		})();
	}

	initElements() {
		return new Promise((resolve) => {
			this.btnLogoutElement = document.querySelector(".btn-logout");
			resolve();
		});
	}

	initEvents() {
		return new Promise((resolve) => {
			this.btnLogoutElement.addEventListener("click", () => this.logout());
			resolve();
		});
	}

	async logout() {
		const authToken = await this.getStorageLocal("authToken");
		const user = await this.getStorageLocal("user");

		if (!authToken || !user || !user.email) {
			return false;
		}

		await this.onLogout(authToken, user.email)
			.then((res) => this.handlerResponse(res))
			.then(this.successLogout())
			.catch((error) => this.failedLogout(error));
	}

	// выход
	onLogout(authToken, email) {
		return fetch(this.DEV_API_HOST + this.API_v1 + "/auth/logout", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: "Bearer " + authToken,
			},
			body: JSON.stringify({
				email: email,
			}),
		});
	}

	async successLogout() {
		await this.setStorageLocal("isAuth", false);
		await this.clearStorageLocal("authToken");
		await this.clearStorageLocal("user");

		window.location.reload();
	}

	failedLogout(error) {
		console.log(error);
	}
}
