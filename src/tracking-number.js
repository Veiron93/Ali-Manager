class TrackingNumber {
	constructor() {
		(async () => {
			// получение трек-номера
			await this.pageLoaded();
			this.getTrackingNumber();
		})();
	}

	/**
	 * проверка загрузилась ли страница со всеми данными
	 * для определения берется блок [стоимость заказа]
	 * @returns {Promise}
	 */

	pageLoaded() {
		return new Promise((resolve) => {
			let loadedIntervalId = setInterval(() => {
				if (document.querySelector(".right-content") == null) {
					loadedIntervalId;
				} else {
					clearInterval(loadedIntervalId);
					resolve();
				}
			}, 300);
		});
	}

	getTrackingNumber() {
		let trackNumberWrapper = document.querySelector(".tracking-no-de span");

		if (!trackNumberWrapper) {
			trackNumberWrapper = document.querySelector(".tracking-no span");
		}

		let trackNumber = trackNumberWrapper ? trackNumberWrapper.textContent : null;

		window.open(
			"https://www.aliexpress.com/p/?alimanager=1&trackingNumber=" + trackNumber + "&tradeId=" + this.getUriParams("tradeId"),
			"_blank"
		);
		window.close();
	}

	/**
	 * возвращает значение get параметра
	 * @param {String} param заказы
	 * @returns {String | Number}
	 */

	getUriParams(param) {
		let params = new URL(document.location).searchParams;
		return params.get(param);
	}
}

new TrackingNumber();
