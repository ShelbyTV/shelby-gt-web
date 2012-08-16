( function(){

  /*
  // shorten names of included library prototypes
  var RollFilterControlsView = libs.shelbyGT.RollFilterControlsView;
  */

  libs.shelbyGT.GuidePresentationSelectorView = Support.CompositeView.extend({
    
    events : {
      "click .js-stream:not(.guide-presentation-content-selected)"   : "_goToStream",
      "click .js-queue:not(.guide-presentation-content-selected)"   : "_goToQueue",
      "click .js-my-rolls:not(.guide-presentation-content-selected)" : "_filterMyRolls",
      "click .js-browse:not(.guide-presentation-content-selected)"   : "_browseRolls"
    },

    /*el : '#js-guide-presentation-selector',*/

    template : function(obj){
      return JST['guide-presentation-selector'](obj);
    },

    initialize : function(){
      this.model.bind('change', this._onGuideModelChanged, this);
      this.render();
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

    _goToQueue : function(){
      shelby.router.navigate('queue', {trigger: true});
    },
    
    _filterMyRolls : function(){
      shelby.router.navigate('rolls/my_rolls',{trigger:true});
    },
    
    _browseRolls : function(){
      shelby.router.navigate('rolls/browse',{trigger:true});
    },

    _onGuideModelChanged : function(model){
      var _changedAttrs = _(model.changedAttributes());
      if (_changedAttrs.has('displayState') ||
          _changedAttrs.has('displayIsolatedRoll')) {
      }
      // only update selection rendering if relevant attribtues have been updated
      if (!_changedAttrs.has('displayState') &&
          !_changedAttrs.has('rollListContent')) {
        return;
      }
      this._setSelected();
    },

    _setSelected : function(){
      this._clearSelected();

      if (this.model.get('displayState') == libs.shelbyGT.DisplayState.dashboard) {
        this.$('.js-stream').addClass('guide-presentation-content-selected');
      } else if (this.model.get('displayState') == libs.shelbyGT.DisplayState.rollList) {
        var $setSelectedClassOn;
        switch (this.model.get('rollListContent')) {
          case libs.shelbyGT.GuidePresentation.content.rolls.myRolls :
            $setSelectedClassOn = this.$('.js-my-rolls');
            break;
          case libs.shelbyGT.GuidePresentation.content.rolls.browse :
            $setSelectedClassOn = this.$('.js-browse');
            break;
        }
        $setSelectedClassOn.addClass('guide-presentation-content-selected');
      } else if (this.model.get('displayState') == libs.shelbyGT.DisplayState.watchLaterRoll) {
        this.$('.js-queue').addClass('guide-presentation-content-selected');
      }
    },

    _clearSelected : function(){
      this.$('.js-content-selector button').removeClass('guide-presentation-content-selected');
    }

  });

} ) ();
