libs.shelbyGT.DashboardEmptyIndicatorView = Support.CompositeView.extend({
  
  tagName : 'li',

  events : {
    "click .js-explore-link"     : "_goToExplore",
    "click .js-preferences-link" : "_goToPreferences"
  },

  template : function(obj){
    return SHELBYJST['dashboard-empty-indicator'](obj);
  },

  render : function(){
    this.$el.html(this.template());
  },

  _goToExplore : function() {
    shelby.router.navigate('explore', {trigger:true});
  },

  _goToPreferences : function() {
    shelby.router.navigate('preferences', {trigger:true});
  }

});