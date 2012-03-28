libs.shelbyGT.GuideView = Support.CompositeView.extend({

  // template : function(obj){
  //   return JST['frame'](obj);
  // },
  el: '#guide',

  initialize : function(){
    this.model.bind('change', this.updateChild, this);
  },

  _cleanup : function() {
    this.model.unbind('change', this.updateChild, this);
  },

  updateChild : function(model){
    // only render a new content pane if the contentPane* attribtues have been updated
    var changedAttrs = model.changedAttributes();
    if (!changedAttrs.contentPaneView && !changedAttrs.contentPaneModel) {
      return;
    }
    this._leaveChildren();
    var contentPaneProto = this.model.get('contentPaneView');
    var contentPaneModel = this.model.get('contentPaneModel');
    this.appendChild(new contentPaneProto({model: contentPaneModel}));
    //contentPaneModel.fetch();
  }

});
