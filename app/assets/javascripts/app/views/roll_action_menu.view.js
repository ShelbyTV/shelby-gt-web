libs.shelbyGT.RollActionMenuView = Support.CompositeView.extend({

  _currentRollModel : null,

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
  },

  _cleanup : function(){
    this.model.unbind('change', this._onGuideModelChange, this);
    this.model.unbind('change:currentRollModel', this._onRollModelChange, this);
    if (this._currentRollModel) {
      this._currentRollModel.unbind('change:creator_id', this._updateJoinButton, this);
    }
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

    var $thisButton = this.$('.js-roll-add-leave-button');
    // immediately toggle the button - if the ajax fails, we'll update the next time we render
    var isUnfollow = $thisButton.toggleClass('js-rolls-leave').hasClass('js-rolls-leave');
    var wasUnfollow = !isUnfollow;
    // even though the inverse action is now described by the button, we prevent click handling
    // with class js-busy until the ajax completes
    $thisButton.text(isUnfollow ? 'Following' : 'Follow').toggleClass('button_enabled',isUnfollow).addClass('js-busy');
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
    var currentRollModel = this._currentRollModel;
    if (shelby.models.user.isAnonymous() ||
        libs.shelbyGT.viewHelpers.roll.isFaux(currentRollModel) ||
        !currentRollModel ||
        !currentRollModel.has('creator_id') ||
        currentRollModel.get('creator_id') == shelby.models.user.id){
      this.$('.js-roll-add-leave-button').hide();
    } else {
      var userFollowingRoll = shelby.models.rollFollowings.containsRoll(currentRollModel);
      this.$('.js-roll-add-leave-button').toggleClass('js-rolls-leave button_enabled', userFollowingRoll)
        .text(userFollowingRoll ? 'Following' : 'Follow').show();
    }
    shelby.models.guide.trigger('reposition');
  },

  _onRollModelChange : function(guideModel, currentRollModel) {
    var self = this;
    if (this._currentRollModel) {
      this._currentRollModel.unbind('change:creator_id', this._updateJoinButton, this);
      this._currentRollModel = null;
    }

    this.$('.js-roll-add-leave-button').hide();
    shelby.models.guide.trigger('reposition');

    // for logged in users we need to handle the update of the follow/unfollow button
    // the button is never shown for logged out users
    if (currentRollModel && !shelby.models.user.isAnonymous()) {
      this._currentRollModel = currentRollModel;
      this._currentRollModel.bind('change:creator_id', this._updateJoinButton, this);
      // check if the user is following this roll so we can render the follow/unfollow button appropriately
      rollFollowing = new libs.shelbyGT.RollModel();
      var rollId = currentRollModel.id;
      rollFollowing.fetch({
        url : shelby.config.apiRoot + '/user/' + shelby.models.user.id + '/roll/' + rollId +'/following',
        success : function(rollModel, response) {
          if (response.status == 200) {
            // if we don't already have this roll following, insert it
            existingFollowing = shelby.models.rollFollowings.get('rolls').find(function(roll){
              return roll.id == rollId;
            });
            if (!existingFollowing) {
              libs.utils.BackboneCollectionUtils.insertAtSortedIndex(rollModel,
                shelby.models.rollFollowings.get('rolls'),
                  {searchOffset:shelby.config.db.rollFollowings.numSpecialRolls,
                    sortAttribute:shelby.config.db.rollFollowings.sortAttribute,
                    sortDirection:shelby.config.db.rollFollowings.sortDirection});
            }
          }
          self._updateJoinButton();
        }
      });
    }
  }

});
