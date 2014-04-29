var SearchResultCardCollectionView = Backbone.View.extend({

    className : "span29",

    query_model: null,

    initialize: function (args) {

        var me = this;

        this.query_model = args.query_model;

        this.model.on('sync', me.render, this);

        this.model.on('sync', function () {
            this.query_model.set({ 'pending': false })
        }, this);
    },

    render: function () {
        this.$el.empty();

        var $wrap = $('<div>'), 
            results = this.model.get('results');

        

        // Walk through search results and render SearchResultCardViews for each result
        results.each(function (model) {
            var card_view = new SearchResultCardView({
                model: model
            });

            $wrap.append(card_view.render());

        });

        this.$el.append($wrap);

        return this.$el;
    },



});