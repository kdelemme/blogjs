appFilters.filter('permalink', function () {
    return function (value) {
        return (!value) ? '' : value.replace(/ /g, '-');
    };
});