/**
 *
 * @param {number} productPrice
 * @param {number} productDiscount
 * @param {number} discountOrder
 */

function price(productPrice, countProducts, discountOrder) {
	// процент скидки
	let discountPercentage = null;

	// const result = {
	// 	productPrice: null,
	// 	productDiscount: null,
	// 	discountOrder: null,
	// };

	return new Promise((resolve) => {
		// if (productPrice - productDiscount < productPrice / 2) {
		// 	console.log("скидка больше чем пол стоимости товара");
		// 	result.productPrice = productPrice / 2;
		// 	result.productDiscount = productPrice / 2;
		// 	result.discountOrder = discountOrder - productPrice / 2;
		// 	resolve(result);
		// } else {
		// 	result.productPrice = productPrice - productDiscount;
		// 	result.productDiscount = productDiscount;
		// 	result.discountOrder = discountOrder - productDiscount;
		// 	resolve(result);
		// }
	});
}

price(200, 3, 2000).then((result) => {
	console.log(result);
});
