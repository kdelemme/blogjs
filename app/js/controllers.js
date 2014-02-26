appControllers.controller('PostListCtrl', ['$scope', '$http', '$location', '$sce',
	function PostListCtrl($scope, $http, $location, $sce) {

		$scope.posts = [];

		$http.get(options.api.base_url + '/post', {withCredentials: true}).success(function(data) {
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

appControllers.controller('PostViewCtrl', ['$scope', '$routeParams', '$http', '$location', '$sce',
	function PostViewCtrl($scope, $routeParams, $http, $location, $sce) {

		$scope.post = {};
		var post_url = $routeParams.postUrl;

		$http.get(options.api.base_url + '/post/' + post_url, {withCredentials: true}).success(function(data) {
			data.content = $sce.trustAsHtml(data.content);
			$scope.post = data;
		}).error(function(data, status) {
			console.log(status);
			console.log(data);
		})
	}
]);


appControllers.controller('AdminPostListCtrl', ['$scope', '$http', '$location', '$timeout',
	function AdminPostListCtrl($scope, $http, $location, $timeout) {

		$scope.posts = [];

		//Get id, title, date_created, is_published, number of Read
		$http.get(options.api.base_url + '/post', {withCredentials: true}).success(function(data) {
			$scope.posts = data;
		});

		$scope.updatePublishState = function updatePublishState(post, shouldPublish) {
			if (post !== undefined && shouldPublish !== undefined) {

				$http.put(options.api.base_url + '/post', {'post': {_id: post._id, is_published: shouldPublish}}, {withCredentials: true}).success(function(data) {
					var posts = $scope.posts;
					for (var postKey in posts) {
			    		if (posts[postKey]._id == post._id) {
			    			$scope.posts[postKey].is_published = shouldPublish;
			    			return ;
			    		}
		    		}
				}).error(function(status, data) {
					console.log(status);
					console.log(data);
				});
			}
		}


		$scope.deletePost = function deletePost(post) {
			if (post != undefined) {

				$http.delete(options.api.base_url + '/post/' + post._id, {withCredentials: true}).success(function(data) {
					var posts = $scope.posts;
					for (var postKey in posts) {
			    		if (posts[postKey]._id == post._id) {
			    			$scope.posts.splice(postKey, 1);
			    			return ;
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

appControllers.controller('AdminPostCreateCtrl', ['$scope', '$http', '$location', 
	function AdminPostCreateCtrl($scope, $http, $location) {

		$scope.message = {is_error: false, is_success: false, message: ""};
		$('#textareaContent').wysihtml5({"font-styles": false});

		$scope.save = function save(post, shouldPublish) {
			if (post !== undefined 
				&& post.title !== undefined 
				&& post.url !== undefined
				&& post.tags != undefined) {

				var content = $('#textareaContent').val();
				if (content !== undefined) {
					post.content = content;

					if (shouldPublish !== undefined && shouldPublish == true) {
						post.is_published = true;
					} else {
						post.is_published = false;
					}

					$http.post(options.api.base_url + '/post', {'post': post}, {withCredentials: true}).success(function(data) {
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

appControllers.controller('AdminPostEditCtrl', ['$scope', '$routeParams', '$http', '$location', '$sce',
	function AdminPostEditCtrl($scope, $routeParams, $http, $location, $sce) {

		$scope.message = {is_error: false, is_success: false, message: ""};

		$scope.post = {};
		var postUrl = $routeParams.postUrl;

		$http.get(options.api.base_url + '/post/' + postUrl, {withCredentials: true}).success(function(data) {
			$scope.post = data;
			$('#textareaContent').wysihtml5({"font-styles": false});
			$('#textareaContent').val($sce.trustAsHtml(data.content));
		}).error(function(status, data) {
			$location.path("/admin");
		});

		$scope.save = function save(post, shouldPublish) {
			console.log(post);
			if (post !== undefined 
				&& post.title !== undefined && post.title != "" 
				&& post.url !== undefined && post.url != "") {

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
					
					$http.put(options.api.base_url + '/post', {'post': post}, {withCredentials: true}).success(function(data) {
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

appControllers.controller('AdminUserCtrl', ['$scope', '$http', '$location', 'AuthenticationService', 
	function AdminUserCtrl($scope, $http, $location, AuthenticationService) {

		//Admin User Controller (login, logout)
		$scope.logIn = function logIn(username, password) {
			if (username !== undefined && password !== undefined) {

				$http.post(options.api.base_url + '/login', {username: username, password: password}, {withCredentials: true}).success(function(data) {
					AuthenticationService.isLogged = true;
					$location.path("/admin");
				}).error(function(status, data) {
					console.log(status);
					console.log(data);
				});
			}
		}

		$scope.logout = function logout() {
			if (AuthenticationService.isLogged) {
				AuthenticationService.isLogged = false;
				$location.path("/");
			}
		}
	}
]);


appControllers.controller('PostListTagCtrl', ['$scope', '$routeParams', '$http', '$location', '$sce',
	function PostListTagCtrl($scope, $routeParams, $http, $location, $sce) {

		$scope.posts = [];
		var tagName = $routeParams.tagName;

		$http.get(options.api.base_url + '/tag/' + tagName, {withCredentials: true}).success(function(data) {
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

