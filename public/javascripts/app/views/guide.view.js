GuideView = Support.CompositeView.extend({

  // template : function(obj){
  //   return JST['frame'](obj);
  // },

  _currentRollView: null, //TODO: make this a property of the guide model

  initialize : function(){
    this.model.bind('change:displayedRoll', this.changeDisplayedRoll, this);
  },

  render : function(){
    this.$el.html(this._currentRollView.el);
    this.model.get('displayedRoll').fetch();
  },

  changeDisplayedRoll : function(guide, roll){
    if (this._currentRollView) {
      this._currentRollView.leave();
    }
    this._currentRollView = new RollView({model : roll});
    this.render();
  },

  _cleanup : function() {
	this.model.unbind('change:displayedRoll', this.changeDisplayedRoll, this);
  }

});
