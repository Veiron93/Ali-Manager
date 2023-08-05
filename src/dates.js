class DatesAliManager {
	//dates = ["12-5-23~", "7-7-23", "5-7-23~", "12-7-23", "8-4-23~18-4-23", "8-6-23~", "6-7-23", "2-7-23~4-7-23"];
	monthNamesShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

	datesSingle = []; // конкретные даты
	datesFrom = []; // даты от
	datesRange = []; // даты от и до

	minDate = null; // минимальная дата заказа

	constructor() {
		//this.initDates(this.dates);
	}

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

		this.getMinDate();
	}

	typeDate(date) {
		let dateArr = date.split("~");
		let type = "single";

		if (dateArr[1]?.length) {
			type = "range";
		}

		if (dateArr[1]?.length == 0) {
			type = "from";
		}

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
			return new Date("20" + dateArr[2], dateArr[1] - 1, dateArr[0]);
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

	/*
	находит минимальную дату заказа
	*/
	getMinDate() {
		let dates = [];

		if (this.datesSingle.length) {
			dates.push({ timestamp: this.datesSingle.at(-1).timestamp });
		}

		if (this.datesFrom.length) {
			dates.push({ timestamp: this.datesFrom.at(-1).timestamp });
		}

		if (this.datesRange.length) {
			dates.push({ timestamp: this.datesRange.at(-1).date_0.timestamp });
		}

		if (!dates.length) {
			return false;
		}

		let sortingDates = this.sortDates(dates);

		this.minDate = sortingDates.at(-1).timestamp;
	}
}

window.datesAliManager = new DatesAliManager();
