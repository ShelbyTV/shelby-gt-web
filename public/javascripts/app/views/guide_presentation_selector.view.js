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
      shelby.models.guide.bind('change:displayState', this.render, this);
    },

    _cleanup : function(){
      shelby.models.guide.unbind('change:displayState', this.render, this);
    },

    render : function(){
      this.$el.html(this.template({ config: this.model, guide: shelby.models.guide }));
      this._updateVisibility();
    },
    
    _updateVisibility : function(){
      switch(shelby.models.guide.get('displayState')){
        case libs.shelbyGT.DisplayState.rollList:
          this.$el.show();
          break;
        default:
          this.$el.hide();
      }
    },
    
    _filterPeople : function(){
      this.model.set('content', libs.shelbyGT.GuidePresentation.content.rolls.people);
      this._clearSelected();
      this.$('.js-people').addClass('selected');
    },
    
    _filterMyRolls : function(){
      this.model.set('content', libs.shelbyGT.GuidePresentation.content.rolls.myRolls);
      this._clearSelected();
      this.$('.js-my-rolls').addClass('selected');
    },
    
    _browseRolls : function(){
      this.model.set('content', libs.shelbyGT.GuidePresentation.content.rolls.browse);
      this._clearSelected();
      this.$('.js-browse').addClass('selected');
    },

    _clearSelected : function(){
      this.$('.js-content-selector li').removeClass('selected');
    }

  });

} ) ();