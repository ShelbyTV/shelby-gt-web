libs.shelbyGT.InlineRollPromoView = Support.CompositeView.extend({

  tagName : 'li',

  events : {
    "click .js-goto-roll" : "_goToRoll",
    "click .js-donate-link" : "_trackDonateClick"
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
      this.$el.html(SHELBYJST['inline-donate-promo']({
        headerText : headerText,
        promoText : 'Click to donate to the Red Cross.',
        roll : this.model.at(0)
      }));
    } else if (shelby.models.user.isAnonymous()) {
      headerText = 'See video of the storm and donate to the Red Cross';
      this.$el.html(SHELBYJST['inline-sandy-promo']({
        avatarSrc : '/images/onboarding/rolls/red_cross.jpg',
        headerText : headerText,
        promoText : 'sandy.shelby.tv',
        roll : this.model.at(0)
      }));
    } else {
      headerText = 'View our latest Hashtag Roll';
      this.$el.html(SHELBYJST['inline-sandy-promo']({
        avatarSrc : '/images/onboarding/rolls/franken.jpg',
        headerText : headerText,
        promoText : '#HurricaneSandy',
        roll : this.model.at(0)
      }));
    }

    if (!onSandyRoll) {
      this.model.each(function(roll){
        shelby.track('Show roll promo', {id:roll.id});
      });
    } else {
      this.model.each(function(roll){
        shelby.track('Show donate promo', {id:roll.id});
      });
    }
  },

  _goToRoll : function(e){
    var rollId = $(e.currentTarget).data('roll_id');
    if (shelby.models.guide.get('displayIsolatedRoll')) {
      window.top.location.href = shelby.config.appUrl + '/roll/' + rollId;
    } else {
      shelby.router.navigate('roll/' + rollId, {trigger:true});
    }
    shelby.track('Click roll promo', {id:rollId});
  },

  _trackDonateClick : function(){
    var rollId = $(e.currentTarget).data('roll_id');
    shelby.track('Click donate promo', {id:rollId});
  }

});