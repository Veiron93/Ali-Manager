class TrackingNumber {
	constructor() {
		(async () => {
			if (this.getUriParams("trackingNumber")) {
				// запись трек-номера
				console.log(777);
				// await this.setTrackingNumberLocalStorage();
				// window.close();
			} else {
				// получение трек-номера
				await this.pageLoaded();
				this.getTrackingNumber();
			}
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

		//location.href = "https://www.aliexpress.com/p/?trackingNumber=" + trackNumber + "&tradeId=" + this.getUriParams("tradeId");

		//window.location.replace("https://www.aliexpress.com/p/?trackingNumber=" + trackNumber + "&tradeId=" + this.getUriParams("tradeId"));

		window.open("https://www.aliexpress.com/p/?trackingNumber=" + trackNumber + "&tradeId=" + this.getUriParams("tradeId"), "_blank");
		window.close();
	}

	setTrackingNumberLocalStorage() {
		return new Promise((resolve) => {
			let orders = localStorage.getItem("orders");
			let orderArr = JSON.parse(orders);

			let orderNumber = this.getUriParams("tradeId");
			let trackingNumber = this.getUriParams("trackingNumber");

			let indexOrder = orderArr.findIndex((order) => order.orderNumber == orderNumber);

			if (indexOrder == -1 || trackingNumber == null) {
				resolve();
			}

			orderArr[indexOrder].trackingNumber = trackingNumber;

			localStorage.setItem("orders", JSON.stringify(orderArr));

			resolve();
		});
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
