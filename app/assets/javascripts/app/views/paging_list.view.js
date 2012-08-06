libs.shelbyGT.PagingListView = libs.shelbyGT.SmartRefreshListView.extend({
  
  _numItemsLoaded : 0,

  _numItemsRequested : 0,

  _loadMoreEnabled : true,

  _loadInProgress : false,
  
  events : {
    "click .js-load-more:not(.js-loading)" : "_loadMore"
  },

  options : _.extend({}, libs.shelbyGT.SmartRefreshListView.prototype.options, {
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
    if (this.options.infinite) {
      this._initInfiniteScrolling();
    }
    this.model.bind('relational:change:'+this.options.collectionAttribute, this._onItemsLoaded, this);
    this._numItemsLoaded = 0;
    this._numItemsRequested = this.options.limit;
    this.$el.append(this.template());
    libs.shelbyGT.SmartRefreshListView.prototype.initialize.call(this);
  },

  _cleanup : function(){
    this.model.unbind('relational:change:'+this.options.collectionAttribute, this._onItemsLoaded, this);
    $('#js-guide-body').unbind('scroll');
    libs.shelbyGT.SmartRefreshListView.prototype._cleanup.call(this);
  },

  _attachMasterCollection : function(){
    libs.shelbyGT.SmartRefreshListView.prototype._attachMasterCollection.call(this);
    this._numItemsLoaded = this._simulatedMasterCollection.length;
  },

  _prepareMasterCollection : function() {
    libs.shelbyGT.SmartRefreshListView.prototype._prepareMasterCollection.call(this);
    this._numItemsLoaded = this._simulatedMasterCollection.length;
  },

  _initInfiniteScrolling : function(){
    var self = this;
    var wrapper = $('#js-guide-body');
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
    if (items.length < this._numItemsRequested) {
      // if the load returned less items than we requested, there are no more items to
      // be loaded and we hide the DOM element that is clicked for more loading
      this._disableLoadMore();
    } else {
      this._loadMoreEnabled = true;
    }
  },

  _onFetchSuccess : function(model, response){
    if (!this._doesResponseContainListCollection(response)) {
      // special case - if a given load returns everything up to exactly the last item
      // in the collection, the next load will not even contain the collection attribute - this
      // is how the API responds when the skip and limit parameters restrict the result set
      // to nothing

      // since the relational:change handler (this._onItemsLoaded) will not be triggered in this case,
      // manually hide the DOM element that is clicked for more loading
      this._disableLoadMore();
    }
    this._loadInProgress = false;
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
    this._loadMoreEnabled = false;
  },

  _addItem : function(item, collection, options){
    this._numItemsLoaded++;
    libs.shelbyGT.SmartRefreshListView.prototype._addItem.call(this, item, collection, options);
  },

  _loadMore : function(){
    if (!this._loadInProgress) {
      this._loadInProgress = true;

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
  }

});
