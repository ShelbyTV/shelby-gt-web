libs.shelbyGT.EmptyActivityIndicatorView = Support.CompositeView.extend({

  tagName : 'li',

  events : {
    "click .js-goto-stream" : "_navigate"
  },

  template : function(obj){
    return SHELBYJST['activity-empty-indicator'](obj);
  },

  render : function(){
    this.$el.html(this.template());
  },

  _navigate : function(){
    shelby.router.navigate("stream", {trigger:true});
  }

});
