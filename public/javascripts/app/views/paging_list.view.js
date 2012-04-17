libs.shelbyGT.PagingListView = libs.shelbyGT.ListView.extend({
  
  _loadCounts: {
    total: 0,
    requested: 0
  },
  
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
    this._loadCounts.requested = this.options.limit;
    this.$el.append(this.template());
    libs.shelbyGT.ListView.prototype.initialize.call(this);
  },

  _cleanup : function(){
    this.model.unbind('relational:change:'+this.options.collectionAttribute, this._onItemsLoaded, this);
    libs.shelbyGT.ListView.prototype._cleanup.call(this);
  },

  _onItemsLoaded : function(rollModel, items){
    this.$('.js-load-more').removeClass('js-loading').html('Load more');
    if (!this.options.infinite && items.length < this._loadCounts.requested) {
      // if the load returned less items than we requested, there are no more items to
      // be loaded and we remove the DOM element that is clicked for more loading
      this.$('.js-load-more').hide();
    }
  },

  addOne : function(item){
    this._loadCounts.total++;
    libs.shelbyGT.ListView.prototype.addOne.call(this, item);
  },

  _loadMore : function(){
    var fetchData = {
      limit : this.options.limit,
      skip : this._loadCounts.total
    };
    _(fetchData).extend(this.options.fetchParams);
    this._loadCounts.requested = fetchData.limit;
    this.$('.js-load-more').addClass('js-loading').html('Loading...');
    this.model.fetch({
      add : true,
      data : fetchData
    });
  }

});
