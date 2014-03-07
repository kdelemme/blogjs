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
            controller: 'PostListCtrl',
            access: { requiredLogin: false }
        }).
        when('/post/:id', {
            templateUrl: 'partials/post.view.html',
            controller: 'PostViewCtrl',
            access: { requiredLogin: false }
        }).
        when('/tag/:tagName', {
            templateUrl: 'partials/post.list.html',
            controller: 'PostListTagCtrl',
            access: { requiredLogin: false }
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
            controller: 'AdminUserCtrl',
            access: { requiredLogin: false }
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

app.run(function($rootScope, $location, AuthenticationService) {
    $rootScope.$on("$routeChangeStart", function(event, nextRoute, currentRoute) {
        if (nextRoute.access.requiredLogin && !AuthenticationService.isLogged) {
            $location.path("/admin/login");
        }
    });
});