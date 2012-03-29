libs.shelbyGT.RollHeaderView = Support.CompositeView.extend({

  events : {
    "click .js-share-roll" : "_toggleShareRollVisibility"
  },

  el : '#roll-header',

  _shareRollView: null,

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
    this._shareRollView = new libs.shelbyGT.ShareRollView();
    this.renderChild(this._shareRollView);
    if (this.model.get('sharableRollDisplayed')) this.$el.show();
  },

  _toggleShareRollVisibility : function(){
    this._shareRollView.$el.toggle();
  },

  _updateVisibility: function(guideModel, sharableRollDisplayed){
    if (sharableRollDisplayed) {
      this.$el.show();
    } else {
      // collapse/hide child views
      this._shareRollView.$el.hide();
      this.$el.hide();
    }
  }

});
