angular.module('ask.bootstrap.filters', [])


.filter('markdown', function() {

	var md = window.markdownit('commonmark');

    return function(markdown) {

        if (!markdown)
            return ;

        return md.render(markdown) ;
    }
}) ;