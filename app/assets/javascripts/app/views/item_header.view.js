( function(){

  // shorten names of included library prototypes
  var RollHeaderView = libs.shelbyGT.RollHeaderView;
  var SearchHeaderView = libs.shelbyGT.SearchHeaderView;
  var RollOverlayContextView = libs.shelbyGT.RollOverlayContextView;

  libs.shelbyGT.ItemHeaderView = Support.CompositeView.extend({

    el : '#js-item-header',

    initialize : function(opts){
      this._options = opts.options || {};
      this.model.bind('change', this._updateChild, this);
    },

    _cleanup : function(){
      this.model.unbind('change', this._updateChild, this);
    },

    render : function(){
      this._mapInsertContentsView();
    },

    _updateChild : function(guideModel){
      var _changedAttrs = _(guideModel.changedAttributes());
      if (_changedAttrs.has('displayState') ||
          _changedAttrs.has('currentRollModel') ||
          _changedAttrs.has('displayIsolatedRoll')) {
        this.render();
      }
    },

    _mapInsertContentsView : function(){
      this._leaveChildren();
      if (this.model.get('displayIsolatedRoll')) {
        if (this.model.has('currentRollModel')) {
          this.appendChild(new RollOverlayContextView({model:this.model.get('currentRollModel')}));
        }
      } else {
        switch (this.model.get('displayState')) {
          case libs.shelbyGT.DisplayState.standardRoll :
            if (this.model.has('currentRollModel')) {
              this.appendChild(new RollHeaderView({model:this.model.get('currentRollModel')}));
            }
            break;
          case libs.shelbyGT.DisplayState.watchLaterRoll :
          case libs.shelbyGT.DisplayState.dashboard :
          case libs.shelbyGT.DisplayState.rollList :
            break;
          case libs.shelbyGT.DisplayState.search :
            this.appendChild(new SearchHeaderView({}));
            break;
        }
      }
    }

  });

} ) ();
