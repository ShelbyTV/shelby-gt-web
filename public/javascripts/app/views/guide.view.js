GuideView = Support.CompositeView.extend({

  // template : function(obj){
  //   return JST['frame'](obj);
  // },

  initialize : function(){
    this.model.bind('change:displayedRoll', this.changeDisplayedRoll, this);
  },

  render : function(){
    this.model.get('displayedRoll').fetch();
  },

  changeDisplayedRoll : function(guide, roll){
    this._leaveChildren();
    this.appendChild(new RollView({model: roll}));
    this.render();
  },

  _cleanup : function() {
	  this.model.unbind('change:displayedRoll', this.changeDisplayedRoll, this);
  }

});
