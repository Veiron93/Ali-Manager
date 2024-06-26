class Result {
	trackingUrl = "/logisticsdetail.htm"; // трекинг посылки
	detailUrl = "/p/order/detail.html"; // информация о заказе

	orders = null;

	constructor() {
		(async () => {
			await this.pageLoaded();
			await this.clearPage();
			await this.getOrdersLocalStorage().then((result) => (this.orders = result));

			if (this.orders.length) {
				this.initInfoOrders();
				this.initListOrders();
			}

			//console.log(this.orders);
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

	/**
	 * возвращает заказы из localStorage
	 * @returns {Promise} object || null
	 */
	getOrdersLocalStorage() {
		return new Promise((resolve) => {
			let orders = localStorage.getItem("orders");
			resolve(orders ? JSON.parse(orders) : null);
		});
	}

	/**
	 * информация по всем заказам
	 * @returns {Promise} object || null
	 */

	initInfoOrders() {
		let ordersInfoWrapper = this.createElement("div", "orders-info");

		// цена
		let totalPriceWrapper = this.createElement("div", "total-price");
		let totalPrice = 0;

		// количество заказов
		let totalCountOrdersWrapper = this.createElement("div", "total-count-orders");
		let totalCountOrders = 0;

		// количество товаров
		let totalCountProductsWrapper = this.createElement("div", "total-count-products");
		let totalCountProducts = 0;

		// скидка
		let totalDiscountWrapper = this.createElement("div", "total-discount");
		let totalDiscount = 0;

		// доставка
		let totalDeliveryWrapper = this.createElement("div", "total-delivery");
		let totalDelivery = 0;

		// кнопка обновитть трек-код у всех заказов
		let btnUpdateTrackNumberAllOrders = this.createElement("div", "update-track-number-all-orders", "Обновить трек-код всех заказов");
		btnUpdateTrackNumberAllOrders.addEventListener("click", () =>
			this.updateTrackNumbersAllOrders().then(() => {
				console.log("конец промиса");
			})
		);

		let i = 0;

		totalCountOrders = this.orders.length;

		this.orders.forEach((order) => {
			totalPrice += order.totalPrice;
			totalCountProducts += order.countProducts;
			totalDiscount += order.discount;
			totalDelivery += order.deliveryPrice;

			i++;

			if (i == this.orders.length) {
				totalPriceWrapper.textContent = totalPrice;
				totalCountOrdersWrapper.textContent = totalCountOrders;
				totalCountProductsWrapper.textContent = totalCountProducts;
				totalDiscountWrapper.textContent = totalDiscount;
				totalDeliveryWrapper.textContent = totalDelivery;

				this.appendChild(
					[
						totalPriceWrapper,
						totalDiscountWrapper,
						totalDeliveryWrapper,
						totalCountOrdersWrapper,
						totalCountProductsWrapper,
						btnUpdateTrackNumberAllOrders,
					],
					ordersInfoWrapper
				);
				document.body.appendChild(ordersInfoWrapper);
			}
		});
	}

	/**
	 * список товаров
	 * @returns {Promise} object || null
	 */
	initListOrders() {
		// список заказов
		let lisrOrder = this.createElement("div", "list-orders-wrapper");

		for (let order of this.orders) {
			// ОБВЁРТКА ЗАКАЗА
			let orderWrapper = this.createElement("div", "order");

			// ШАПКА
			// обвёртка шапки
			let header = this.createElement("div", "order-header");

			// дата
			let date = this.createElement("div", "order-header_date", order.dateOrder);

			// дата
			let orderLink = this.createElement("a", "order-header_order-link", "О заказе");
			orderLink.href = "https://www.aliexpress.com/p/order/detail.html?orderId=" + order.orderNumber;
			orderLink.setAttribute("target", "_blank");

			// сборка шапки
			this.appendChild([date, orderLink], header);

			// ТЕЛО
			let body = this.createElement("div", "order-body");

			// СПИСОК ТОВАРОВ
			// список
			let productsList = this.createElement("div", "products-list");

			if (order.products) {
				for (let product of order.products) {
					// обвёртка товара
					let productWrapper = this.createElement("div", "product");

					// ОПИСАНИЕ ТОВАРА
					// обвёртка описания товара
					let productDescriptionWrapper = this.createElement("div", "product-description-wrapper");

					// обвёртка фото
					let productPhotoWrapper = this.createElement("div", "product-photo");

					// фото
					let img = new Image(70, 70);
					img.src = product.img;

					// сборка фото
					productPhotoWrapper.appendChild(img);

					// название товара
					let productName = this.createElement("a", "product-name", product.name);
					productName.href = product.link;
					productName.setAttribute("target", "_blank");

					// sku товара
					let productSku = this.createElement("div", "product-sku", product.sku);

					productName.appendChild(productSku);

					// сборка описания о товаре
					this.appendChild([productPhotoWrapper, productName], productDescriptionWrapper);

					// ИНФОРМАЦИЯ О СТОИМОСТИ
					// обвёртка
					let productPricesWrapper = this.createElement("div", "product-prices-wrapper");

					// стоимость товара
					let productPrice = this.createElement("div", "product-price", product.price);

					// количество товара
					let productCount = this.createElement("div", "product-count", product.count);

					// стоимость товара
					let productTotalPrice = this.createElement("div", "product-total-price", product.price * product.count);

					let templateExel = this.createElement("input", "product-total-price", "п - " + product.price + " (" + product.count + " шт) - ");
					this.copyText(templateExel);

					// сборка информации о стоимости
					this.appendChild([productPrice, productCount, productTotalPrice, templateExel], productPricesWrapper);

					// сборка товара
					this.appendChild([productDescriptionWrapper, productPricesWrapper], productWrapper);

					productsList.appendChild(productWrapper);
				}
			}

			// ИНФОРМАЦИЯ О ЗАКАЗЕ
			// враппер информация о заказе
			let orderInfo = this.createElement("div", "order-info");

			// номер заказа
			let numberOrder = this.createElement("input", "number-order", order.orderNumber);
			this.copyText(numberOrder);

			// трек номера посылки
			let originalTrackingNumberWrapper = this.createElement("div", "tracking-wrapper");
			let originalTrackingNumberLabel = this.createElement("label", "title", "Трек-код");

			let originalTrackingNumber = this.createElement(
				"input",
				"original",
				order.trackings && order.trackings.original && order.trackings.original != null ? order.trackings.original : "Данные отсутствуют"
			);

			this.copyText(originalTrackingNumber);

			this.appendChild([originalTrackingNumberLabel, originalTrackingNumber], originalTrackingNumberWrapper);

			let combinedTrackingNumberWrapper = this.createElement("div", "tracking-wrapper");
			let combinedTrackingNumberLabel = this.createElement("label", "title", "Трек-код общей посылки");

			let combinedTrackingNumber = this.createElement(
				"input",
				"combined",
				order.trackings && order.trackings.combined && order.trackings.combined != null ? order.trackings.combined : "Данные отсутствуют"
			);

			this.copyText(combinedTrackingNumber);

			this.appendChild([combinedTrackingNumberLabel, combinedTrackingNumber], combinedTrackingNumberWrapper);

			// количество товара
			let countProducts = this.createElement("div", "count-products", order.countProducts);

			// сумма заказа
			let priceOrder = this.createElement("div", "price-order", order.totalPrice + order.discount - order.deliveryPrice);

			// скидка
			let discount = this.createElement("div", "discount-order", order.discount);

			// доставка
			let delivery = this.createElement("div", "delivery-order", order.deliveryPrice);

			// итоговая сумма заказа
			let totalPrice = this.createElement("div", "total-price-order", order.totalPrice);

			// кнопка обновить трек-номер
			let btnUpdateTrackNumber = this.createElement("div", ["btn", "btn-update-track-number"], "Обновить трек-код");
			btnUpdateTrackNumber.addEventListener("click", () => this.updateTrackNumbers(order.orderNumber));

			// сборка Информации о заказе
			this.appendChild(
				[
					numberOrder,
					originalTrackingNumberWrapper,
					combinedTrackingNumberWrapper,
					countProducts,
					priceOrder,
					discount,
					delivery,
					totalPrice,
					btnUpdateTrackNumber,
				],
				orderInfo
			);

			// СБОРКА ТЕЛА
			this.appendChild([productsList, orderInfo], body);

			// СБОРКА ЗАКАЗА
			this.appendChild([header, body], orderWrapper);
			lisrOrder.appendChild(orderWrapper);
		}

		document.body.appendChild(lisrOrder);
	}

	/**
	 * создание Node элемента
	 * @param {String} elementName элемент
	 * @param {String} className класс
	 * @param {String} content текст
	 */
	createElement(elementName, className = null, content = null) {
		let element = document.createElement(elementName);

		if (className) {
			if (Array.isArray(className)) {
				className.forEach((c) => {
					element.classList.add(c);
				});
			} else {
				element.classList.add(className);
			}
		}

		if (content != null) {
			if (elementName == "input") {
				element.value = content;
			} else {
				element.textContent = content;
			}
		}

		return element;
	}

	/**
	 * добавление дочерних элементов
	 * @param {Node || Array} nodes
	 * @param {Node} parenElement
	 * @returns {Node}
	 */
	appendChild(nodes, parenElement) {
		if (Array.isArray(nodes)) {
			for (let node of nodes) {
				parenElement.appendChild(node);
			}
		} else {
			parenElement.appendChild(nodes);
		}
	}

	/**
	 * копирует при клике
	 * @param {Node} parenElement
	 * @returns {void}
	 */

	copyText(element) {
		element.addEventListener("click", () => document.execCommand("copy", false, element.select()));
	}

	/**
	 * обновление трек-номера посылки
	 * @param {string} orderNumber
	 * @returns {void}
	 */

	updateTrackNumbers(orderNumber) {
		window.open("https://track.aliexpress.com" + this.trackingUrl + "?alimanager=1&tradeId=" + orderNumber, "_blank");
	}

	updateTrackNumbersAllOrders() {
		return new Promise(async (resolve) => {
			for (let i = 0; this.orders.length > i; i++) {
				this.orders[i].trackingNumberCompleted = false;
				localStorage.setItem("orders", JSON.stringify(this.orders));

				this.updateTrackNumbers(this.orders[i].orderNumber);

				await this.checkComplete(this.orders[i], "trackingNumberCompleted");

				if (i == this.orders.length - 1) {
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
			}, 200);
		});
	}

	/**
	 * обновление трек-номера посылки
	 * @param {Node} parenElement
	 * @returns {void}
	 */

	resetCompletedOrderData() {
		let orders = JSON.parse(localStorage.getItem("orders"));

		orders.forEach((order) => {
			order.dataCompleted = false;
			order.trackingNumber = false;
		});
	}
}

new Result();
