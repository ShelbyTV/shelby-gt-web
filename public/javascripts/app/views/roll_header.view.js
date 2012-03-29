libs.shelbyGT.RollHeaderView = Support.CompositeView.extend({

  events : {
    "click .js-share-roll" : "_showShareRoll"
  },

  el : '#roll-header',

  template : function(obj){
    return JST['roll-header'](obj);
  },

  initialize : function(){
    this.render();
    this.model.bind('change:sharableRollDisplayed', this._updateVisibility, this);
  },

  _cleanup : function(){
    this.model.unbind('change:sharableRollDisplayed', this._updateVisibility, this);
  },

  render : function(){
    this.$el.html(this.template());
    if (this.model.get('sharableRollDisplayed')) this.$el.show();
  },

  _showShareRoll : function(){
    shelby.views.shareRoll = new libs.shelbyGT.ShareRollView();
  },

  _updateVisibility: function(guideModel, sharableRollDisplayed){
    if (sharableRollDisplayed) {
      this.$el.show();
    } else {
      this.$el.hide();
    }
  }

});
