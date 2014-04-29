var SearchRouter = Backbone.Router.extend({
    // Map of possible routes to be handled client-side
    // ReSharper disable InconsistentNaming
    routes : {
       '': 'defaultRoute',
       ':term': 'filteredRoute',
       ':term/type/:type': 'filteredRoute'
    },
   
    results_collection: null,
   
    search_page_view: null,
    
    query_model: null,
    
    init_query: null,
   
    // Run on load, populate components defined above
    initialize: function (args) {

        this.init_query = args.init_query; 

        this.results_model = new SearchResultsModel();
        
        this.query_model = new SearchQueryModel({});
        
        this.search_page_view = new SearchPageView({
            model : this.query_model
        });

        var me = this;
        
        this.query_model.on('change:page', function() {
            me.results_model.url = me.query_model.getSearchQueryURL();
            me.results_model.fetch();
        });
        
        this.query_model.on('change:type', function () {
            me.results_model.url = me.query_model.getSearchQueryURL();
            me.results_model.fetch();
            me.navigate('/' + me.query_model.getDisplayURL(), { trigger: false });
        });
    },

    // handle default route (/)
    defaultRoute: function () {
        var me = this,
            null_state;
        
        this.search_page_view.render();
        
        null_state = new SearchPageNullStateView();
        
        $('#results-row').append(null_state.render());
        
        if (this.init_query) {
            _.defer(function () {
                me.navigate('/' + encodeURIComponent(me.init_query), { trigger: true });
            });
        }
    },

    // handle a route with parameters
    // /:term/ OR /:term/type/:type/
    filteredRoute : function(term, type) {
        var clean_term = decodeURIComponent(term);
        var clean_type = type ? decodeURIComponent(type) : null;

        if (type) {
            this.query_model.set({
                'term': clean_term,
                'type': clean_type
            });
        } else {
            this.query_model.set({ 'term': clean_term });
        }
        
        this.search_page_view.render({
            model: this.query_model
        });
            
        this.results_model.url = this.query_model.getSearchQueryURL();

        this.query_model.set({ 'pending': true });
        this.results_model.fetch({
            success:
                function (data, response) {
                if (response.error) {
                    $('#results-row').empty();
                    $('#results-row').append('<div class="chz-alert">There was a problem!  Please try again in a few minutes.</div>');
                }
            }
        });

        var filter_controls_view = new SearchResultFilterControlsView({
            model: this.results_model,
            query_model: this.query_model
        });

        $('#results-metadata').append(filter_controls_view.render()); 

        var results_view = new SearchResultCardCollectionView({
            model: this.results_model,
            query_model : this.query_model
        });

        $('#results-row').append(results_view.render());
    }
    // ReSharper restore InconsistentNaming
});

