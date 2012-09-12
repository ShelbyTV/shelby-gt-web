( function(){

  // shorten names of included library prototypes
  var RollHeaderView = libs.shelbyGT.RollHeaderView;
  var RollOverlayContextView = libs.shelbyGT.RollOverlayContextView;

  libs.shelbyGT.ItemHeaderView = Support.CompositeView.extend({

    el : '#js-item-header',

    initialize : function(opts){
      this._options = opts.options || {};
      this.model.bind('change', this._updateChild, this);
      console.log('init item header view');
    },

    _cleanup : function(){
      this.model.unbind('change', this._updateChild, this);
    },

    render : function(){
      this._mapInsertContentsView();
      console.log('render item header view', $('#js-roll-action-menu').height());
      var allHeadersHeight = _.reduce($("#js-guide-header"), function(memo, el){ return memo + $(el).height(); }, 0);
      $('#js-guide-body').css('top', allHeadersHeight + $('#js-roll-action-menu').height());
      console.log(allHeadersHeight);
    },

    _updateChild : function(guideModel){
      var _changedAttrs = _(guideModel.changedAttributes());
      if (_changedAttrs.has('displayState') ||
          _changedAttrs.has('currentRollModel') ||
          _changedAttrs.has('displayIsolatedRoll')) {
        this.render();
      }
      //  TODO:
      //  THIS IS WHERE THE PROBLEM IS, 
      //  set height isn't being called here. and needs to be.
      var allHeadersHeight = _.reduce($("#js-guide-header"), function(memo, el){ return memo + $(el).height(); }, 0);
      $('#js-guide-body').css('top', allHeadersHeight);
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
        }
      }
    }

  });

} ) ();
