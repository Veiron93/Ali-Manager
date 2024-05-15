class SetTrackingNumber {
	constructor() {
		(async () => {
			await this.setTrackingNumberLocalStorage();
			this.closeTab();
		})();
	}

	setTrackingNumberLocalStorage() {
		return new Promise((resolve) => {
			let orders = localStorage.getItem("orders");
			let orderArr = JSON.parse(orders);

			let orderNumber = this.getUriParams("tradeId");

			let trackings = {
				original: null,
				combined: null,
			};

			let originalTrackingNumberValue = this.getUriParams("originalTrackingNumber");
			let combinedTrackingNumberValue = this.getUriParams("combinedTrackingNumber");

			if (originalTrackingNumberValue != "null") {
				trackings.original = originalTrackingNumberValue;
			}

			if (combinedTrackingNumberValue != "null") {
				trackings.combined = combinedTrackingNumberValue;
			}

			let indexOrder = orderArr.findIndex((order) => order.orderNumber == orderNumber);

			if (indexOrder == -1) {
				resolve();
			}

			orderArr[indexOrder].trackings = trackings;
			orderArr[indexOrder].trackingNumberCompleted = true;

			localStorage.setItem("orders", JSON.stringify(orderArr));

			resolve();
		});
	}

	closeTab() {
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

new SetTrackingNumber();
