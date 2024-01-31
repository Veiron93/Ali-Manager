/**
 * Данный файл для разработки лучше запускать в консоле с помощью node.js
 */

class DatesAliManager {
	monthNamesShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

	datesSingle = []; // конкретные даты
	datesFrom = []; // даты от
	datesRange = []; // даты от и до

	minDate = null; // минимальная дата заказа
	maxDate = null; // максимальная дата заказа

	initDates(dates) {
		for (const date of dates) {
			let type = this.typeDate(date);
			let dateFormat = this.formatDate(date, type);

			switch (type) {
				case "single":
					this.datesSingle.push(dateFormat);
					break;
				case "from":
					this.datesFrom.push(dateFormat);
					break;
				case "range":
					this.datesRange.push(dateFormat);
					break;
			}
		}

		this.sortDates(this.datesSingle);
		this.sortDates(this.datesFrom);
		this.sortDates(this.datesRange, "range");

		this.getMinAndMaxDate();

		//console.log(this);
	}

	typeDate(date) {
		let dateArr = date.split("~");

		let type = "single";

		if (dateArr[1]?.length) type = "range";
		if (dateArr[1]?.length == 0) type = "from";

		return type;
	}

	// преобразует дату в различные типы
	formatDate(date, type) {
		let dateFormating = { type: type };

		// диапазон
		if (type == "range") {
			let dates = date.split("~");
			let i = 0;

			dateFormating["orig"] = date;

			dates.forEach((item) => {
				const dateArr = item.split("-");
				const dateClass = formatClass(dateArr);
				const dateAli = formatAli(dateClass, this);

				dateFormating["date_" + i] = { date: dateClass, timestamp: dateClass.getTime(), ali: dateAli };

				i++;
			});
		}

		// от
		if (type == "from") {
			let dates = date.split("~");

			const dateArr = dates[0].split("-");
			const dateClass = formatClass(dateArr);
			const dateAli = formatAli(dateClass, this);

			Object.assign(dateFormating, {
				orig: date,
				date: dateClass,
				timestamp: dateClass.getTime(),
				ali: dateAli,
			});
		}

		// конкретная дата
		if (type == "single") {
			const dateArr = date.split("-");
			const dateClass = formatClass(dateArr);
			const dateAli = formatAli(dateClass, this);

			Object.assign(dateFormating, {
				orig: date,
				date: dateClass,
				timestamp: dateClass.getTime(),
				ali: dateAli,
			});
		}

		return dateFormating;

		// возвращает дату в виде класса
		function formatClass(dateArr) {
			let date = new Date("20" + dateArr[2], dateArr[1] - 1, dateArr[0]);
			date.setHours(0, 0, 0, 0);

			return date;
		}

		// возвращает формат даты как на Aliexpress
		function formatAli(dateClass, ths) {
			return ths.monthNamesShort[dateClass.getMonth()] + " " + dateClass.getDate() + ", " + dateClass.getFullYear();
		}
	}

	/*
	сортировка от большего к меньшему по timestamp
	*/
	sortDates(dates, type = null) {
		dates.sort((a, b) => {
			if (type && type == "range") {
				a = a.date_0;
				b = b.date_0;
			}

			if (a.timestamp < b.timestamp) return 1;
			if (a.timestamp > b.timestamp) return -1;

			return 0;
		});

		return dates;
	}

	/**
	 * находит минимальную и максимальную дату заказа
	 */

	getMinAndMaxDate() {
		let dates = [];

		if (this.datesSingle.length) {
			this.datesSingle.forEach((date) => dates.push(date.timestamp));
		}

		if (this.datesFrom.length) {
			this.datesFrom.forEach((date) => dates.push(date.timestamp));
		}

		if (this.datesRange.length) {
			this.datesRange.forEach((date) => {
				dates.push(date.date_0.timestamp);
				dates.push(date.date_1.timestamp);
			});
		}

		if (!dates.length) {
			return false;
		}

		dates.sort(function (a, b) {
			return a - b;
		});

		this.minDate = dates.at(0);

		// если в списке дат есть дата формата - "все заказы начиная с этого числа",
		//то максимальную дату нет смысла находить, потому что последняя дата будет равняться последнему заказу
		if (!this.datesFrom.length) {
			this.maxDate = dates.at(-1);
		}

		// console.log(this.minDate);
		// console.log(this.maxDate);
	}

	formatingDateAliToRus(dateAli) {
		let orderDateArr = dateAli.split(" ");

		if (orderDateArr[0] == "") {
			orderDateArr.splice(0, 1);
		}

		let day = orderDateArr[1].slice(0, -1);
		let month = this.monthNamesShort.indexOf(orderDateArr[0]) + 1;
		let year = orderDateArr[2];

		let dateRus = day + "." + month + "." + year;

		return dateRus ? dateRus : null;
	}
}

// для разработки и вывода в console (после разработки закомментировать)
// min = 1680872400000 (6.07.23)
// max = 1689080400000 (12.07.23)
// Single min - max:
// 1688562000000 (6.07.23) - 1689080400000 (12.07.23)
// From min - max:
// 1683810000000 (12-5-23) - 1688475600000 (5-7-23)
// Range min - max:
// 1680872400000 (8-4-23) - 1688389200000 (4-7-23)

// const dates = ["12-5-23~", "7-7-23", "5-7-23~", "12-7-23", "8-4-23~18-4-23", "8-6-23~", "6-7-23", "2-7-23~4-7-23"];
// new DatesAliManager().initDates(dates);

window.datesAliManager = new DatesAliManager();
