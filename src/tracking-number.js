class TrackingNumbers {
	elementsPage = new Map([
		["pageWrapper", ".tracking-page-pc-wrap"],
		["trackingNumber", ".logistic-info--mailNo-pc--3cTqcXe span"],
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
		let time = Math.floor(Math.random() * (4 - 3 + 1)) + 3;

		setTimeout(async () => {
			await chrome.runtime.sendMessage({ orderTrackingNumbersComplete: this.trackingNumbers });
		}, time * 1000);
	}

	// getTraking(wrapper) {
	// 	let tracking = null;
	// 	let trackingWrapper = document.querySelector(wrapper);

	// 	if (trackingWrapper) {
	// 		tracking = this.removeCyrillicAndSpaces(trackingWrapper.textContent);
	// 	}

	// 	return tracking;
	// }

	/**
	 * @deprecated данная функция устарела так как поменялась страница отслеживания, но тут есть интересный код который может пригодиться
	 */
	// getTrackingNumbersOld() {
	// 	return new Promise((resolve) => {
	// 		const sections = [".tracking-no span", ".tracking-no-de span"];
	// 		const trackingsArr = [];

	// 		for (let i = 0; i < sections.length; i++) {
	// 			let tracknumber = this.getTraking(sections[i]);

	// 			if (tracknumber) {
	// 				trackingsArr.push(tracknumber);
	// 			}
	// 		}

	// 		const trackings = {
	// 			original: null,
	// 			combined: null,
	// 		};

	// 		if (trackingsArr.length == 1) {
	// 			trackings.original = trackingsArr[0];
	// 		}

	// 		if (trackingsArr.length == 2) {
	// 			trackings.original = trackingsArr[1];
	// 			trackings.combined = trackingsArr[0];
	// 		}

	// 		// перенаправление на основной домен, потому что разные urls у трекинга и страницы с результатами
	// 		let url = "https://www.aliexpress.com/p/?alimanager=1";
	// 		url += "&tradeId=" + this.getUriParams("tradeId");
	// 		url += "&originalTrackingNumber=" + trackings.original;
	// 		url += "&combinedTrackingNumber=" + trackings.combined;

	// 		// window.open(url, "_blank");
	// 		// window.close();

	// 		resolve();
	// 	});
	// }

	// removeCyrillicAndSpaces(str) {
	// 	return str.replace(/[а-яА-Я\s]/g, "");
	// }

	/**
	 * возвращает значение get параметра
	 * @param {String} param заказы
	 * @returns {String | Number}
	 */

	// getUriParams(param) {
	// 	let params = new URL(document.location).searchParams;
	// 	return params.get(param);
	// }
}

new TrackingNumbers();
