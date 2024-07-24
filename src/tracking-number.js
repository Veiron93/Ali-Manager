class TrackingNumbers {
	elementsPage = new Map([
		["pageWrapper", ".tracking-page-pc-wrap"],
		["trackingNumber", ".logistic-info--mailNo-pc--3cTqcXe div span"],
	]);

	trackingNumbers = {
		original: null,
	};

	constructor() {
		(async () => {
			// 1. проверка, на загрузку страницы
			await this.checkPageLoaded();

			// 2. получение трек-номера
			await this.getTrackingNumbers();

			// 3. отправляем собранные данные в background.js
			await this.sendOrderTrackingNumbers();
		})();
	}

	/**
	 * проверка загрузилась ли страница со всеми данными
	 * для определения берется блок [стоимость заказа]
	 * @returns {Promise}
	 */

	checkPageLoaded() {
		return new Promise((resolve) => {
			let loadedIntervalId = setInterval(() => {
				if (document.querySelector(this.elementsPage.get("pageWrapper"))) {
					clearInterval(loadedIntervalId);
					resolve();
				}
			}, 100);
		});
	}

	getTrackingNumbers() {
		return new Promise((resolve) => {
			let trackingNumberElement = document.querySelector(this.elementsPage.get("trackingNumber"));

			if (trackingNumberElement) {
				this.trackingNumbers.original = trackingNumberElement.textContent;
			}

			resolve();
		});
	}

	async sendOrderTrackingNumbers() {
		// генерируем рандомное число для того что бы не обновлять страницу слишком часто
		// иначе будет подозрение на парсинг и заблокируют доступ к сайту
		let time = Math.floor(Math.random() * (4 - 3 + 1)) + 2;

		setTimeout(async () => {
			await chrome.runtime.sendMessage({ orderTrackingNumbersComplete: this.trackingNumbers });
		}, time * 1000);
	}
}

{
	new TrackingNumbers();
}
