angular.module('ask.bootstrap.filters', [])


.filter('markdown', function() {

    var converter = new Showdown.converter();

    return function(markdown) {

        if (!markdown)
            return ;

        return converter.makeHtml(markdown) ;
    }
}) ;