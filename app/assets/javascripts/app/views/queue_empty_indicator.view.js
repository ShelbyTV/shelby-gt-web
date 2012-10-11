libs.shelbyGT.QueueEmptyIndicatorView = Support.CompositeView.extend({
  
  tagName : 'li',

/*  events : {
    "click .js-explore-link"     : "_goToExplore",
    "click .js-preferences-link" : "_goToPreferences"
  },*/

  template : function(obj){
    return SHELBYJST['queue-empty-indicator'](obj);
  },

  render : function(){
    this.$el.html(this.template());
  }

});