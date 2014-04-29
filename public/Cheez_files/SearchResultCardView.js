

var SearchResultCardView = Backbone.View.extend({
    className: 'search-result-card',
    initialize : function() {
    },
    render: function () {
        var short_title = this.model.get('title') || 'Untitled',
            $anchor = $('<a>'), 
            truncate_length = 32;
        
        if (short_title.length > truncate_length) {
            short_title = short_title.substr(0, truncate_length - 3) + '...';
        }

        $anchor.attr('href', this.model.get('post_url'));

        $anchor.append('<span class="title">' + short_title + '</span>');
        
        //if (this.model.get('is_animated')) {
            $anchor.append('<img src="' + this.model.get('url') + '"/>');
        /**} else {
            $anchor.append('<img src="' + this.model.get('preview_url') + '"/>');
        }**/
            
        if (this.model.get('asset_type_name') === 'video') {
            $anchor.append('<div class="video-indicator">'
                + '<div class="icon-background">'
                + '<div class="icons" data-icon="&#xe004">&nbsp;</div>'
                + '</div></div>');
        }

        this.$el.append($anchor);
        
        return this.$el;    
    }
});