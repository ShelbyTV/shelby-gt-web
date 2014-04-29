var SearchResultFilterControlsView = Backbone.View.extend({
    className: 'search-filter-controls',

    initialize: function (args) {
        var me = this;

        me.query_model = args.query_model;

        me.model.on('sync', me.render, this);

        me.model.on('sync', function () {
            me.query_model.set({ 'pending': false })
        }, this);

    },

    render: function () {
        var
            me = this,
            metadata_view,
            pagination_controls_view,
            type_filter_view, 
            $row_two = $('<div class="row">'); 

        this.$el.empty();

        type_filter_view = new SearchResultsTypeFilterControlsView({
            model: this.model,
            query_model: this.query_model
        });

        metadata_view = new SearchResultsMetadataView({
            model: me.model,
            query_model : me.query_model
        });

        pagination_controls_view = new SearchResultsPaginationControlsView({
            model: this.model,
            query_model: this.query_model
        });

        $row_two.append(metadata_view.render(), pagination_controls_view.render());

        this.$el.append(type_filter_view.render(), $row_two);

        return this.$el;
        
    }
});

var SearchResultFilterControlSubView = Backbone.View.extend({
    query_model: null,
    initialize: function (args) {
        this.query_model = args.query_model;
    },
});

var SearchResultsMetadataView = SearchResultFilterControlSubView.extend({
    className : 'span10',
    query_model: null,
    initialize: function (args) {
        this.query_model = args.query_model;
    },
    render : function() {
        this.$el.empty();

        if (this.model.get('results').length < 1) {
            return this.$el;
        }

        var page_count = parseInt(this.model.get('count') / this.query_model.get('page_size'));

        this.$el.append("<p class='count-label'>" + this.model.get('count') + " total results &bull; Page" + this.query_model.get('page') + " (Of " + (page_count + 1) + ")</p>");
        return this.$el;
    }
});

var SearchResultsPaginationControlsView = SearchResultFilterControlSubView.extend({
    className: 'span15',
    events : {
        'click .pagination a.previous': 'handlePaginationPreviousClick',
        'click .pagination a.next': 'handlePaginationNextClick',
        'click .pagination a.page': 'handlePaginationClick'
    },

    render: function () {
        var $div = $('<div class="pagination pager-chz "></div>'),
            $ul = $('<ul>'),
            page_count = Math.ceil(this.model.get('count') / 28),
            current_page = this.query_model.get('page'),
            pages_in_control = 5, 
            starting_i, 
            ending_i;

        this.$el.empty();
        
        if ((this.model.get('results').length < 1) || page_count < 2) {
            return this.$el; 
        }

        $ul.append('<li><a class="previous">Previous</a></li>');
          

        if (current_page < 2) {
            $ul.find('.previous').parent().addClass('disabled');
            $ul.find('.previous').addClass('disabled');
        }


        if (page_count < pages_in_control) {
            starting_i = 1;
            ending_i = page_count;
        } else if (current_page < 3) {
            starting_i = 1;
            ending_i = starting_i + pages_in_control;
        } else {
            starting_i = current_page - 2;
            ending_i = starting_i + pages_in_control;
        }
        
        if ((page_count - current_page) < 3) {
            starting_i = page_count - pages_in_control;
            if (starting_i < 1) {
                starting_i = 1; 
            }
            ending_i = page_count;
        }
        
        for (var i = starting_i ; i <= ending_i; i++) {
            var $li = $('<li><a class="page">' + i + '</a></li>');

            if (i == this.query_model.get('page')) {
                $li.addClass('active')
            }

            $ul.append($li);
        }

        $ul.append('<li><a class="next">Next</a></li>');

        if (current_page == page_count) {
            $ul.find(".next").parent().addClass("disabled");
            $ul.find(".next").addClass("disabled");
        }

        $div.append($ul);

        this.$el.append($div);
        return this.$el;
    },

    handlePaginationClick: function (e) {
        var $t = $(e.target),
            page_int = parseInt($t.html());

        this.query_model.set({
            'page': page_int,
            'pending': true
        });

    },
    
    handlePaginationPreviousClick: function (e) {
        
        if ($(e.target).hasClass('disabled')) {
            return; 
        }

        this.query_model.set({
            'page': this.query_model.get('page') - 1,
            'pending': true
        });
    },
    
    handlePaginationNextClick: function (e) {
        
        if ($(e.target).hasClass('disabled')) {
            return;
        }

        this.query_model.set({
            'page': this.query_model.get('page') + 1,
            'pending': true
        });
    }
});

var SearchResultsTypeFilterControlsView = SearchResultFilterControlSubView.extend({
    className: 'row type-filter-control',
    asset_types: [
        'all','image','gif','video','list'
    ],
    events: {
        'click li a': 'handleTypeClick'
    },
    render: function () {
        var li_template = "<li><a class='{{ type }}'>{{ type }}</a></li>",
            $inner_div = $('<div class="span29">'),
            $ul = $('<ul>'), 
            current_type = this.query_model.get('type');

        _.each(this.asset_types, function (type) {
            $ul.append(_.template(li_template, {'type': type })); 
        });

        if (current_type !== '') {
            $ul.find('.' + this.query_model.get('type')).parent().addClass('active');
        } else {
            $ul.find('.all').parent().addClass('active');
        }
        
        $inner_div.append('<h3>View:</h3>')
        $inner_div.append($ul);

        this.$el.append($inner_div);
        return this.$el;
    },
    handleTypeClick: function (e) {
        var $t = $(e.target);

        var type_string = $t.attr('class'), 
            set_string;

        // If it's already selected, do nothing
        if ($t.parent().hasClass('active')) {
            return;
        }
        
        $t.parent().toggleClass('active');

        if (this.query_model.get('type') === type_string) {
            set_string = "";
        } else {
            set_string = type_string;
        }
        
        if (set_string === 'all') {
            set_string = "";
        }
        
        this.query_model.set({
            'type': set_string,
            'pending': true,
            'page' : 1
        });
    }
});