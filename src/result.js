class Result {
	constructor() {
		(async () => {
			await this.pageLoaded();
			await this.clearPage();
		})();
	}

	/**
	 * проверка загрузилась ли страница со всеми данными
	 * для определения берется заголовок
	 * @returns {Promise}
	 */

	pageLoaded() {
		return new Promise((resolve) => {
			let loadedIntervalId = setInterval(() => {
				if (document.querySelector("h1") == null) {
					loadedIntervalId;
				} else {
					clearInterval(loadedIntervalId);
					resolve();
				}
			}, 300);
		});
	}

	clearPage() {
		return new Promise((resolve) => {
			document.body.innerHTML = "";
			document.title = "Результат проверки заказов - Ali Manager";
			resolve();
		});
	}
}

new Result();
