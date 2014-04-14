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
            access: { requiredLogin: true }
        }).
        when('/admin/post/create', {
            templateUrl: 'partials/admin.post.create.html',
            controller: 'AdminPostCreateCtrl',
            access: { requiredLogin: true }
        }).
        when('/admin/post/edit/:id', {
            templateUrl: 'partials/admin.post.edit.html',
            controller: 'AdminPostEditCtrl',
            access: { requiredLogin: true }
        }).
        when('/admin/login', {
            templateUrl: 'partials/admin.login.html',
            controller: 'AdminUserCtrl'
        }).
        when('/admin/logout', {
            templateUrl: 'partials/admin.logout.html',
            controller: 'AdminUserCtrl',
            access: { requiredLogin: true }
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
        //redirect only if both isLogged is false and no token is set
        if (nextRoute != null && nextRoute.access != null && nextRoute.access.requiredLogin 
            && !AuthenticationService.isLogged && !$window.sessionStorage.token) {

            $location.path("/admin/login");
        }
    });
});