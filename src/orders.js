/**
 * встраиваемый скрипт на главную страницу списка заказов
 */

class Orders {
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
			// 1. инициализация дат
			await this.initDates();

			// 2. инициализация кнопки "Больше заказов"
			await this.initBtnMoreOrders().then((value) => (this.btnMoreOrders = value));

			// 3. инициализация списка заказов + (возвращает заказы (nodes) с первой страницы)
			await this.initListOrders().then((value) => this.listOrdersNode.push(...value));

			// 4. возвращает список заказов отфильтрованный по датам
			await this.getNodesOrders();

			// 5. получает базовые данные о заказах (дата, номер)
			await this.getBaseDataOrders();

			// 6. записывает в storage базовые данные о заказах
			await this.setStorage("orders", this.listOrders);

			// 7. сообщает что все заказы найдены
			await this.sendOrdersComplete();
		})();
	}

	async initDates() {
		return new Promise(async (resolve) => {
			let dates = await this.getStorage("datesSearch");

			datesAliManager.initDates(dates);

			this.datesSingle = datesAliManager.datesSingle;
			this.datesFrom = datesAliManager.datesFrom;
			this.datesRange = datesAliManager.datesRange;
			this.minDateOrder = datesAliManager.minDate;
			this.maxDateOrder = datesAliManager.maxDate;

			resolve();
		});
	}

	/**
	 * Возвращает даты заказов введеные пользователем в расширении
	 * @returns Array || null
	 */

	getDates() {
		let dates = localStorage.getItem("datesSearch");
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
			}, 100);
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

	getNodesOrders() {
		return new Promise((resolve) => {
			let idInterval = setInterval(() => {
				// дата последнего заказа
				let lastOrderDate = this.getDateInOrder(this.listOrdersNode[this.listOrdersNode.length - 1]);
				let lastOrderDateTimestamp = datesAliManager.convertDateAli(lastOrderDate, "timestamp");

				let isLoadingOrders = this.minDateOrder <= lastOrderDateTimestamp ? true : false;

				// подгрузить ещё заказы
				if (isLoadingOrders) {
					this.btnMoreOrders.click();
					this.checkLoadingListOrder().then(() => this.setOrders());

					return;
				}

				// больше загрузка заказов не нужна
				if (!isLoadingOrders) {
					clearInterval(idInterval);

					// !!! на али некорректно показывается список заказов (напрмер: заказ 13 числа может оказаться между 12-ми числами)
					// информация была актуально от 1.09.23

					// 1. удаляем заказы которые меньше минимальной даты
					for (let i = this.listOrdersNode.length - 1; i >= 0; i--) {
						let dateOrder = this.getDateInOrder(this.listOrdersNode[i]);
						let dateOrderTimestamp = datesAliManager.convertDateAli(dateOrder, "timestamp");

						if (this.minDateOrder > dateOrderTimestamp) {
							this.listOrdersNode.splice(i, 1);
						} else {
							break;
						}
					}

					// 2. удаляем заказы которые больше максимальной даты
					if (this.maxDateOrder) {
						this.listOrdersNode.reverse();

						for (let i = this.listOrdersNode.length - 1; i >= 0; i--) {
							let dateOrder = this.getDateInOrder(this.listOrdersNode[i]);
							let dateOrderTimestamp = datesAliManager.convertDateAli(dateOrder, "timestamp");

							if (dateOrderTimestamp > this.maxDateOrder) {
								this.listOrdersNode.splice(i, 1);
							} else {
								break;
							}
						}

						this.listOrdersNode.reverse();
					}

					let ordersIndex = [];

					// заказы формата "От~До"
					let rangeDates = [];

					if (this.datesRange.length > 0) {
						for (let i = 0; i <= this.datesRange.length - 1; i++) {
							let date_0 = this.datesRange[i].date_0.timestamp;
							let date_1 = this.datesRange[i].date_1.timestamp;

							while (date_0 <= date_1) {
								rangeDates.push(date_0);
								date_0 += 86400000;
							}
						}
					}

					// минимальная дата заказов формата "От"
					let minDateOrderFrom = null;

					if (this.datesFrom.length > 0) {
						let dates = [];

						for (let i = 0; i <= this.datesFrom.length - 1; i++) {
							dates.push(this.datesFrom[i].timestamp);
						}

						minDateOrderFrom = Math.min(...dates);
					}

					for (let i = 0; i <= this.listOrdersNode.length - 1; i++) {
						let dateOrder = this.getDateInOrder(this.listOrdersNode[i]);
						let orderTimestamp = datesAliManager.convertDateAli(dateOrder, "timestamp");

						if (this.datesSingle.length > 0) {
							let index = this.datesSingle.findIndex((date) => date.timestamp == orderTimestamp);

							if (index != -1) ordersIndex.push(i);
						}

						if (this.datesRange.length > 0) {
							let index = rangeDates.findIndex((date) => date == orderTimestamp);

							if (index != -1) ordersIndex.push(i);
						}

						if (this.datesFrom.length > 0 && orderTimestamp >= minDateOrderFrom) {
							ordersIndex.push(i);
						}
					}

					ordersIndex = [...new Set(ordersIndex)];

					for (let i = this.listOrdersNode.length - 1; i == 0; i--) {
						let indexOrder = ordersIndex.findIndex((orderIndex) => orderIndex == i);

						if (indexOrder != i) {
							this.listOrdersNode.splice(i, 1);
						}
					}

					resolve();
				}
			}, 200);
		});
	}

	/**
	 * получает базовые данные о заказах
	 * @returns Promise
	 */

	getBaseDataOrders() {
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
			}, 100);
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

	async sendOrdersComplete() {
		await chrome.runtime.sendMessage({ ordersComplete: true });
	}

	async getStorage(key) {
		let value = null;

		await chrome.storage.local.get([key]).then((result) => (value = result[key]));

		return value;
	}

	async setStorage(key, value) {
		await chrome.storage.local.set({ [key]: value });
	}
}

new Orders();
