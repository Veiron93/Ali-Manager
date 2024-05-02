//console.log("скрипт встроен");

//console.time("myScript");

class OrderRu {
	elementsOrder = new Map([
		["productsList", ".RedOrderDetailsProducts_RedOrderDetailsProducts__box__17lnl"],
		["paymentWrapper", ".RedOrderDetailsProducts_Summary__totalWrapper__fewhe"],
		["paymentCountProducts", ".RedOrderDetailsProducts_Summary__row__fewhe:nth-child(1) > span"],
		["paymentPrePrice", ".RedOrderDetailsProducts_Summary__row__fewhe:nth-child(1) > div span"],
		["paymentDelivery", ".RedOrderDetailsProducts_Summary__row__fewhe:nth-child(2) > div span"],
		["paymentTotalPriceWrapper", ".RedOrderDetailsProducts_Summary__total__fewhe"],
		["paymentTotalPrice", ".RedOrderDetailsProducts_Summary__total__fewhe span:nth-child(2)"],
	]);

	elementsProduct = new Map([
		["product", ".RedOrderDetailsProducts_Product__wrapper__1tmn5"],
		["productLink", ".RedOrderDetailsProducts_Product__content__1tmn5 > a"],
		["productPhoto", ".RedOrderDetailsProducts_Product__image__1tmn5 img"],
		["productName", ".RedOrderDetailsProducts_Product__title__1tmn5"],
		["productSKU", ".RedOrderDetailsProducts_Product__description__1tmn5"],
		["productPrice", ".RedOrderDetailsProducts_Product__priceDesktop__1tmn5 > div:nth-child(1)"],
		["productAmount", ".RedOrderDetailsProducts_Product__priceDesktop__1tmn5 > div:nth-child(2)"],
	]);

	orderNumber = null;
	order = null;

	// products
	productsElements = null;
	orderProductsData = null;

	// payment info
	totalPriceOrder = 0;
	prePriceOrder = 0;
	countProductsOrder = 0;
	deliveryPriceOrder = 0;
	deliveryFactor = 0;

	constructor() {
		this.orderNumber = this.getOrderNumber();

		(async () => {
			// 1. проверка загружена ли страница
			await this.checkPageLoaded();

			// 2. получаем список товаров
			await this.getOrderProducts();

			// 3. получаем общие данные платежа
			await this.getOrderPaymentInfo();

			// 4. получаем данные о товарах
			await this.getProductsData();

			// 5. собираем все данные о заказе
			await this.orderInit();

			// 6. возвращает собранные данные о заказе в background.js
			await this.sendOrderData();

			//console.timeEnd("myScript");
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
				if (document.querySelector(this.elementsOrder.get("productsList"))) {
					clearInterval(loadedIntervalId);
					resolve();
				}
			}, 100);
		});
	}

	getOrderProducts() {
		return new Promise((resolve) => {
			this.productsElements = document.querySelectorAll(this.elementsProduct.get("product"));
			resolve();
		});
	}

	getOrderPaymentInfo() {
		return new Promise((resolve) => {
			let id = setInterval(() => {
				let btnShowListInfo = document.querySelector(this.elementsOrder.get("paymentTotalPriceWrapper"));

				btnShowListInfo.click();

				let paymentPositions = document.querySelectorAll(this.elementsOrder.get("paymentWrapper") + " > div");

				if (paymentPositions.length > 1) {
					clearInterval(id);

					// стоимость товаров с доставкой
					let totalPriceElement = document.querySelector(this.elementsOrder.get("paymentTotalPrice"));
					let totalPriceValue = this.getValueNumber(totalPriceElement);

					// стоимость товаров без доставки
					let prePriceElement = paymentPositions[1].querySelector(this.elementsOrder.get("paymentPrePrice"));
					let prePriceValue = this.getValueNumber(prePriceElement);

					// количество товаров
					let countProductsElement = paymentPositions[1].querySelector(this.elementsOrder.get("paymentCountProducts"));
					let countProductsValue = this.getValueNumber(countProductsElement);

					// доставка
					let deliveryElement = paymentPositions[1].querySelector(this.elementsOrder.get("paymentDelivery"));
					let deliveryValue = this.getValueNumber(deliveryElement);
					let deliveryFactor = (deliveryValue / (prePriceValue * 0.1)) * 0.1;

					this.totalPriceOrder = totalPriceValue;
					this.prePriceOrder = prePriceValue;
					this.countProductsOrder = countProductsValue;
					this.deliveryPriceOrder = deliveryValue;
					this.deliveryFactor = deliveryFactor;

					// console.log(this.totalPriceOrder);
					// console.log(this.prePriceOrder);
					// console.log(this.countProductsOrder);
					// console.log(this.deliveryPriceOrder);
					// console.log(this.deliveryFactor);

					//console.log(totalPriceValue);
					// console.log(countProductsValue);
					// console.log(prePriceValue);
					// console.log(deliveryValue);

					resolve();
				}
			}, 100);
		});
	}

	getProductsData() {
		return new Promise((resolve) => {
			let productsData = [];

			this.productsElements.forEach((product) => {
				let productData = this.getProductData(product);

				if (productData) productsData.push(productData);

				if (productsData.length == this.productsElements.length) {
					this.orderProductsData = [...productsData];
					resolve();
				}
			});
		});
	}

	getProductData(product) {
		const link = this.getLinkProduct(product);
		const photo = this.getPhotoProduct(product);
		const name = this.getNameProduct(product);
		const sku = this.getSkuProduct(product);
		const amount = this.getAmountProduct(product);
		const price = this.getPriceProduct(product);

		// стоимость с доставкой
		let priceWithDelivery = null;

		if (this.deliveryFactor) {
			priceWithDelivery = Number((price + price * this.deliveryFactor).toFixed(2));
		}

		// console.log(link);
		// console.log(photo);
		// console.log(name);
		// console.log(sku);
		// console.log(amount);
		// console.log(price);
		// console.log(priceWithDelivery);

		return {
			link: link,
			photo: photo,
			name: name,
			sku: sku,
			amount: amount,
			price: price,
			priceWithDelivery: priceWithDelivery,
		};
	}

	getLinkProduct(product) {
		let element = product.querySelector(this.elementsProduct.get("productLink"));
		return element ? element.href : null;
	}

	getPhotoProduct(product) {
		let element = product.querySelector(this.elementsProduct.get("productPhoto"));
		return element ? element.src : null;
	}

	getNameProduct(product) {
		let element = product.querySelector(this.elementsProduct.get("productName"));
		return element ? element.textContent : null;
	}

	getSkuProduct(product) {
		let element = product.querySelector(this.elementsProduct.get("productSKU"));
		return element ? element.textContent : null;
	}

	getAmountProduct(product) {
		let element = product.querySelector(this.elementsProduct.get("productAmount"));
		return element ? this.getValueNumber(element) : null;
	}

	getPriceProduct(product) {
		let element = product.querySelector(this.elementsProduct.get("productPrice"));
		return element ? this.getValueNumber(element) : null;
	}

	orderInit() {
		return new Promise((resolve) => {
			this.order = {
				number: this.orderNumber,
				products: this.orderProductsData,
				payment: {
					totalPriceOrder: this.totalPriceOrder,
					prePriceOrder: this.prePriceOrder,
					countProductsOrder: this.countProductsOrder,
					deliveryPriceOrder: this.deliveryPriceOrder,
				},
			};

			resolve();
		});
	}

	async sendOrderData() {
		// генерируем рандомное число для того что бы не обновлять страницу слишком часто
		// иначе будет подозрение на парсинг и заблокируют доступ к сайту
		let time = Math.floor(Math.random() * (5 - 3 + 1)) + 3;

		setTimeout(async () => {
			await chrome.runtime.sendMessage({ orderDataComplete: this.order });
		}, time * 1000);
	}

	getOrderNumber() {
		return window.location.pathname.split("/").pop();
	}

	/**
	 * Получает значение из указанного элемента.
	 *
	 * @param {Element} element - Элемент, содержащий информацию о цене.
	 * @return {number} Извлеченное значение цены.
	 */
	getValueNumber(element) {
		let valueStr = element.textContent;

		if (valueStr == "Бесплатно" || valueStr === "0" || !valueStr) {
			return 0;
		}

		let lastSpaceIndex = valueStr.lastIndexOf(" ");

		if (lastSpaceIndex != -1) {
			valueStr = valueStr.slice(0, lastSpaceIndex);
		}

		return Number(valueStr.replace(/\s/g, "").replace(/,/g, "."));
	}
}

new OrderRu();
