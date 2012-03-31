( function(){

  // shorten names of included library prototypes
  var RollFilterControlsView = libs.shelbyGT.RollFilterControlsView;

  libs.shelbyGT.FilterControlsView = Support.CompositeView.extend({

    el : '#js-filter-controls',

    initialize : function(){
      this.model.bind('change:displayState change:currentRollModel', this.render, this);
    },

    _cleanup : function(){
      this.model.unbind('change:displayState change:currentRollModel', this.render, this);
    },

    render : function(){
      this._mapInsertFilterControlsView();
    },

    _mapInsertFilterControlsView : function(){
      this._leaveChildren();
      switch (this.model.get('displayState')) {
        case libs.shelbyGT.DisplayState.standardRoll :
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