libs.shelbyGT.DashboardEmptyIndicatorView = Support.CompositeView.extend({

  tagName : 'li',

  events : {
    "click .js-community-link"   : "_goToCommunity",
    "click .js-preferences-link" : "_goToPreferences"
  },

  template : function(obj){
    return SHELBYJST['dashboard-empty-indicator'](obj);
  },

  render : function(){
    this.$el.html(this.template());
  },

  _goToCommunity : function() {
    shelby.router.navigate('community', {trigger:true});
  },

  _goToPreferences : function() {
    shelby.router.navigate('preferences', {trigger:true});
  }

});
