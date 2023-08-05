/**
 * встраиваемый скрипт на сайт
 */

class GetOrders {
	// сслылки на страницы для парсинга
	indexUrl = "/p/order/index.html"; // список заказов
	trackingUrl = "/logisticsdetail.htm"; // трекинг посылки
	detailUrl = "/p/order/detail.html"; // информация о заказе

	// даты
	datesSingle = []; // конкретные даты
	datesFrom = []; // даты от
	datesRange = []; // даты от и до

	minDateOrder = null; // минимальная дата заказка

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
			await this.getNumberOrders();
			await this.setOrdersLocalStorage();
		})();
	}

	init() {
		let dates = this.getDates();

		datesAliManager.initDates(dates);

		this.datesSingle = datesAliManager.datesSingle;
		this.datesFrom = datesAliManager.datesFrom;
		this.datesRange = datesAliManager.datesRange;
		this.minDateOrder = datesAliManager.minDate;

		//console.log(this.datesSingle);
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
			}, 500);
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
				let lastOrderDate = this.getDateInOrder(this.listOrdersNode[this.listOrdersNode.length - 1]);

				if (this.compareDates(lastOrderDate)) {
					console.log("подгрузка списка");

					this.btnMoreOrders.click();
					this.checkLoadingListOrder().then(() => this.setOrders());
				} else {
					console.log("подгрузка не нужна");
					clearInterval(idInterval);

					// удаление лишних заказов
					// на али некорректно показывается список заказов (напрмер: заказ 13 числа может оказаться между 12-ми числами)

					for (let i = this.listOrdersNode.length - 1; i >= 0; i--) {
						let dateOrder = this.getDateInOrder(this.listOrdersNode[i]);

						if (!this.compareDates(dateOrder)) {
							this.listOrdersNode.splice(i, 1);
						}

						if (i == 0) resolve();
					}
				}
			}, 500);
		});
	}

	/**
	 * получает данные о заказах
	 * @returns Promise
	 */

	getNumberOrders() {
		return new Promise((resolve) => {
			let countOrders = this.listOrdersNode.length;
			let i = 0;

			Array.from(this.listOrdersNode).forEach((order) => {
				let orderNumber = order.querySelector(".order-item-header-right-info div:nth-child(2)").textContent;
				orderNumber = orderNumber.replace(/[^0-9]/g, "");

				this.listOrders.push(orderNumber);

				i++;

				if (countOrders == i) {
					resolve();
				}
			});
		});
	}

	/**
	 * сравнивает даты
	 * @returns {Boolean}
	 */
	compareDates(orderDate) {
		let orderDateArr = orderDate.split(" ");

		let day = orderDateArr[1].slice(0, -1);
		let month = datesAliManager.monthNamesShort.indexOf(orderDateArr[0]) + 1;
		let year = orderDateArr[2];

		let orderDateObject = new Date(year + "-" + month + "-" + day);

		// console.log(this.minDateOrder);
		// console.log(orderDateObject.getTime());

		return this.minDateOrder <= orderDateObject.getTime() ? true : false;
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
					orderNumber: order,
					trackingNumber: "",
				});

				if (orders.length == this.listOrders.length) {
					localStorage.setItem("orders", JSON.stringify(orders));
					resolve();
				}
			});
		});
	}
}

new GetOrders();
