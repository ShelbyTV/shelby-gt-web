( function(){

  // shorten names of included library prototypes
  var RollFilterControlsView = libs.shelbyGT.RollFilterControlsView;

  libs.shelbyGT.FilterControlsView = Support.CompositeView.extend({

    el : '#js-filter-controls',

    initialize : function(){
      this.model.bind('change', this._updateChild, this);
    },

    _cleanup : function(){
      this.model.unbind('change', this._updateChild, this);
    },

    render : function(){
      this._mapInsertFilterControlsView();
    },

    _updateChild : function(guideModel){
      var changedAttrs = guideModel.changedAttributes();
      if (changedAttrs.displayState || changedAttrs.currentRollModel) {
        this.render();
      }
    },

    _mapInsertFilterControlsView : function(){
      this._leaveChildren();
      switch (this.model.get('displayState')) {
        case libs.shelbyGT.DisplayState.standardRoll :
        case libs.shelbyGT.DisplayState.userPublicRoll :
          this.appendChild(new RollFilterControlsView({model:this.model.get('currentRollModel')}));
          break;
        case libs.shelbyGT.DisplayState.dashboard :
        case libs.shelbyGT.DisplayState.rollList :
        case libs.shelbyGT.DisplayState.watchLaterRoll :
          break;
      }
    }

  });

} ) ();