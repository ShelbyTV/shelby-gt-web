GuideView = Support.CompositeView.extend({

  // template : function(obj){
  //   return JST['frame'](obj);
  // },

  initialize : function(){
    this.model.bind('change', this.updateChild, this);
  },

  updateChild : function(){
    this._leaveChildren();
    var contentPaneProto = this.model.get('contentPaneView');
    var contentPaneModel = this.model.get('contentPaneModel');
    this.appendChild(new contentPaneProto({model: contentPaneModel}));
    contentPaneModel.fetch();
  },

  _cleanup : function() {
    this.model.unbind('change:displayedRoll', this.changeDisplayedRoll, this);
  }

});