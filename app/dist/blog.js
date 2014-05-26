'use strict';

var app = angular.module('app', ['ngRoute', 'appControllers', 'appServices', 'appDirectives']);

var appServices = angular.module('appServices', []);
var appControllers = angular.module('appControllers', []);
var appDirectives = angular.module('appDirectives', []);

var options = {};
options.api = {};
options.api.base_url = "http://localhost:3001";


app.config(['$locationProvider', '$routeProvider', 
  function($location, $routeProvider) {
    $routeProvider.
        when('/', {
            templateUrl: 'partials/post.list.html',
            controller: 'PostListCtrl'
        }).
        when('/post/:id', {
            templateUrl: 'partials/post.view.html',
            controller: 'PostViewCtrl'
        }).
        when('/tag/:tagName', {
            templateUrl: 'partials/post.list.html',
            controller: 'PostListTagCtrl'
        }).
        when('/admin', {
            templateUrl: 'partials/admin.post.list.html',
            controller: 'AdminPostListCtrl',
            access: { requiredAuthentication: true }
        }).
        when('/admin/post/create', {
            templateUrl: 'partials/admin.post.create.html',
            controller: 'AdminPostCreateCtrl',
            access: { requiredAuthentication: true }
        }).
        when('/admin/post/edit/:id', {
            templateUrl: 'partials/admin.post.edit.html',
            controller: 'AdminPostEditCtrl',
            access: { requiredAuthentication: true }
        }).
        when('/admin/register', {
            templateUrl: 'partials/admin.register.html',
            controller: 'AdminUserCtrl'
        }).
        when('/admin/login', {
            templateUrl: 'partials/admin.signin.html',
            controller: 'AdminUserCtrl'
        }).
        when('/admin/logout', {
            templateUrl: 'partials/admin.logout.html',
            controller: 'AdminUserCtrl',
            access: { requiredAuthentication: true }
        }).
        otherwise({
            redirectTo: '/'
        });
}]);


app.config(function ($httpProvider) {
    $httpProvider.interceptors.push('TokenInterceptor');
});

app.run(function($rootScope, $location, $window, AuthenticationService) {
    $rootScope.$on("$routeChangeStart", function(event, nextRoute, currentRoute) {
        //redirect only if both isAuthenticated is false and no token is set
        if (nextRoute != null && nextRoute.access != null && nextRoute.access.requiredAuthentication 
            && !AuthenticationService.isAuthenticated && !$window.sessionStorage.token) {

            $location.path("/admin/login");
        }
    });
});
appControllers.controller('PostListCtrl', ['$scope', '$sce', 'PostService',
    function PostListCtrl($scope, $sce, PostService) {

        $scope.posts = [];

        PostService.findAllPublished().success(function(data) {
            for (var postKey in data) {
                data[postKey].content = $sce.trustAsHtml(data[postKey].content);
            }

            $scope.posts = data;            
        }).error(function(data, status) {
            console.log(status);
            console.log(data);
        });
    }
]);

appControllers.controller('PostViewCtrl', ['$scope', '$routeParams', '$location', '$sce', 'PostService', 'LikeService',
    function PostViewCtrl($scope, $routeParams, $location, $sce, PostService, LikeService) {

        $scope.post = {};
        var id = $routeParams.id;

        $scope.isAlreadyLiked = LikeService.isAlreadyLiked(id);

        PostService.read(id).success(function(data) {
            data.content = $sce.trustAsHtml(data.content);
            $scope.post = data;
        }).error(function(data, status) {
            console.log(status);
            console.log(data);
        });

        //Like a post
        $scope.likePost = function likePost() {
            if (!LikeService.isAlreadyLiked(id)) {
                PostService.like(id).success(function(data) {
                    $scope.post.likes++;
                    LikeService.like(id);
                    $scope.isAlreadyLiked = true;
                }).error(function(data, status) {
                    console.log(status);
                    console.log(data);
                });
            }
        };

        //Unlike a post
        $scope.unlikePost = function unlikePost() {
            if (LikeService.isAlreadyLiked(id)) {
                PostService.unlike(id).success(function(data) {
                    $scope.post.likes--;
                    LikeService.unlike(id);
                    $scope.isAlreadyLiked = false;
                }).error(function(data, status) {
                    console.log(status);
                    console.log(data);
                });
            }
        }

    }
]);


appControllers.controller('AdminPostListCtrl', ['$scope', 'PostService', 
    function AdminPostListCtrl($scope, PostService) {
        $scope.posts = [];

        PostService.findAll().success(function(data) {
            $scope.posts = data;
        });

        $scope.updatePublishState = function updatePublishState(post, shouldPublish) {
            if (post != undefined && shouldPublish != undefined) {

                PostService.changePublishState(post._id, shouldPublish).success(function(data) {
                    var posts = $scope.posts;
                    for (var postKey in posts) {
                        if (posts[postKey]._id == post._id) {
                            $scope.posts[postKey].is_published = shouldPublish;
                            break;
                        }
                    }
                }).error(function(status, data) {
                    console.log(status);
                    console.log(data);
                });
            }
        }


        $scope.deletePost = function deletePost(id) {
            if (id != undefined) {

                PostService.delete(id).success(function(data) {
                    var posts = $scope.posts;
                    for (var postKey in posts) {
                        if (posts[postKey]._id == id) {
                            $scope.posts.splice(postKey, 1);
                            break;
                        }
                    }
                }).error(function(status, data) {
                    console.log(status);
                    console.log(data);
                });
            }
        }
    }
]);

appControllers.controller('AdminPostCreateCtrl', ['$scope', '$location', 'PostService',
    function AdminPostCreateCtrl($scope, $location, PostService) {
        $('#textareaContent').wysihtml5({"font-styles": false});

        $scope.save = function save(post, shouldPublish) {
            if (post != undefined 
                && post.title != undefined
                && post.tags != undefined) {

                var content = $('#textareaContent').val();
                if (content != undefined) {
                    post.content = content;

                    if (shouldPublish != undefined && shouldPublish == true) {
                        post.is_published = true;
                    } else {
                        post.is_published = false;
                    }

                    PostService.create(post).success(function(data) {
                        $location.path("/admin");
                    }).error(function(status, data) {
                        console.log(status);
                        console.log(data);
                    });
                }
            }
        }
    }
]);

appControllers.controller('AdminPostEditCtrl', ['$scope', '$routeParams', '$location', '$sce', 'PostService',
    function AdminPostEditCtrl($scope, $routeParams, $location, $sce, PostService) {
        $scope.post = {};
        var id = $routeParams.id;

        PostService.read(id).success(function(data) {
            $scope.post = data;
            $('#textareaContent').wysihtml5({"font-styles": false});
            $('#textareaContent').val($sce.trustAsHtml(data.content));
        }).error(function(status, data) {
            $location.path("/admin");
        });

        $scope.save = function save(post, shouldPublish) {
            if (post !== undefined 
                && post.title !== undefined && post.title != "") {

                var content = $('#textareaContent').val();
                if (content !== undefined && content != "") {
                    post.content = content;

                    if (shouldPublish != undefined && shouldPublish == true) {
                        post.is_published = true;
                    } else {
                        post.is_published = false;
                    }

                    // string comma separated to array
                    if (Object.prototype.toString.call(post.tags) !== '[object Array]') {
                        post.tags = post.tags.split(',');
                    }
                    
                    PostService.update(post).success(function(data) {
                        $location.path("/admin");
                    }).error(function(status, data) {
                        console.log(status);
                        console.log(data);
                    });
                }
            }
        }
    }
]);

appControllers.controller('AdminUserCtrl', ['$scope', '$location', '$window', 'UserService', 'AuthenticationService',  
    function AdminUserCtrl($scope, $location, $window, UserService, AuthenticationService) {

        //Admin User Controller (signIn, logOut)
        $scope.signIn = function signIn(username, password) {
            if (username != null && password != null) {

                UserService.signIn(username, password).success(function(data) {
                    AuthenticationService.isAuthenticated = true;
                    $window.sessionStorage.token = data.token;
                    $location.path("/admin");
                }).error(function(status, data) {
                    console.log(status);
                    console.log(data);
                });
            }
        }

        $scope.logOut = function logOut() {
            if (AuthenticationService.isAuthenticated) {
                
                UserService.logOut().success(function(data) {
                    AuthenticationService.isAuthenticated = false;
                    delete $window.sessionStorage.token;
                    $location.path("/");
                }).error(function(status, data) {
                    console.log(status);
                    console.log(data);
                });
            }
            else {
                $location.path("/admin/login");
            }
        }

        $scope.register = function register(username, password, passwordConfirm) {
            if (AuthenticationService.isAuthenticated) {
                $location.path("/admin");
            }
            else {
                UserService.register(username, password, passwordConfirm).success(function(data) {
                    $location.path("/admin/login");
                }).error(function(status, data) {
                    console.log(status);
                    console.log(data);
                });
            }
        }
    }
]);


appControllers.controller('PostListTagCtrl', ['$scope', '$routeParams', '$sce', 'PostService',
    function PostListTagCtrl($scope, $routeParams, $sce, PostService) {

        $scope.posts = [];
        var tagName = $routeParams.tagName;

        PostService.findByTag(tagName).success(function(data) {
            for (var postKey in data) {
                data[postKey].content = $sce.trustAsHtml(data[postKey].content);
            }
            $scope.posts = data;
        }).error(function(status, data) {
            console.log(status);
            console.log(data);
        });

    }
]);


appDirectives.directive('displayMessage', function() {
	return {
		restrict: 'E',
		scope: {
        	messageType: '=type',
        	message: '=data'
      	},
		template: '<div class="alert {{messageType}}">{{message}}</div>',
		link: function (scope, element, attributes) {
            scope.$watch(attributes, function (value) {
            	console.log(attributes);
            	console.log(value);
            	console.log(element[0]);
                element[0].children.hide(); 
            });
        }
	}
});
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