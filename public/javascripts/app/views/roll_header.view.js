libs.shelbyGT.RollHeaderView = Support.CompositeView.extend({

  events : {
    "click .js-share-roll" : "_showShareRoll",
  },

  el : '#roll-header',

  template : function(obj){
    return JST['roll-header'](obj);
  },

  initialize : function(){
    this.render();
  },

  render : function(){
    this.$el.html(this.template());
  },

  hide : function(){
    this.$el.hide();
  },

  show : function(){
    this.$el.show();
  },

  _showShareRoll : function(){
    shelby.views.shareRoll = new libs.shelbyGT.ShareRollView();
  }

  /*_cleanup : function(){
    this.model.unbind('change', this.render, this);
    this.model.unbind('destroy', this.remove, this);
    shelby.models.guide.unbind('change:activeFrameId', this._onNewActiveFrame, this);
  }*/

});
