appServices.factory('AuthenticationService', function() {
	var auth = {
		isLogged: false,
		user: {
			username: "kdelemme",
			email: "kdelemme@gmail.com"
		}
	}

	return auth;
});