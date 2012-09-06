libs.shelbyGT.ExploreRollItemView = libs.shelbyGT.ListItemView.extend({

  events : {
    "click .js-explore-link"                  : "_displayFullRoll",
    "click .js-follow-unfollow:not(.js-busy)" : "_followOrUnfollow"
  },

  className : 'explore-item',

  template : function(obj){
    return JST['explore-roll-item'](obj);
  },

  render : function(){
    var userFollowingRoll = shelby.models.rollFollowings.containsRoll(this.model);
    this.$el.html(this.template({
      roll : this.model,
      userFollowingRoll : userFollowingRoll
    }));
    if (!userFollowingRoll) {
      this.$('.js-follow-unfollow').addClass('command-active');
    }
    this.appendChildInto(new libs.shelbyGT.ExploreFrameListView({model: this.model}), '.explore-roll');
    return this;
  },

  _displayFullRoll : function(){
    shelby.models.routingState.set('forceFramePlay', true);
    shelby.router.navigateToRoll(this.model, {trigger:true});
  },

  _followOrUnfollow : function(){
    var self = this;
    var $thisButton = this.$('.js-follow-unfollow');

    // immediately toggle the button - if the ajax fails, we'll update the next time we render
    var isCommandActive = $thisButton.toggleClass('command-active').hasClass('command-active');
    var wasCommandActive = !isCommandActive;
    // even though the inverse action is now described by the button, we prevent click handling
    // with class js-busy until the ajax completes
    $thisButton.text(isCommandActive ? 'Follow' : 'Unfollow').addClass('js-busy');

    // now that we've told the user that their action has succeeded, let's fire off the ajax to
    // actually do what they want, which will very likely succeed
    var clearBusyFunction = function() {
      self.$('.js-follow-unfollow').removeClass('js-busy');
    };

    if (wasCommandActive) {
      this.model.joinRoll(clearBusyFunction, clearBusyFunction);
    } else {
      this.model.leaveRoll(clearBusyFunction, clearBusyFunction);
    }
  }

});