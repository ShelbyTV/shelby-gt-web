( function(){

  // shorten names of included library prototypes
  var GuideModel = libs.shelbyGT.ListView;
  var DashboardView = libs.shelbyGT.DashboardView;
  var RollListView = libs.shelbyGT.RollListView;
  var RollView = libs.shelbyGT.RollView;

  libs.shelbyGT.GuideView = Support.CompositeView.extend({

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
      if (!changedAttrs.displayState && !changedAttrs.currentRollModel) {
        return;
      }
      this._leaveChildren();
      this._mapAppendChildView();
    },

    _mapAppendChildView : function(){
      var displayComponents;
      switch (this.model.get('displayState')) {
        case libs.shelbyGT.DisplayState.dashboard :
          displayComponents = {
            viewProto : DashboardView,
            model : shelby.models.dashboard
          };
         break;
        case libs.shelbyGT.DisplayState.rollList :
          displayComponents = {
            viewProto : RollListView,
            model : shelby.models.user
          };
          break;
        case libs.shelbyGT.DisplayState.standardRoll :
        case libs.shelbyGT.DisplayState.watchLaterRoll :
          displayComponents = {
            viewProto : RollView,
            model : this.model.get('currentRollModel')
          };
          break;
      }

      this.appendChild(new displayComponents.viewProto({model: displayComponents.model}));
    }

  });

} ) ();