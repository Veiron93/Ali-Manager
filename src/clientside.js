/**
 * встраиваемый скрипт на сайт
 */

class GetOrders {
	// сслылки на страницы для парсинга
	indexUrl = "/p/order/index.html"; // список заказов
	detailUrl = "/p/order/detail.html"; // информация о заказе
	trackingUrl = "/logisticsdetail.htm"; // трекинг посылки

	// даты
	datesSingle = []; // конкретные даты
	datesFrom = []; // даты от
	datesRange = []; // даты от и до

	minDateOrder = null; // минимальная дата заказка
	maxDateOrder = null; // максимальная дата заказка

	// список заказов
	listOrders = [];
	listOrdersNode = [];
	listOrdersWrapper = null;

	constructor() {
		(async () => {
			this.init();

			await this.initBtnMoreOrders().then((value) => {
				this.btnMoreOrders = value;
			});

			await this.initListOrders().then((value) => this.listOrdersNode.push(...value));

			await this.getOrders();

			// await this.getDataOrders();
			// await this.setOrdersLocalStorage();

			//console.log(this.datesSingle);

			// await this.getOrdersData();
			// await this.getTrackingNumber();
		})();
	}

	init() {
		let dates = this.getDates();

		datesAliManager.initDates(dates);

		this.datesSingle = datesAliManager.datesSingle;
		this.datesFrom = datesAliManager.datesFrom;
		this.datesRange = datesAliManager.datesRange;
		this.minDateOrder = datesAliManager.minDate;
		this.maxDateOrder = datesAliManager.maxDate;
	}

	/**
	 * Возвращает даты заказов введеные пользователем в расширении
	 * @returns Array || null
	 */

	getDates() {
		let dates = localStorage.getItem("dates_am");
		return dates ? JSON.parse(dates) : null;
	}

	/**
	 * инициализация кнопки Показать больше заказов
	 * @returns Promise
	 */

	initBtnMoreOrders() {
		return new Promise((resolve) => {
			let btnMoreOrders = null;

			let findBtn = setInterval(() => {
				btnMoreOrders = document.querySelector(".order-more button");

				if (btnMoreOrders == null) {
					findBtn;
				} else {
					clearInterval(findBtn);
					resolve(btnMoreOrders);
				}
			}, 300);
		});
	}

	/**
	 * инициализация списка заказов
	 * @returns Promise
	 */

	initListOrders() {
		return new Promise((resolve) => {
			this.listOrdersWrapper = document.querySelector(".comet-checkbox-group");
			let orders = this.listOrdersWrapper.querySelectorAll(".order-item");
			resolve(orders);
		});
	}

	/**
	 * получение списка заказов
	 * @returns Promise
	 */

	getOrders() {
		return new Promise((resolve) => {
			let idInterval = setInterval(() => {
				// дата последнего заказа
				let lastOrderDate = this.getDateInOrder(this.listOrdersNode[this.listOrdersNode.length - 1]);

				let isLoadingOrders = this.compareDates(lastOrderDate, "min");

				// подгрузить ещё заказы
				if (isLoadingOrders) {
					this.btnMoreOrders.click();
					this.checkLoadingListOrder().then(() => this.setOrders());
				}

				// больше загрузка заказов не нужна
				if (!isLoadingOrders) {
					clearInterval(idInterval);

					// !!! на али некорректно показывается список заказов (напрмер: заказ 13 числа может оказаться между 12-ми числами)
					// информация была актуально от 1.09.23

					for (let i = this.listOrdersNode.length - 1; i >= 0; i--) {
						let dateOrder = this.getDateInOrder(this.listOrdersNode[i]);

						// 1. удаляем заказы которые меньше введеной минимальной даты
						if (!this.compareDates(dateOrder, "min")) {
							this.listOrdersNode.splice(i, 1);
						}

						// вот тут дописать

						// 2. удаляем заказы которые больше введеной максимальной даты
						// if (this.compareDates(dateOrder, "max")) {
						// 	this.listOrdersNode.splice(i, 1);
						// }
					}

					let ordersIndex = [];
					let rangeDates = [];

					// заказы формата От~До
					if (this.datesRange) {
						for (let i = 0; i <= this.datesRange.length - 1; i++) {
							let date_0 = this.datesRange[i].date_0.timestamp;
							let date_1 = this.datesRange[i].date_1.timestamp;

							while (date_0 <= date_1) {
								rangeDates.push(date_0);
								date_0 += 86400000;
							}
						}
					}

					for (let i = 0; i <= this.listOrdersNode.length - 1; i++) {
						let dateOrder = this.getDateInOrder(this.listOrdersNode[i]);
						let orderTimestamp = datesAliManager.convertDateAli(dateOrder, "timestamp");

						if (this.datesSingle.length > 0) {
							let index = this.datesSingle.findIndex((date) => date.timestamp == orderTimestamp);

							if (index != -1) {
								ordersIndex.push(i);
							}
						}

						if (this.datesRange.length > 0) {
							let index = rangeDates.findIndex((date) => date == orderTimestamp);

							if (index != -1) {
								ordersIndex.push(i);
							}
						}

						// вот тут дописать
						if (this.datesFrom.length > 0) {
							ordersIndex.push(i);
						}
					}

					ordersIndex = [...new Set(ordersIndex)];

					console.log(ordersIndex);

					let orders = [];

					for (let index of ordersIndex) {
						orders.push(this.listOrdersNode[index]);
					}

					resolve();
				}
			}, 300);
		});
	}

	/**
	 * получает данные о заказах
	 * @returns Promise
	 */

	getDataOrders() {
		return new Promise((resolve) => {
			let countOrders = this.listOrdersNode.length;
			let i = 0;

			Array.from(this.listOrdersNode).forEach((order) => {
				// дата заказа
				let dateOrder = order.querySelector(".order-item-header-right-info div:nth-child(1)").textContent;
				dateOrder = datesAliManager.formatingDateAliToRus(dateOrder.split(":")[1]);

				// номер заказа
				let orderNumber = order.querySelector(".order-item-header-right-info div:nth-child(2)").textContent;
				orderNumber = orderNumber.replace(/[^0-9]/g, "");

				this.listOrders.push({
					dateOrder: dateOrder,
					orderNumber: orderNumber,
				});

				i++;

				if (countOrders == i) {
					resolve();
				}
			});
		});
	}

	/**
	 * сравнивает дату заказа с минимальной и максимальной датой заказов
	 * @returns {Boolean}
	 */
	compareDates(orderDate, type) {
		let orderDateArr = orderDate.split(" ");

		//console.log(orderDateArr);

		let day = orderDateArr[1].slice(0, -1);
		let month = datesAliManager.monthNamesShort.indexOf(orderDateArr[0]) + 1;
		let year = orderDateArr[2];

		let orderDateObject = new Date(year + "-" + month + "-" + day);
		orderDateObject.setHours(0, 0, 0, 0);

		if (type == "min") {
			return this.minDateOrder <= orderDateObject.getTime() ? true : false;
		}

		if (type == "max") {
			return this.maxDateOrder < orderDateObject.getTime() ? true : false;
		}
	}

	/**
	 * дата заказа
	 * @param {Object} order
	 * @returns {String}
	 */

	getDateInOrder(order) {
		let orderInfo = order.querySelector(".order-item-header-right-info div:first-child").textContent;
		return orderInfo.split(":")[1].trim();
	}

	/**
	 * проверка, подгрузился ли список с заказами
	 * @returns {Promise}
	 */

	checkLoadingListOrder() {
		return new Promise((resolve) => {
			let idInterval = setInterval(() => {
				let orders = this.listOrdersWrapper.querySelectorAll(".order-item");

				if (orders.length != this.listOrdersNode.length) {
					clearInterval(idInterval);
					resolve();
				}
			}, 300);
		});
	}

	/**
	 * добавление заказов в список Node элементов
	 * @returns {void}
	 */

	setOrders() {
		let orders = this.listOrdersWrapper.querySelectorAll(
			".order-item:nth-child(n+" + (this.listOrdersNode.length + 1) + "):nth-child(-n+" + (this.listOrdersNode.length + 10) + ")"
		);

		this.listOrdersNode.push(...orders);
	}

	/**
	 * запись заказов в LocalStorage
	 * @returns {Promise}
	 */

	setOrdersLocalStorage() {
		return new Promise((resolve) => {
			let orders = [];

			this.listOrders.forEach((order) => {
				orders.push({
					orderNumber: order.orderNumber,
					dateOrder: order.dateOrder,
					trackingNumber: "",
				});

				if (orders.length == this.listOrders.length) {
					localStorage.setItem("orders", JSON.stringify(orders));
					resolve();
				}
			});
		});
	}

	/**
	 * получает информацию о заказе
	 * @returns {Promise}
	 */

	getOrdersData() {
		return new Promise(async (resolve) => {
			let i = 0;

			for (const order of this.listOrders) {
				window.open("https://www.aliexpress.com" + this.detailUrl + "?alimanager=1&orderId=" + order.orderNumber, "_blank");

				await this.checkComplete(order, "dataCompleted");

				i++;

				if (i == this.listOrders.length) {
					resolve();
				}
			}
		});
	}

	/**
	 * получает трек-номер заказа
	 * @returns {Promise}
	 */

	getTrackingNumber() {
		return new Promise(async (resolve) => {
			let i = 0;

			for (const order of this.listOrders) {
				window.open("https://track.aliexpress.com" + this.trackingUrl + "?alimanager=1&tradeId=" + order.orderNumber, "_blank");

				await this.checkComplete(order, "trackingNumberCompleted");

				i++;

				if (i == this.listOrders.length) {
					resolve();
				}
			}
		});
	}

	checkComplete(order, flagName) {
		return new Promise((resolve) => {
			let idIntarval = setInterval(() => {
				let orders = JSON.parse(localStorage.getItem("orders"));
				let actualOrder = orders.find((item) => item.orderNumber == order.orderNumber);

				if (actualOrder[flagName] == true) {
					clearInterval(idIntarval);
					resolve();
				}
			}, 500);
		});
	}
}

new GetOrders();
