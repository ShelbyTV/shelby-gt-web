( function(){

  /*
  // shorten names of included library prototypes
  var RollFilterControlsView = libs.shelbyGT.RollFilterControlsView;
  */

  libs.shelbyGT.GuidePresentationSelectorView = Support.CompositeView.extend({
    
    events : {
      "click .js-stream:not(.guide-presentation-content-selected)"   : "_goToStream",
      "click .js-people:not(.guide-presentation-content-selected)"   : "_filterPeople",
      "click .js-my-rolls:not(.guide-presentation-content-selected)" : "_filterMyRolls",
      "click .js-browse:not(.guide-presentation-content-selected)"   : "_browseRolls"
    },

    el : '#js-guide-presentation-selector',
    
    template : function(obj){
      return JST['guide-presentation-selector'](obj);
    },

    initialize : function(){
      this.model.bind('change:content', this._setSelected, this);
      shelby.models.guide.bind('change:displayState', this._setSelected, this);
    },

    _cleanup : function(){
      this.model.unbind('change:content', this._setSelected, this);
      shelby.models.guide.unbind('change:displayState', this._setSelected, this);
    },

    render : function(){
      this.$el.html(this.template({ config: this.model, guide: shelby.models.guide }));
      this._setSelected();
    },
    
    _goToStream : function(){
      shelby.router.navigate('stream', {trigger: true});
    },
    
    _filterPeople : function(){
      shelby.router.navigate('rolls/people',{trigger:true});
    },
    
    _filterMyRolls : function(){
      shelby.router.navigate('rolls/my_rolls',{trigger:true});
    },
    
    _browseRolls : function(){
      shelby.router.navigate('rolls/browse',{trigger:true});
    },

    _setSelected : function(){
      this._clearSelected();

      if (shelby.models.guide.get('displayState') == libs.shelbyGT.DisplayState.dashboard ||
          shelby.models.guide.get('displayState') == libs.shelbyGT.DisplayState.rollList) {
        var $setSelectedClassOn;
        if (shelby.models.guide.get('displayState') == libs.shelbyGT.DisplayState.rollList) {
          switch (this.model.get('content')) {
            case libs.shelbyGT.GuidePresentation.content.rolls.people :
              $setSelectedClassOn = this.$('.js-people');
              break;
            case libs.shelbyGT.GuidePresentation.content.rolls.myRolls :
              $setSelectedClassOn = this.$('.js-my-rolls');
              break;
            case libs.shelbyGT.GuidePresentation.content.rolls.browse :
              $setSelectedClassOn = this.$('.js-browse');
              break;
          }
        } else {
            $setSelectedClassOn = this.$('.js-stream');
        }

        $setSelectedClassOn.addClass('guide-presentation-content-selected');
      }
    },

    _clearSelected : function(){
      this.$('.js-content-selector button, .js-stream').removeClass('guide-presentation-content-selected');
    }

  });

} ) ();