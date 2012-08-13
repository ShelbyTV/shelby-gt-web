( function(){

  /*
  // shorten names of included library prototypes
  var RollFilterControlsView = libs.shelbyGT.RollFilterControlsView;
  */

  libs.shelbyGT.GuidePresentationSelectorView = Support.CompositeView.extend({
    
    events : {
      "click .js-stream:not(.guide-presentation-content-selected)"   : "_goToStream",
      "click .js-my-rolls:not(.guide-presentation-content-selected)" : "_filterMyRolls",
      "click .js-explore:not(.guide-presentation-content-selected)"   : "_explore"
    },

    /*el : '#js-guide-presentation-selector',*/

    template : function(obj){
      return JST['guide-presentation-selector'](obj);
    },

    initialize : function(){
      this.model.bind('change', this._onGuideModelChanged, this);
    },

    _cleanup : function(){
      this.model.unbind('change', this._onGuideModelChanged, this);
    },

    render : function(){
      this.$el.html(this.template({user:shelby.models.user}));
      this._setSelected();
    },
    
    _goToStream : function(){
      shelby.router.navigate('stream', {trigger: true});
    },
    
    _filterMyRolls : function(){
      shelby.router.navigate('rolls/my_rolls',{trigger:true});
    },
    
    _explore : function(){
      shelby.router.navigate('explore',{trigger:true});
    },

    _onGuideModelChanged : function(model){
      var _changedAttrs = _(model.changedAttributes());
      // only update selection rendering if relevant attribtues have been updated
      if (!_changedAttrs.has('displayState') &&
          !_changedAttrs.has('rollListContent')) {
        return;
      }
      this._setSelected();
    },

    _setSelected : function(){
      this._clearSelected();

      var $setSelectedClassOn = null;
      if (this.model.get('displayState') == libs.shelbyGT.DisplayState.rollList) {
        switch (this.model.get('rollListContent')) {
          case libs.shelbyGT.GuidePresentation.content.rolls.myRolls :
            $setSelectedClassOn = this.$('.js-my-rolls');
            break;
        }
      } else if (this.model.get('displayState') == libs.shelbyGT.DisplayState.dashboard) {
        $setSelectedClassOn = this.$('.js-stream');
      } else if (this.model.get('displayState') == libs.shelbyGT.DisplayState.explore) {
        $setSelectedClassOn = this.$('.js-explore');
      }

      if ($setSelectedClassOn) {
        $setSelectedClassOn.addClass('guide-presentation-content-selected');
      }
    },

    _clearSelected : function(){
      this.$('.js-content-selector button, .js-stream').removeClass('guide-presentation-content-selected');
    }

  });

} ) ();
