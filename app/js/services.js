appServices.factory('AuthenticationService', function() {
    var auth = {
        isAuthenticated: false,
        isAdmin: false
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

        /* Set Authentication.isAuthenticated to true if 200 received */
        response: function (response) {
            if (response != null && response.status == 200 && $window.sessionStorage.token && !AuthenticationService.isAuthenticated) {
                AuthenticationService.isAuthenticated = true;
            }
            return response || $q.when(response);
        },

        /* Revoke client authentication if 401 is received */
        responseError: function(rejection) {
            if (rejection != null && rejection.status === 401 && ($window.sessionStorage.token || AuthenticationService.isAuthenticated)) {
                delete $window.sessionStorage.token;
                AuthenticationService.isAuthenticated = false;
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
        },

        like: function(id) {
            return $http.post(options.api.base_url  + '/post/like', {'id': id});
        },

        unlike: function(id) {
            return $http.post(options.api.base_url  + '/post/unlike', {'id': id}); 
        }
    };
});

appServices.factory('UserService', function ($http) {
    return {
        signIn: function(username, password) {
            return $http.post(options.api.base_url + '/user/signin', {username: username, password: password});
        },

        logOut: function() {
            return $http.get(options.api.base_url + '/user/logout');
        },

        register: function(username, password, passwordConfirmation) {
            return $http.post(options.api.base_url + '/user/register', {username: username, password: password, passwordConfirmation: passwordConfirmation });
        }
    }
});

appServices.factory('LikeService', function ($window) {
    //Contains post ids already liked by the user
    var postLiked = [];

    if ($window.sessionStorage && $window.sessionStorage.postLiked) {
        postLiked.push($window.sessionStorage.postLiked);
    }


    return {
        isAlreadyLiked: function(id) {
            if (id != null) {
                for (var i in postLiked) {
                    if (postLiked[i] == id) {
                        return true;
                    }
                }

                return false;
            }

            return false;
        },

        like: function(id) {
            if (!this.isAlreadyLiked(id)) {
                postLiked.push(id);
                $window.sessionStorage.postLiked = postLiked;
            }
        },

        unlike: function(id) {
            if (this.isAlreadyLiked(id)) {
                for (var i in postLiked) {
                    if (postLiked[i] == id) {
                        postLiked.splice(i, 1);
                        $window.sessionStorage.postLiked = postLiked;
                        
                        break;
                    }
                }
            }
        }
    }
});