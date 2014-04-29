// ReSharper disable InconsistentNaming
// Basic model of a single search result
var SearchResultModel = Backbone.RelationalModel.extend({
    
});

// A collection of SearchResultModels
var SearchResultCollection = Backbone.Collection.extend({
    model : SearchResultModel
});

// A model that ecapsulates a SearchResultCollection and some metadata
var SearchResultsModel = Backbone.Model.extend({
    defaults : {
        count: 0,
        results: new Backbone.Collection()
    },
    parse : function(attrs) {
        var results_collection = new SearchResultCollection(attrs.models);

        return {
            count: attrs.count,
            results: results_collection
        };
    }
});

// Models a search query and provides urls for collection syncing
var SearchQueryModel = Backbone.Model.extend({
    defaults: {
        "base_url": '/api/search',
        "term": '',
        "page": 1,
        "page_size" : 28,
        "type" : '',
        "pending" : false
    },
    
    getSearchQueryURL: function () {
        var obj = this.toJSON();
        var term = obj.term;
        if (obj.type && obj.type.length)
            term += " type:" + obj.type;

        var url = obj.base_url
            + "?q=" + encodeURIComponent(term)      
            + "&page=" + obj.page
            + "&pageSize=" + obj.page_size;

        return url;
    },
    
    getDisplayURL: function() {
        var obj = this.toJSON(),
            term = encodeURIComponent(obj.term),
            type = encodeURIComponent(obj.type);

        if (type.length) {
            return term + "/type/" + type;
        } else {
            return term;
        }
        
    }
});
// ReSharper restore InconsistentNaming
