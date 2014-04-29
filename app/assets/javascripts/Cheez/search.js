

define([], function () {
    var search = {}, 
        on_page_query;

    on_page_query = $("#url_query").html(); 

    search.setup = function() {
        _.templateSettings = {
            interpolate: /\{\{(.+?)\}\}/g
        };

        search_app = {};
        
        search_app.router = new SearchRouter({
            init_query : on_page_query
        });
        
        Backbone.history.start({ pushState: false });
        
    };

    return search; 
});
