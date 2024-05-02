class Helpers {
	getParam(paramName) {
		const params = new URLSearchParams(window.location.search);
		return params.get(paramName);
	}
}

window.helpersAliManager = new Helpers();
