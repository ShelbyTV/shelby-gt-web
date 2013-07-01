( function(){

  // shorten names of included library prototypes
  var RollHeaderView = libs.shelbyGT.RollHeaderView;
  var SearchHeaderView = libs.shelbyGT.SearchHeaderView;
  var IsoRollHeaderView = libs.shelbyGT.IsoRollHeaderView;

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
        //isolated roll also uses full app width IsoRollAppHeaderView, see dynamic.router.js
        if (this.model.has('currentRollModel')) {
          this.appendChild(new IsoRollHeaderView({model:this.model.get('currentRollModel')}));
        }
      } else {
        switch (this.model.get('displayState')) {
          case libs.shelbyGT.DisplayState.standardRoll :
          case libs.shelbyGT.DisplayState.watchLaterRoll :
            if (this.model.has('currentRollModel')) {
              this.appendChild(new RollHeaderView({
                model : this.model.get('currentRollModel'),
                guideModel : shelby.models.guide
              }));
            }
            break;
          case libs.shelbyGT.DisplayState.rollList :
            var userRoll = shelby.models.user.has('personal_roll_id') &&
                           libs.shelbyGT.RollModel.findOrCreate({id: shelby.models.user.get('personal_roll_id')});
            if (userRoll) {
              this.appendChild(new RollHeaderView({
                model : userRoll,
                guideModel : shelby.models.guide
              }));
            }
            break;
          case libs.shelbyGT.DisplayState.search :
            this.appendChild(new SearchHeaderView({}));
            break;
        }
      }
    }

  });

} ) ();
