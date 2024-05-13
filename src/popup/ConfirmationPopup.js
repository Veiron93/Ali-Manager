class ConfirmationPopup extends HelpersPopup {
	container;

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
			this.container = document.querySelector(".confirmation");

			resolve();
		});
	}

	async initEvents() {}

	async initState() {
		// const state = await this.getStorageLocal("waitingConfirmation");
		// if (state) {
		// 	this.stateElementClass(this.container, true);
		// }
	}
}
