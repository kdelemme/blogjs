'use strict';

var app = angular.module('app', ['ngRoute', 'appControllers', 'appServices', 'appDirectives', 'appFilters']);

var appControllers = angular.module('appControllers', []);
var appServices = angular.module('appServices', []);
var appDirectives = angular.module('appDirectives', []);
var appFilters = angular.module('appFilters', []);

var options = {};
options.api = {};
options.api.base_url = "http://localhost:3001";


app.config(['$locationProvider', '$routeProvider', 
  function($location, $routeProvider) {
    //$location.html5Mode(false).hashPrefix('!');

    $routeProvider.
        when('/', {
            templateUrl: 'partials/post.list.html',
            controller: 'PostListCtrl',
            access: { requiredLogin: false }
        }).
        when('/post/:postUrl', {
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
        when('/admin/post/edit/:postUrl', {
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
