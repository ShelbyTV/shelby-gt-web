libs.shelbyGT.SearchHeaderView = Support.CompositeView.extend({

  className : 'search-header clearfix',

  events : {
    "submit #js-video-search-form" : "_onSearchSubmit"
  },

  template : function(obj){
    return SHELBYJST['search-header'](obj);
  },

  initialize : function(){
    shelby.models.videoSearch.bind("change:query", this.render, this);
  },

  _cleanup : function(){
    shelby.models.videoSearch.unbind("change:query", this.render, this);
  },

  render : function(){
    this.$el.html(this.template({search : shelby.models.videoSearch}));
  },

  _onSearchSubmit : function() {
    var query = this.$('#js-video-search-query-input').val();
    shelby.models.videoSearch.set('query', query);
    shelby.models.videoSearch.trigger('search');
    return false;
  }

});
