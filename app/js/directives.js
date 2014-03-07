appDirectives.directive('checkAuthentication', ['$rootScope', '$location', 'AuthenticationService', function ($root, $location, AuthenticationService) {
    return {
        restrict: 'A',
        link: function (scope, elem, attrs, ctrl) {
            $root.$on('$routeChangeStart', function(event, nextRoute, currentRoute){
                if (nextRoute.access.requiredLogin && !AuthenticationService.isLogged) {
                    $location.path("/admin/login");
                }
            });
        }
    }
}]);