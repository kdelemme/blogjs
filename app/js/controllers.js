appControllers.controller('PostListCtrl', ['$scope', '$sce', 'PostService',
    function PostListCtrl($scope, $sce, PostService) {

        $scope.posts = [];

        PostService.findAllPublished().
            then(function(data) {
                for (var postKey in data) {
                    data[postKey].content = $sce.trustAsHtml(data[postKey].content);
                }

                $scope.posts = data;            
            }, function(data, status) {
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

        PostService.read(id).
            then(function(data) {
                data.content = $sce.trustAsHtml(data.content);
                $scope.post = data;
            }, function(data, status) {
                console.log(status);
                console.log(data);
            });

        //Like a post
        $scope.likePost = function likePost() {
            if (!LikeService.isAlreadyLiked(id)) {
                PostService.like(id).
                    then(function(data) {
                        $scope.post.likes++;
                        LikeService.like(id);
                        $scope.isAlreadyLiked = true;
                    }, function(data, status) {
                        console.log(status);
                        console.log(data);
                    });
            }
        };

        //Unlike a post
        $scope.unlikePost = function unlikePost() {
            if (LikeService.isAlreadyLiked(id)) {
                PostService.unlike(id).
                    then(function(data) {
                        $scope.post.likes--;
                        LikeService.unlike(id);
                        $scope.isAlreadyLiked = false;
                    }, function(data, status) {
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

                PostService.changePublishState(post._id, shouldPublish).
                    then(function(data) {
                        var posts = $scope.posts;
                        for (var postKey in posts) {
                            if (posts[postKey]._id == post._id) {
                                $scope.posts[postKey].is_published = shouldPublish;
                                break;
                            }
                        }
                    }, function(status, data) {
                        console.log(status);
                        console.log(data);
                    });
            }
        }


        $scope.deletePost = function deletePost(id) {
            if (id != undefined) {

                PostService.delete(id).
                    then(function(data) {
                        var posts = $scope.posts;
                        for (var postKey in posts) {
                            if (posts[postKey]._id == id) {
                                $scope.posts.splice(postKey, 1);
                                break;
                            }
                        }
                    }, function(status, data) {
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

                    PostService.create(post).
                        then(function(data) {
                            $location.path("/admin");
                        }, function(status, data) {
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

        PostService.read(id).
            then(function(data) {
                $scope.post = data;
                $('#textareaContent').wysihtml5({"font-styles": false});
                $('#textareaContent').val($sce.trustAsHtml(data.content));
            }, function(status, data) {
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
                    
                    PostService.update(post).
                        then(function(data) {
                            $location.path("/admin");
                        }, function(status, data) {
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

                UserService.signIn(username, password).
                    then(function(data) {
                        AuthenticationService.isAuthenticated = true;
                        $window.sessionStorage.token = data.token;
                        $location.path("/admin");
                    }, function(status, data) {
                        console.log(status);
                        console.log(data);
                    });
            }
        }

        $scope.logOut = function logOut() {
            if (AuthenticationService.isAuthenticated) {
                
                UserService.logOut().
                    then(function(data) {
                        AuthenticationService.isAuthenticated = false;
                        delete $window.sessionStorage.token;
                        $location.path("/");
                    }, function(status, data) {
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
                UserService.register(username, password, passwordConfirm).
                    then(function(data) {
                        $location.path("/admin/login");
                    }, function(status, data) {
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

        PostService.findByTag(tagName).
            then(function(data) {
                for (var postKey in data) {
                    data[postKey].content = $sce.trustAsHtml(data[postKey].content);
                }
                $scope.posts = data;
            }, function(status, data) {
                console.log(status);
                console.log(data);
            });

    }
]);

