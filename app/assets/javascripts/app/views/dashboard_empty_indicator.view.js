libs.shelbyGT.DashboardEmptyIndicatorView = Support.CompositeView.extend({

  tagName : 'li',

  events : {
    "click .js-featured-link"   : "_goToFeatured",
    "click .js-preferences-link" : "_goToPreferences"
  },

  template : function(obj){
    return SHELBYJST['dashboard-empty-indicator'](obj);
  },

  render : function(){
    this.$el.html(this.template());
  },

  _goToFeatured : function() {
    shelby.router.navigate('featured', {trigger:true});
  },

  _goToPreferences : function() {
    shelby.router.navigate('preferences', {trigger:true});
  }

});
