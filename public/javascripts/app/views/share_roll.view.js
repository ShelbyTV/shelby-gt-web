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

  /*_cleanup : function(){
    this.model.unbind('change', this.render, this);

    this.model.unbind('destroy', this.remove, this);
    shelby.models.guide.unbind('change:activeFrameId', this._onNewActiveFrame, this);
  }*/

});
