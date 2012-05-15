( function(){

  // shorten names of included library prototypes
  var RollFilterControlsView = libs.shelbyGT.RollFilterControlsView;

  libs.shelbyGT.FilterControlsView = Support.CompositeView.extend({

    el : '#js-filter-controls',

    initialize : function(opts){
      this._options = opts.options || {};
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
        case libs.shelbyGT.DisplayState.userPersonalRoll :
          this.appendChild(new RollFilterControlsView({model:this.model.get('currentRollModel'), options:this._options.rollFilterControlsViewOptions}));
          break;
        case libs.shelbyGT.DisplayState.dashboard :
        case libs.shelbyGT.DisplayState.rollList :
        case libs.shelbyGT.DisplayState.watchLaterRoll :
          break;
      }
    }

  });

} ) ();