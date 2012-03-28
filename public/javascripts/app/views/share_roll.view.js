libs.shelbyGT.ShareRollView = Support.CompositeView.extend({

  events : {
    //"click .js-share-roll" : "_showShareRoll",
  },

  el : '#js-share-roll',

  template : function(obj){
    return JST['share-roll'](obj);
  },

  initialize : function(){
    this.render();
  },

  render : function(){
    this.$el.html(this.template());
  }

});
