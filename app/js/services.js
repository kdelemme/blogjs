appServices.factory('AuthenticationService', function() {
	var auth = {
		isLogged: false
	}

	return auth;
});

appServices.factory('PostService', function($http, $sce) {

	return {
		findAll: function() {
			return $http.get(options.api.base_url + '/post', {withCredentials: true});
		},

		findByTag: function(tag) {
			return $http.get(options.api.base_url + '/tag/' + tag, {withCredentials: true});
		}

		read: function(url) {
			return $http.get(options.api.base_url + '/post/' + url, {withCredentials: true});
		},

		changePublishState: function(id, newPublishState) {
			return $http.put(options.api.base_url + '/post', {'post': {_id: id, is_published: newPublishState}}, {withCredentials: true});
		},

		delete: function(id) {
			return $http.delete(options.api.base_url + '/post/' + post._id, {withCredentials: true});
		},

		create: function(post) {
			return $http.post(options.api.base_url + '/post', {'post': post}, {withCredentials: true});
		},

		update: function(post) {
			return $http.put(options.api.base_url + '/post', {'post': post}, {withCredentials: true});
		}

	};
});