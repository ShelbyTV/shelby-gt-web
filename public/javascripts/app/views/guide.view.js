GuideView = Backbone.View.extend({

  // template : function(obj){
  //   return JST['frame'](obj);
  // },

  _currentRollView: null, //TODO: make this a property of the guide model

  initialize : function(){
    this.model.bind('change:displayedRoll', this.changeDisplayedRoll, this);
  },

  render : function(){
    $(this.el).html(this._currentRollView.el);
    this.model.get('displayedRoll').fetch();
  },

  selectRoll : function(model){
	this.model.set('displayedRoll', model);
  },

  changeDisplayedRoll : function(guide, roll){
    if (this._currentRollView) {
      this._currentRollView.remove();
    }
    this._currentRollView = new RollView({model : roll});
    this.render();
  }

});
