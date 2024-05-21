class SearchOrdersPopup extends HelpersPopup {
	container;

	// форма поиска
	inputDatesElement;
	btnSearchElement;
	btnClearElement;

	// последний поиск
	lastSearchElement;
	dateLastSearchElement;

	// документация
	documentation;
	btnMoreDocumentation;

	constructor() {
		super();

		(async () => {
			await this.initElements();
			await this.initEvents();
			await this.init();
		})();
	}

	initElements() {
		return new Promise((resolve) => {
			this.container = document.querySelector(".search-orders");

			// форма поиска
			this.inputDatesElement = this.container.querySelector("textarea[name='search-orders-dates']");
			this.btnSearchElement = this.container.querySelector(".btn-search");
			this.btnClearElement = this.container.querySelector(".btn-clear");

			// последний поиск
			this.lastSearchElement = this.container.querySelector(".last-search");
			this.dateLastSearchElement = this.lastSearchElement.querySelector(".last-search_date");

			// документация
			this.documentation = this.container.querySelector(".documentation");
			this.btnMoreDocumentation = this.container.querySelector(".documentation_btn-more");

			resolve();
		});
	}

	async initEvents() {
		// форма поиска
		this.inputDatesElement.addEventListener("input", () => this.watchSearch());
		this.btnSearchElement.addEventListener("click", () => this.startSearch());
		this.btnClearElement.addEventListener("click", () => this.clear());

		// документация
		this.btnMoreDocumentation.addEventListener("click", () => this.stateDocumentation());
	}

	async init() {
		this.initFormSearch();
		this.initLastSearch();
	}

	async initFormSearch() {
		await this.initDates();
		this.stateBtnsSearch();
	}

	async initLastSearch() {
		const code = await this.getStorageLocal("codeResultSearchOrders");
		const date = await this.getStorageLocal("lastSearchOrders");

		if (!code || !date) {
			return false;
		}

		this.lastSearchElement.href += code;
		this.dateLastSearchElement.innerText = date;
		this.stateElementClass(this.lastSearchElement, true);
	}

	watchSearch() {
		this.validationDatesSearch();
		this.setStorageLocal("datesSearch", this.inputDatesElement.value.split("\n"));
		this.stateBtnsSearch();
	}

	clear() {
		this.inputDatesElement.value = "";
		this.clearStorageLocal("datesSearch");
		this.stateBtnsSearch();
	}

	async initDates() {
		await this.getStorageLocal("datesSearch").then((dates) => {
			if (dates) {
				let datesStr = "";
				let datesArr = [];

				for (let i = 0; i <= dates.length - 1; i++) {
					if (dates[i].length > 0) {
						datesStr += dates[i] + (i < dates.length - 1 ? "\n" : "");
						datesArr.push(dates[i]);
					}
				}

				this.inputDatesElement.value = datesStr;
				this.setStorageLocal("datesSearch", datesArr);
			}
		});
	}

	validationDatesSearch() {
		this.inputDatesElement.value = this.inputDatesElement.value.replace(/[^0-9~\-\s\n]/g, "");
	}

	stateBtnsSearch() {
		let state = false;

		if (this.inputDatesElement.value) {
			state = true;
		}

		this.stateElementDisabled(this.btnSearchElement, state);
		this.stateElementDisabled(this.btnClearElement, state);
	}

	startSearch() {
		chrome.runtime.sendMessage({ startSearch: true });
	}

	stateDocumentation() {
		this.documentation.classList.toggle("active");
	}
}
