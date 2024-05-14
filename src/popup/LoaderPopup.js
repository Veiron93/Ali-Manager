class LoaderPopup extends HelpersPopup {
	container;

	constructor() {
		super();

		(async () => {
			await this.initElements();
		})();
	}

	initElements() {
		return new Promise((resolve) => {
			this.container = document.querySelector(".loader");

			resolve();
		});
	}
}
