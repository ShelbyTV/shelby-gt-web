( function(){

  /*
  // shorten names of included library prototypes
  var RollFilterControlsView = libs.shelbyGT.RollFilterControlsView;
  */

  libs.shelbyGT.GuidePresentationSelectorView = Support.CompositeView.extend({
    
    events : {
      "click .js-people" : "_filterPeople",
      "click .js-my-rolls" : "_filterMyRolls",
      "click .js-browse" : "_browseRolls"
    },

    el : '#js-guide-presentation-selector',
    
    template : function(obj){
      return JST['guide-presentation-selector'](obj);
    },

    initialize : function(){
      this.model.bind('change:content', this._onContentChange, this);
      shelby.models.guide.bind('change:displayState', this.render, this);
    },

    _cleanup : function(){
      this.model.unbind('change:content', this._onContentChange, this);
      shelby.models.guide.unbind('change:displayState', this.render, this);
    },

    render : function(){
      this.$el.html(this.template({ config: this.model, guide: shelby.models.guide }));
      this._setSelected();
      this._updateVisibility();
    },
    
    _updateVisibility : function(){
      switch(shelby.models.guide.get('displayState')){
        case libs.shelbyGT.DisplayState.rollList:
        case libs.shelbyGT.DisplayState.browseRollList:
          this.$el.show();
          break;
        default:
          this.$el.hide();
      }
    },
    
    _filterPeople : function(){
      this.model.set('content', libs.shelbyGT.GuidePresentation.content.rolls.people);
      this._clearSelected();
      this._setSelected();
    },
    
    _filterMyRolls : function(){
      this.model.set('content', libs.shelbyGT.GuidePresentation.content.rolls.myRolls);
      this._clearSelected();
      this._setSelected();
    },
    
    _browseRolls : function(){
      this.model.set('content', libs.shelbyGT.GuidePresentation.content.rolls.browse);
      this._clearSelected();
      this._setSelected();
    },

    _setSelected : function(){
      var $setSelectedClassOn;
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
      $setSelectedClassOn.addClass('guide-presentation-filter-selected');
    },

    _clearSelected : function(){
      this.$('.js-content-selector li').removeClass('guide-presentation-filter-selected');
    },

    _onContentChange : function(guidePresentationModel, content){
      var filterOnlyStates = libs.shelbyGT.GuidePresentation.content.rolls.filterOnlyStates;
      //only do something if we can't reach our desired state by filtering alone, in
      //which case we need to reroute to display a different list of rolls in the guide
      if (_(filterOnlyStates).include(guidePresentationModel.previous('content')) &&
          !_(filterOnlyStates).include(content)) {
        shelby.router.displayRollList();
      } else if (!_(filterOnlyStates).include(guidePresentationModel.previous('content')) &&
          _(filterOnlyStates).include(content)) {
        shelby.router.displayRollList();
      }
    }

  });

} ) ();