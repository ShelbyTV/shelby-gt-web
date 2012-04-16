libs.shelbyGT.PagingListView = libs.shelbyGT.ListView.extend({
  
  _itemsLoaded : 0,
  
  events : {
    "click .js-load-more"              : "_loadMore"
  },

  initialize : function(){
    _(this.options).extend({
      insert : {
        position : 'before',
        selector : '.js-load-more'
      },
    });
    this.$el.append('<li class="js-load-more" style="display:none">Load more</li>');
    this.model.get(this.options.collectionAttribute).bind('reset', this._onLoadFinished, this);
    libs.shelbyGT.ListView.prototype.initialize.call(this);
  },

  _cleanup : function(){
    this.model.get(this.options.collectionAttribute).unbind('reset', this._onLoadFinished, this);
    libs.shelbyGT.ListView.prototype._cleanup.call(this);
  },

  _onLoadFinished : function(){
    this.$('.js-load-more').show();
  },

  addOne : function(item){
    console.log('loading one');
    this._itemsLoaded++;
    libs.shelbyGT.ListView.prototype.addOne.call(this, item);
  },

  _loadMore : function(){
    var fetchData = {
      skip : this._itemsLoaded
    };
    _(fetchData).extend(this.options.fetchParams);
    this.model.fetch({
      add : true,
      data : fetchData
    });
  }

});
