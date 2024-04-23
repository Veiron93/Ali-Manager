class TrackingNumber {
	constructor() {
		(async () => {
			// получение трек-номера
			await this.pageLoaded();
			this.getTrackingNumbers();
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

	getTraking(wrapper) {
		let tracking = null;
		let trackingWrapper = document.querySelector(wrapper);

		if (trackingWrapper) {
			tracking = this.removeCyrillicAndSpaces(trackingWrapper.textContent);
		}

		return tracking;
	}

	getTrackingNumbers() {
		const sections = [".tracking-no span", ".tracking-no-de span"];
		const trackingsArr = [];

		for (let i = 0; i < sections.length; i++) {
			let tracknumber = this.getTraking(sections[i]);

			if (tracknumber) {
				trackingsArr.push(tracknumber);
			}
		}

		const trackings = {
			original: null,
			combined: null,
		};

		if (trackingsArr.length == 1) {
			trackings.original = trackingsArr[0];
		}

		if (trackingsArr.length == 2) {
			trackings.original = trackingsArr[1];
			trackings.combined = trackingsArr[0];
		}

		// перенаправление на основной домен, потому что разные urls у трекинга и страницы с результатами
		let url = "https://www.aliexpress.com/p/?alimanager=1";
		url += "&tradeId=" + this.getUriParams("tradeId");
		url += "&originalTrackingNumber=" + trackings.original;
		url += "&combinedTrackingNumber=" + trackings.combined;

		window.open(url, "_blank");
		window.close();
	}

	removeCyrillicAndSpaces(str) {
		return str.replace(/[а-яА-Я\s]/g, "");
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
