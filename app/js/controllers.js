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
		$scope.message = {is_error: false, is_success: false, message: ""};

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

		    		updateMessage(true, "Nice job! Keep going ;)");

				}).error(function(status, data) {
					updateMessage(false, "Oups! Things went wrong...");
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

		    		updateMessage(true, "Nice job! Keep going ;)");
				}).error(function(status, data) {
					updateMessage(false, "Oups! Things went wrong...");
				});
			}
		}

		var updateMessage = function(is_success, message) {
			$scope.message.is_error = !is_success;
			$scope.message.is_succes = is_success;
			$scope.message.message = message;

			$timeout(function() {
				$scope.message.is_error = false;
				$scope.message.is_success = false;	
			}, 3000);
		}
	}
]);

appControllers.controller('AdminPostCreateCtrl', ['$scope', '$http', '$location', 
	function AdminPostCreateCtrl($scope, $http, $location) {

		$scope.message = {is_error: false, is_success: false, message: ""};
		$('#textareaContent').wysihtml5({"font-styles": false});

		$scope.save = function save(post, shouldPublish) {
			if (post !== undefined 
				&& post.title !== undefined && post.title != "" 
				&& post.url !== undefined && post.url != "") {

				var content = $('#textareaContent').val();
				if (content !== undefined && content != "") {
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

appControllers.controller('AdminUserCtrl', ['$scope', '$http', '$location', 
	function AdminUserCtrl($scope, $http, $location) {

		//Admin User Controller (login, logout)
		$scope.logIn = function logIn(email, password) {

		}

		$scope.logout = function logout() {

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

