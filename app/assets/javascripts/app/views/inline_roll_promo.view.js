libs.shelbyGT.InlineRollPromoView = Support.CompositeView.extend({

  tagName : 'li',

  events : {
    "click .js-goto-roll" : "_goToRoll"
  },

  template : function(obj){
    return SHELBYJST['inline-roll-promo'](obj);
  },

  //NOTE: expecting this.model to be a Backbone.Collection of rolls passed in to constructor
  render : function(){
    var displayedRoll = shelby.models.guide.get('currentRollModel');
    var displayState = shelby.models.guide.get('displayState');
    var onSandyRoll = displayState != libs.shelbyGT.DisplayState.dashboard && displayedRoll && displayedRoll.id == '5096790db415cc05a2006f5c';
    // var headerText = 'Discover even more great content';
    var headerText;
    if (onSandyRoll) {
      headerText = 'Support Sandy Victims';
    } else {
      headerText = 'See video of the storm and donate to the Red Cross';
    }
    this.$el.html(SHELBYJST[onSandyRoll ? 'inline-donate-promo' : 'inline-roll-promo']({
      rolls : this.model,
      headerText : headerText,
      promoText : 'Click to donate to the Red Cross.',
      roll : this.model.at(0)
    }));
    this.model.each(function(roll){
      shelby.track('Show roll promo', {id:roll.id});
    });
  },

  _goToRoll : function(e){
    var rollId = $(e.currentTarget).data('roll_id');
    if (shelby.models.guide.get('displayIsolatedRoll')) {
      window.top.location.href = shelby.config.appUrl + '/roll/' + rollId;
    } else {
      shelby.router.navigate('roll/' + rollId, {trigger:true});
    }
    shelby.track('Click roll promo', {id:rollId});
  }

});