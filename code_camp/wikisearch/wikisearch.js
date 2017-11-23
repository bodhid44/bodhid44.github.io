/*global jQuery */
(function($) {
  'use strict';

  $('.ui.search').search({
    minCharacters : 3,
    apiSettings   : {
      onResponse: function(res) {
        var retValue = {"results": []};

        if (res && res.query && res.query.pages && res.query.pages.length > 0) {
          retValue.results = res.query.pages.map( function(p) {
            var r = {
              id: p.pageid,
              image: '',
              title: p.title,
              description: '',
              url: '//en.wikipedia.org/wiki/' + p.title.replace(/ /g,'_') 
            };
            if (p.terms && p.terms.description){
              r.description = p.terms.description;
            }
            if (p.thumbnail && p.thumbnail.source) {
              r.image = p.thumbnail.source;
            }
            return r;
          });
        }
        return retValue;
      },
      url: '//en.wikipedia.org/w/api.php?action=query&format=json&formatversion=2&generator=prefixsearch&prop=pageprops|pageimages|pageterms&redirects=&ppprop=displaytitle&piprop=thumbnail&pithumbsize=80&pilimit=6&wbptterms=description&gpssearch={query}&gpsnamespace=0&gpslimit=6&origin=*'
    },
    onSelect: function(result, response) {
      return false;
    },
    onResultsAdd: function(html) {
      $('a.result').attr('target', '_blank');
    }
  });

}(jQuery));