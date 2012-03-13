GuideView = Support.CompositeView.extend({

  // template : function(obj){
  //   return JST['frame'](obj);
  // },

  initialize : function(){
    this.model.bind('change', this.updateChild, this);
  },

  updateChild : function(){
    this._leaveChildren();
    var childPaneProto = this.model.get('childPane');
    this.appendChild(new childPaneProto({model: this.model.get('displayedItem')}));
    //this.appendChild(new guide.get('childPane')({model: guide.get('displayedItem')}));
    this.model.get('displayedItem').fetch();
  },

  _cleanup : function() {
    this.model.unbind('change:displayedRoll', this.changeDisplayedRoll, this);
  }

});