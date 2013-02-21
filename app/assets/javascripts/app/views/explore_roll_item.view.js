libs.shelbyGT.ExploreRollItemView = libs.shelbyGT.ListItemView.extend({

  events : {
    "click .js-explore-link"                  : "_displayFullRoll",
    "click .js-follow-unfollow:not(.js-busy)" : "_followOrUnfollow"
  },

  className : 'explore-item',

  _spinnerView : null,

  template : function(obj){
    return SHELBYJST['explore-roll-item'](obj);
  },

  initialize : function(){
    shelby.models.guide.bind('change:displayState', this._onChangeDisplayState, this);
    shelby.models.rollFollowings.bind('change:initialized', this._onRollFollowingsInitialized, this);

    // Explore view lazy loads the frames, so grab them if we need to
    if(this.model.get('frames').length === 0){
      var self = this;
      this.model.fetch({
        success: function(roll, response){
          self._leaveChildren();
          self.render();
        }
      });
    }
  },

  _cleanup : function(){
    shelby.models.guide.unbind('change:displayState', this._onChangeDisplayState, this);
    shelby.models.rollFollowings.unbind('change:initialized', this._onRollFollowingsInitialized, this);
  },

  render : function(){
    var userFollowingRoll = shelby.models.rollFollowings.containsRoll(this.model);
    this.$el.html(this.template({
      roll : this.model,
      userFollowingRoll : userFollowingRoll
    }));
    if (!userFollowingRoll) {
      this.$('.js-follow-unfollow').addClass('button_blue').removeClass('button_gray-medium');
    }
    this.appendChildInto(new libs.shelbyGT.ExploreFrameListView({model: this.model}), '.explore-roll');

    return this;
  },

  _displayFullRoll : function(){
    shelby.models.routingState.set('forceFramePlay', true);
    shelby.router.navigateToRoll(this.model, {trigger:true});
  },

  _followOrUnfollow : function(){
    if( !shelby.views.anonBanner.userIsAbleTo(libs.shelbyGT.AnonymousActions.FOLLOW) ){ return; }

    var self = this;
    var $thisButton = this.$('.js-follow-unfollow');

    // immediately toggle the button - if the ajax fails, we'll update the next time we render
    var isCommandActive = $thisButton.toggleClass('button_blue').toggleClass('button_gray-medium').hasClass('button_blue');
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
  },

  _onChangeDisplayState : function(guideModel, displayState) {
    // if we're switching to explore view from another view, make sure our follow button
    // representation matches any changes that might have been made in other views
    if (guideModel.previousAttributes('displayState') &&
        displayState == libs.shelbyGT.DisplayState.explore) {
      this._checkUpdateFollowButton();
    }
  },

  _onRollFollowingsInitialized : function(rollFollowingsModel, initialized) {
    if (initialized) {
      this._checkUpdateFollowButton();
    }
  },

  _checkUpdateFollowButton : function() {
    var userFollowingRoll = shelby.models.rollFollowings.containsRoll(this.model);
    this.$('.js-follow-unfollow').toggleClass('button_blue', !userFollowingRoll).toggleClass('button_gray-medium', userFollowingRoll).text(userFollowingRoll ? 'Unfollow' : 'Follow');
  }

});