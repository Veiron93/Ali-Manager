class OrderData {
	orderNumber = null;
	products = null; // список товаров в заказе
	productsData = null;
	countProducts = 0; // общее количество товаров в заказе

	prePriceOrder = 0;
	totalPriceOrder = 0;

	deliveryPriceOrder = 0;
	deliveryFactorOrder = 0;

	discountOrder = 0;
	discountFactorOrder = 0;

	constructor() {
		(async () => {
			await this.pageLoaded();
			await this.getUriParams("orderId").then((result) => (this.orderNumber = result));
			await this.getPriceOrder().then(
				(result) =>
					([
						this.prePriceOrder,
						this.totalPriceOrder,
						this.deliveryPriceOrder,
						this.deliveryFactorOrder,
						this.discountOrder,
						this.discountFactorOrder,
					] = result)
			);

			await this.getProducts().then((result) => (this.products = result));
			await this.getDataProducts().then((result) => (this.productsData = result));
			await this.initDataOrder();
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
				if (document.querySelector(".order-price") == null) {
					loadedIntervalId;
				} else {
					clearInterval(loadedIntervalId);
					resolve();
				}
			}, 300);
		});
	}

	/**
	 * Числовые данные от заказе
	 * @returns {Promise} [предварительная сумма, всего, стоимость доставки, коэффициент стоимости доставки, скидка, коэффициент скидки]
	 */

	getPriceOrder() {
		return new Promise((resolve) => {
			const priceWrapper = document.querySelector(".order-price");
			const items = priceWrapper.querySelectorAll("[data-pl='order_price_item_value']");

			const prePrice = this.getPrice(items[0]);
			const totalPrice = this.getPrice(items[1]);

			// доставка
			let delivery = 0;
			let deliveryFactor = 0;

			// скидка
			let discount = 0;
			let discountFactor = 0;

			// если разница отрицательная, то есть платная доставка
			if (prePrice - totalPrice < 0) {
				delivery = totalPrice - prePrice;
				deliveryFactor = delivery / (prePrice / 100) / 100;
			}

			// если разница положительная, то есть скидка
			if (prePrice - totalPrice > 0) {
				discount = prePrice - totalPrice;
				discountFactor = discount / (prePrice / 100) / 100;
			}

			resolve([prePrice, totalPrice, delivery, deliveryFactor, discount, discountFactor]);
		});
	}

	/**
	 * товары в заказе
	 * @returns {Promise}
	 */

	getProducts() {
		return new Promise((resolve) => {
			let productsIdInterval = setInterval(() => {
				let products = document.querySelectorAll(".order-detail-item-content");

				if (!products) {
					productsIdInterval;
				} else {
					clearInterval(productsIdInterval);
					resolve(products);
				}
			}, 500);
		});
	}

	getDataProducts() {
		return new Promise((resolve) => {
			let productsData = [];

			this.products.forEach((element) => {
				const link = this.getLinkProduct(element);
				const img = this.getImgProduct(element);
				const name = this.getNameProduct(element);
				const sku = this.getSkuProduct(element);
				let price = this.getPrice(element, "product");
				let deliveryProduct = 0;
				let discountProduct = 0;

				const count = this.getCountProducts(element);

				// количество товаров в заказе
				this.countProducts += count;

				// пересчитанная стоимость товара с учётом доставки
				if (this.deliveryPriceOrder) {
					deliveryProduct = Math.round(price * this.deliveryFactorOrder);
					price = Math.round(price + deliveryProduct);
				}

				// пересчитанная стоимость товара с учётом скидок
				if (this.discountOrder) {
					discountProduct = Math.round(price * this.discountFactorOrder);
					price = Math.round(price - discountProduct);
				}

				const product = {
					link: link,
					img: img,
					name: name,
					sku: sku,
					price: price,
					delivery: deliveryProduct,
					discount: discountProduct,
					count: count,
				};

				productsData.push(product);

				if (productsData.length == this.products.length) {
					resolve(productsData);
				}
			});
		});
	}

	/**
	 * цена
	 * @param {Node} wrapper
	 * @param {String} type
	 * @returns {String, Boolean}
	 */

	getPrice(wrapper, type = null) {
		let priceString = null;

		if (type == "product") {
			let priceWrapper = wrapper.querySelector(".item-price");
			priceString = priceWrapper.children[0].textContent;
		} else {
			priceString = wrapper.textContent;
		}

		let price = "";

		for (let i = 0; i < priceString.length; i++) {
			if (!isNaN(priceString.charAt(i)) || priceString.charAt(i) == ",") {
				price += priceString.charAt(i);
			}
		}

		if (price) {
			price = price.replace(/\,/g, ".");
			price = price.replace(/\s+/g, "");
		}

		return price ? Number(price) : false;
	}

	/**
	 * количество
	 * @param {Node} product
	 * @returns {String}
	 */
	getCountProducts(product) {
		let countWrapper = product.querySelector(".item-price");
		let countString = countWrapper.children[1].textContent;
		let count = countString.replace(/\x/g, "");

		return count ? Number(count) : 0;
	}

	/**
	 * стоимость одного товара
	 * @param {Node} priceWrapper
	 * @returns {String, Boolean}
	 */

	getPriceProduct(product) {}

	/**
	 * изображение товара
	 * @param {Node} product
	 * @returns {String, null}
	 */

	getImgProduct(product) {
		let imgWrapper = product.querySelector(".order-detail-item-content-img");
		let imgLink = imgWrapper.style.backgroundImage;

		if (imgLink) {
			imgLink = imgLink.slice(4, -1).replace(/"/g, "");
		}

		return imgLink;
	}

	/**
	 * название товара
	 * @param {Node} product
	 * @returns {String}
	 */
	getNameProduct(product) {
		let nameWrapper = product.querySelector(".item-title");
		let name = null;

		if (nameWrapper) {
			name = nameWrapper.textContent.slice(0, 140) + "...";
		}

		return name;
	}

	/**
	 * sku товара
	 * @param {Node} product
	 * @returns {String}
	 */
	getSkuProduct(product) {
		let skuWrapper = product.querySelector(".item-sku-attr");
		let sku = null;

		if (skuWrapper) {
			sku = skuWrapper.textContent;
		}

		//console.log(sku);

		return sku;
	}

	/**
	 * ссылка на товар
	 * @param {Node} product
	 * @returns {String}
	 */
	getLinkProduct(product) {
		let linkWrapper = product.querySelector(".item-title a");
		let link = null;

		if (linkWrapper) {
			link = linkWrapper.href;
		}

		return link;
	}

	/**
	 * возвращает заказы из localStorage
	 * @returns {Promise} object || null
	 */
	getOrdersLocalStorage() {
		let orders = localStorage.getItem("orders");
		return orders ? JSON.parse(orders) : null;
	}

	/**
	 * возвращает заказ из localStorage
	 * @param {Number} orders заказы
	 * @returns {Number}
	 */
	getOrderIndexLocalStorage(orders) {
		let orderIndex = orders.findIndex((order) => order.orderNumber == this.orderNumber);
		return orderIndex;
	}

	/**
	 * инициализация данных о заказе
	 * @returns {Promise}
	 */
	initDataOrder() {
		return new Promise((resolve) => {
			let orders = this.getOrdersLocalStorage();

			if (!orders) {
				return false;
			}

			let orderIndex = this.getOrderIndexLocalStorage(orders);

			orders[orderIndex].products = this.productsData;
			orders[orderIndex].countProducts = this.countProducts;
			orders[orderIndex].totalPrice = Math.round(this.totalPriceOrder);
			orders[orderIndex].deliveryPrice = Math.round(this.deliveryPriceOrder);
			orders[orderIndex].discount = Math.round(this.discountOrder);

			this.setDataLocalStorage(orders);

			resolve();
		});
	}

	/**
	 * запись данных о заказе в localStorage
	 * @param {Object} orders
	 * @returns {Promise}
	 */
	setDataLocalStorage(orders) {
		localStorage.setItem("orders", JSON.stringify(orders));
	}

	/**
	 * возвращает номер заказа
	 * @param {String} param
	 * @returns {Promise}
	 */
	getUriParams(param) {
		return new Promise((resolve) => {
			let params = new URL(document.location).searchParams;
			resolve(params.get(param));
		});
	}
}

new OrderData();
