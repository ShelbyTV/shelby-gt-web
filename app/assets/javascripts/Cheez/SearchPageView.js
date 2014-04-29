var SearchPageView = Backbone.View.extend({

    el: $('#searchwrapper'),
    
    initialize : function() {
        _.bindAll(this,
            'render',
            'handleSubmitClick');

        this.model.on("change:pending", function(a) {
            if (this.get('pending')) {
                $('#searchwrapper').addClass('pending');
                $('button.search-submit').addClass('disabled');
            } else {
                $('#searchwrapper').removeClass('pending');
                $('button.search-submit').removeClass('disabled');
            }
        });

    },
    
    events : {
        'click .search-submit': 'handleSubmitClick',
        'keypress .search-header input' : 'handleKeypress'
    },

    render: function () {
        var template = _.template($('#searchPageHeader').html());

        this.$el.empty();
        this.$el.append(template(this.model.toJSON()));
    },
    
    handleSubmitClick: function (e) {
        var query; 

        // prevent default form submit
        e.preventDefault();

        // fetch query from DOM
        query = this.$el.find('input.query').val();

        this.getSearchResults(this.model, query);
    },
    
    handleKeypress : function(e) {
        
        // only do stuff if the key pressed is enter
        if (e.keyCode === 13) {
            // fetch query from DOM
            var query = this.$el.find('input.query').val();

            this.getSearchResults(this.model, query);
        }
    },
    
    getSearchResults: function (model, query) {
        if (model.get('pending')) {
            return;
        }

        model.set({
            'page': 1,
            'type' : ""
        });

        // navigate app to term page for query
        search_app.router.navigate(encodeURIComponent(query), { trigger: true });
    }
});


// Helper view: displays null state message
var SearchPageNullStateView = Backbone.View.extend({
    render : function() {
        this.$el.empty();
        this.$el.append(_.template($('#searchNullState').html()));

        return this.$el;
    }
});