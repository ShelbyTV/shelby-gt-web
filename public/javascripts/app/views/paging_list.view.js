libs.shelbyGT.PagingListView = libs.shelbyGT.ListView.extend({
  
  _numItemsLoaded : 0,

  _numItemsRequested : 0,
  
  events : {
    "click .js-load-more:not(.js-loading)" : "_loadMore"
  },

  options : _.extend({}, libs.shelbyGT.ListView.prototype.options, {
    insert : {
      position : 'before',
      selector : '.js-load-more'
    },
    infinite: false,
    limit : 5
  }),

  template : function(obj){
    return JST['load-more'](obj);
  },

  initialize : function(){
    this.model.bind('relational:change:'+this.options.collectionAttribute, this._onItemsLoaded, this);
    this._numItemsRequested = this.options.limit;
    this.$el.append(this.template());
    libs.shelbyGT.ListView.prototype.initialize.call(this);
  },

  _cleanup : function(){
    this.model.unbind('relational:change:'+this.options.collectionAttribute, this._onItemsLoaded, this);
    $('#js-guide-wrapper').unbind('scroll');
    libs.shelbyGT.ListView.prototype._cleanup.call(this);
  },

  _initInfiniteScrolling : function(){
    var self = this;
    var wrapper = $('#js-guide-wrapper');
    wrapper.scroll(function () {
      if (wrapper[0].scrollHeight - wrapper.scrollTop() == wrapper.outerHeight()) {
        var coll = self.model.get('frames') || self.model.get('dashboard_entries');
        if (coll.length > 9){
          self._loadMore();
        }
      }
    });
  },

  _onItemsLoaded : function(rollModel, items){
    this.$('.js-load-more').removeClass('js-loading').show();
    this.$('.load-more-button').html('Load more');
    if (!this.options.infinite && items.length < this._numItemsRequested) {
      // if the load returned less items than we requested, there are no more items to
      // be loaded and we hide the DOM element that is clicked for more loading
      this._disableLoadMore();
    }
  },

  _onFetchSuccess : function(model, response){
    if (!this.options.infinite && !this._doesResponseContainListCollection(response)) {
      // special case - if a given load returns everything up to exactly the last item
      // in the collection, the next load will not even contain the collection attribute - this
      // is how the API responds when the skip and limit parameters restrict the result set
      // to nothing

      // since the relational:change handler (this._onItemsLoaded) will not be triggered in this case,
      // manually hide the DOM element that is clicked for more loading
      this._disableLoadMore();
    }
  },

  _doesResponseContainListCollection : function(response) {
    // HACK: subclasses must override to specify how to know when the response contains
    // the collection that the list view is working for
    // WE SHOULDN'T NEED TO DO THIS, THE API SHOULD RETURN AN EMPTY ARRAY FOR THE ATTRIBUTE
    // WHEN THERE ARE NO RESULTS
    console.log('Sorry, your PagingListView subclass must override _doesResponseContainListCollection');
  },

  _disableLoadMore : function(){
    this.$('.js-load-more').hide();
  },

  relationalAddOne : function(item){
    this._numItemsLoaded++;
    libs.shelbyGT.ListView.prototype.relationalAddOne.call(this, item);
  },

  _loadMore : function(){
    var self = this;
    var fetchData = {
      limit : this.options.limit,
      skip : this._numItemsLoaded
    };
    _(fetchData).extend(this.options.fetchParams);
    this._numItemsRequested = fetchData.limit;
    this.$('.js-load-more').addClass('js-loading');
    this.$('.load-more-button').html('Loading...');
    this.model.fetch({
      add : true,
      data : fetchData,
      success: function(model, response){self._onFetchSuccess(model, response);}
    });
  }

});
