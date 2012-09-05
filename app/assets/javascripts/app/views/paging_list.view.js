libs.shelbyGT.PagingMethod = {
  count : 'count',
  key : 'key'
};

libs.shelbyGT.PagingListView = libs.shelbyGT.SmartRefreshListView.extend({
  
  _numItemsLoaded : 0,

  _numItemsRequested : 0,

  _lastKeyValue : '',

  _loadMoreEnabled : false,

  _loadInProgress : false,

  events : function() {
    var events = {
      "click .js-load-more:not(.js-loading)" : "_loadMore"
    };
    if (this.options.infinite) {
      _(events).extend({
        "inview .js-load-more" : "_onLoadMoreInView"
      });
    }
    return events;
  },

  options : _.extend({}, libs.shelbyGT.SmartRefreshListView.prototype.options, {
    firstFetchLimit : 0,
    insert : {
      position : 'before',
      selector : '.js-load-more'
    },
    infinite: false,
    limit : 5,
    pagingMethod : libs.shelbyGT.PagingMethod.key,
    pagingKeySortOrder : 1 // 1 for ascending, -1 for descending
  }),

  template : function(obj){
    return JST['load-more'](obj);
  },

  initialize : function(){
    var self = this;
    this.model.bind('relational:change:'+this.options.collectionAttribute, this._onItemsLoaded, this);
    if (this.options.pagingMethod == libs.shelbyGT.PagingMethod.count) {
      this._numItemsLoaded = 0;
    }
    this._numItemsRequested = this.options.firstFetchLimit ? this.options.firstFetchLimit : this.options.limit;
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
    this._updatePagingParameters();
  },

  _prepareMasterCollection : function() {
    libs.shelbyGT.SmartRefreshListView.prototype._prepareMasterCollection.call(this);
    this._updatePagingParameters();
  },

  _updatePagingParameters : function() {
    if (this.options.pagingMethod == libs.shelbyGT.PagingMethod.count) {
      this._numItemsLoaded = this._simulatedMasterCollection.length;
    } else if (this.options.pagingMethod == libs.shelbyGT.PagingMethod.key) {
      //assuming data already sorted by id
      if (this._simulatedMasterCollection.length) {
        this._lastKeyValue = this._simulatedMasterCollection.last().id;
      } else  {
        this._lastKeyValue = '';
      }
    }
  },

  _onItemsLoaded : function(rollModel, items){
    this.$('.js-load-more').removeClass('js-loading').show();
    this.$('.js-load-more-button').html('Load more');
    if (items.length < this._numItemsRequested) {
      // if the load returned less items than we requested, there are no more items to
      // be loaded and we hide the DOM element that is clicked for more loading
      this._disableLoadMore();
    } else {
      this._loadMoreEnabled = true;
    }
  },

  _onFetchSuccess : function(model, response){
    var self = this;
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
    if (this._loadMoreEnabled) {
      setTimeout(function(){
        // it's possible that not enough new items were displayed to scroll the load more indicator
        // out of view - if not, we should fetch again
        if (self._loadMoreEnabled && self.$('.js-load-more').data('inview')) {
          self._loadMore();
        }
      }, 250);
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
    this._loadMoreEnabled = false;
  },

  _addItem : function(item, collection, options){
    if (this.options.pagingMethod == libs.shelbyGT.PagingMethod.count) {
      this._numItemsLoaded++;
    } else if (this.options.pagingMethod == libs.shelbyGT.PagingMethod.key) {
      if (!this._lastKeyValue ||
          this.options.pagingKeySortOrder == 1 && item.id > this._lastKeyValue ||
          this.options.pagingKeySortOrder == -1 && item.id < this._lastKeyValue) {
        this._lastKeyValue = item.id;
      }
    }
    libs.shelbyGT.SmartRefreshListView.prototype._addItem.call(this, item, collection, options);
  },

  _loadMore : function(){
    if (!this._loadInProgress) {
      this._loadInProgress = true;

      var self = this;
      var fetchData = {
        limit : this.options.limit
      };
      if (this.options.pagingMethod == libs.shelbyGT.PagingMethod.count) {
        fetchData.skip = this._numItemsLoaded;
      } else if (this.options.pagingMethod == libs.shelbyGT.PagingMethod.key) {
        if (this._lastKeyValue) {
          fetchData.since_id = this._lastKeyValue;
        }
      }
      _(fetchData).extend(this.options.fetchParams);
      this._numItemsRequested = fetchData.limit;
      this.$('.js-load-more').addClass('js-loading');
      this.$('.js-load-more-button').html('Loading...');
      this.model.fetch({
        add : true,
        data : fetchData,
        success: function(model, response){self._onFetchSuccess(model, response);}
      });
    }
  },

  _onLoadMoreInView : function(e, isInView) {
    if (isInView && this._loadMoreEnabled) {
      this._loadMore();
    }
  }

});