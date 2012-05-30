( function(){

  // shorten names of included library prototypes
  var RollHeaderView = libs.shelbyGT.RollHeaderView;

  libs.shelbyGT.ItemHeaderView = Support.CompositeView.extend({

    el : '#js-item-header',

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
      var _changedAttrs = _(guideModel.changedAttributes());
      if (_changedAttrs.has('displayState') || _changedAttrs.has('currentRollModel')) {
        this.render();
      }
    },

    _mapInsertFilterControlsView : function(){
      this._leaveChildren();
      switch (this.model.get('displayState')) {
        case libs.shelbyGT.DisplayState.standardRoll :
          this.appendChild(new RollHeaderView({model:this.model.get('currentRollModel')}));
          break;
        case libs.shelbyGT.DisplayState.dashboard :
        case libs.shelbyGT.DisplayState.rollList :
        case libs.shelbyGT.DisplayState.watchLaterRoll :
          break;
      }
    }

  });

} ) ();