libs.shelbyGT.RollActionMenuView = Support.CompositeView.extend({

  events : {
    "click .js-roll-add-leave-button:not(.js-busy)" : "_followOrUnfollowRoll"
  },

  el : '#js-roll-action-menu',

  template : function(obj){
    return SHELBYJST['roll-action-menu'](obj);
  },

  initialize : function(){
    this.model.bind('change', this._onGuideModelChange, this);
    this.model.bind('change:currentRollModel', this._onRollModelChange, this);
    shelby.models.rollFollowings.bind('change:initialized', this._onRollFollowingsInitialized, this);
  },

  _cleanup : function(){
    this.model.unbind('change', this._onGuideModelChange, this);
    this.model.unbind('change:currentRollModel', this._onRollModelChange, this);
    shelby.models.rollFollowings.unbind('change:initialized', this._onRollFollowingsInitialized, this);
  },

  render : function(){
    this.$el.html(this.template({actionCopy: this._actionCopy}));
    if (this.model.get('displayState') == libs.shelbyGT.DisplayState.standardRoll && !this.model.get('displayIsolatedRoll')) {
      this.$el.show();
    }
    shelby.models.guide.trigger('reposition');
  },

  _onGuideModelChange : function(model){
    var _changedAttrs = _(model.changedAttributes());
    if (!_changedAttrs.has('displayState') &&
        !_changedAttrs.has('displayIsolatedRoll')) {
      return;
    }
    this._updateVisibility();
  },

  _goBack : function(){
    if( shelby.routeHistory.length > 1 ){
      window.history.back();
    } else {
      shelby.router.navigate("me");
    }
  },

  _updateVisibility : function(guideModel){
    if (this.model.get('displayState') == libs.shelbyGT.DisplayState.standardRoll && !this.model.get('displayIsolatedRoll')) {
      this.$el.show();
    } else {
      // collapse/hide child views
      this.$el.hide();
    }
    shelby.models.guide.trigger('reposition');
  },

  _followOrUnfollowRoll : function() {

    if( !shelby.views.anonBanner.userIsAbleTo(libs.shelbyGT.AnonymousActions.FOLLOW) ){ return; }
    
    var self = this;
    var currentRollModel = this.model.get('currentRollModel');

    console.log('followorunfollow',shelby.models.rollFollowings.containsRoll(currentRollModel));

    var $thisButton = this.$('.js-roll-add-leave-button');
    // immediately toggle the button - if the ajax fails, we'll update the next time we render
    var isUnfollow = $thisButton.toggleClass('rolls-leave').hasClass('rolls-leave');
    var wasUnfollow = !isUnfollow;
    // even though the inverse action is now described by the button, we prevent click handling
    // with class js-busy until the ajax completes
    $thisButton.text(isUnfollow ? 'Unfollow' : 'Follow').toggleClass('button_gray-medium',isUnfollow).addClass('js-busy');
    // now that we've told the user that their action has succeeded, let's fire off the ajax to
    // actually do what they want, which will very likely succeed
    var clearBusyFunction = function() {
      self.$('.js-roll-add-leave-button').removeClass('js-busy');
    };
    if (wasUnfollow) {
      currentRollModel.leaveRoll(clearBusyFunction, clearBusyFunction);
    } else {
      currentRollModel.joinRoll(clearBusyFunction, clearBusyFunction);
    }
  },

  _updateJoinButton : function(){
    var currentRollModel = this.model.get('currentRollModel');
    if (libs.shelbyGT.viewHelpers.roll.isFaux(currentRollModel)){
      this.$('.js-roll-add-leave-button').hide();
      shelby.models.guide.trigger('reposition');
      return;
    }
    if (!currentRollModel || currentRollModel.get('creator_id') === shelby.models.user.id ||
        !shelby.models.rollFollowings.has('initialized')){
      this.$('.js-roll-add-leave-button').hide();
    } else {
      var userFollowingRoll = shelby.models.rollFollowings.containsRoll(currentRollModel);
      console.log('current role model != me');
      this.$('.js-roll-add-leave-button').toggleClass('rolls-leave button_gray-medium', userFollowingRoll)
        .text(userFollowingRoll ? 'Unfollow' : 'Follow').show();
    }
    shelby.models.guide.trigger('reposition');
  },

  _onRollModelChange : function(guideModel, currentRollModel) {
    this._updateJoinButton();
  },

  _onRollFollowingsInitialized : function(rollFollowingsModel, initialized) {
    if (initialized) {
      this._updateJoinButton();
    }
  }

});