class AuthLoginPopup extends HelpersPopup {
	container;
	inputEmailElement;
	inputPassworElement;
	btnLoginElement;

	constructor() {
		super();

		(async () => {
			await this.initElements();
			await this.initEvents();
			await this.initState();
		})();
	}

	initElements() {
		return new Promise((resolve) => {
			this.container = document.querySelector(".auth-login");
			this.inputEmailElement = this.container.querySelector("input[name='email']");
			this.inputPassworElement = this.container.querySelector("input[name='password']");
			this.btnLoginElement = this.container.querySelector(".btn-login");

			resolve();
		});
	}

	async initEvents() {}

	async initState() {
		// const state = await this.getStorageLocal("isAuth");
		// if (!state) {
		// 	this.stateElementClass(this.container, true);
		// }
	}

	test() {
		console.log(333);
	}
}
