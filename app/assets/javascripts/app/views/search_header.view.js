libs.shelbyGT.SearchHeaderView = Support.CompositeView.extend({

  className : 'search-header clearfix',

  events : {
    "submit #js-video-search-form" : "_onSearchSubmit"
  },

  template : function(obj){
    return SHELBYJST['search-header'](obj);
  },

  render : function(){
    this.$el.html(this.template({search : shelby.models.videoSearch}));
  },

  _onSearchSubmit : function() {
    var query = this.$('#js-video-search-query-input').val();
    console.log('query',query);
    shelby.models.videoSearch.set('query', query);
    shelby.models.videoSearch.trigger('search');
    return false;
  }

});
