libs.shelbyGT.SearchEmptyIndicatorView = Support.CompositeView.extend({

  tagName : 'li',

  events : {
    "click .js-community-link"     : "_goToCommunity"
  },

  template : function(obj){
    return SHELBYJST['search-empty-indicator'](obj);
  },

  render : function(){
    this.$el.html(this.template());
  },

  _goToCommunity : function() {
    shelby.router.navigate('community', {trigger:true});
  }

});
