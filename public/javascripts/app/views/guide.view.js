GuideView = Support.CompositeView.extend({

  // template : function(obj){
  //   return JST['frame'](obj);
  // },

  initialize : function(){
    this.model.bind('change', this.updateChild, this);
  },

  updateChild : function(guide, item){
    this._leaveChildren();
    this.appendChild(new this.model.get('childPane')({model: item}));
    this.model.get('displayedItem').fetch();
  },

  _cleanup : function() {
	  this.model.unbind('change:displayedRoll', this.changeDisplayedRoll, this);
  }

});
