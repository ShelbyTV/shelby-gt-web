libs.shelbyGT.SearchEmptyIndicatorView = Support.CompositeView.extend({

  tagName : 'li',

  events : {
    "click .js-featured-link"     : "_goToFeatured"
  },

  template : function(obj){
    return SHELBYJST['search-empty-indicator'](obj);
  },

  render : function(){
    this.$el.html(this.template());
  },

  _goToFeatured : function() {
    shelby.router.navigate('featured', {trigger:true});
  }

});
