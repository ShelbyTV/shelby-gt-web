libs.shelbyGT.SearchEmptyIndicatorView = Support.CompositeView.extend({

  tagName : 'li',

  events : {
    "click .js-featured-link"     : "_goToExplore"
  },

  template : function(obj){
    return SHELBYJST['search-empty-indicator'](obj);
  },

  render : function(){
    this.$el.html(this.template());
  },

  _goToExplore : function() {
    shelby.router.navigate('explore', {trigger:true});
  }

});
