appServices.factory('AuthenticationService', function() {
    var auth = {
        isLogged: false
    }

    return auth;
});

appServices.factory('TokenInterceptor', function ($q, $window, $location, AuthenticationService) {
    return {
        request: function (config) {
            config.headers = config.headers || {};
            if ($window.sessionStorage.token) {
                config.headers.Authorization = 'Bearer ' + $window.sessionStorage.token;
            }
            return config;
        },

        requestError: function(rejection) {
            return $q.reject(rejection);
        },

        response: function (response) {
            return response || $q.when(response);
        },

        /* Revoke client authentication if 401 is received */
        responseError: function(rejection) {
            if (rejection != null && rejection.status === 401 && ($window.sessionStorage.token || AuthenticationService.isLogged)) {
                delete $window.sessionStorage.token;
                AuthenticationService.isLogged = false;
                $location.path("/admin/login");
            }

            return $q.reject(rejection);
        }
    };
});

appServices.factory('PostService', function($http) {
    return {
        findAllPublished: function() {
            return $http.get(options.api.base_url + '/post');
        },

        findByTag: function(tag) {
            return $http.get(options.api.base_url + '/tag/' + tag);
        },

        read: function(id) {
            return $http.get(options.api.base_url + '/post/' + id);
        },
        
        findAll: function() {
            return $http.get(options.api.base_url + '/post/all');
        },

        changePublishState: function(id, newPublishState) {
            return $http.put(options.api.base_url + '/post', {'post': {_id: id, is_published: newPublishState}});
        },

        delete: function(id) {
            return $http.delete(options.api.base_url + '/post/' + id);
        },

        create: function(post) {
            return $http.post(options.api.base_url + '/post', {'post': post});
        },

        update: function(post) {
            return $http.put(options.api.base_url + '/post', {'post': post});
        }
    };
});

appServices.factory('UserService', function($http) {
    return {
        logIn: function(username, password) {
            return $http.post(options.api.base_url + '/login', {username: username, password: password});
        },

        logOut: function() {
            return $http.get(options.api.base_url + '/logout');
        }
    }
});