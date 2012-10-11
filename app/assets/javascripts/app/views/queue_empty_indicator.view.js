libs.shelbyGT.QueueEmptyIndicatorView = Support.CompositeView.extend({
  
  tagName : 'li',

  events : {
    "click .js-goto-tools" : "_goToBrowserTools"
  },

  template : function(obj){
    return SHELBYJST['queue-empty-indicator'](obj);
  },

  render : function(){
    this.$el.html(this.template());
  },

  _goToBrowserTools : function(){
    shelby.router.navigate("tools", {trigger:true});
  }

});