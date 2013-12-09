libs.shelbyGT.RollHeaderView = Support.CompositeView.extend({

  _currentlyDisplayedUser : null,

  className : 'roll-header clearfix',

  events : {
    "click .js-user-shares"    : "_goToUserShares",
    "click .js-user-following" : "_goToRollFollowings"
  },

  template : function(obj){
    return SHELBYJST['roll-header'](obj);
  },

  initialize : function(){
    this.model.bind('change', this.render, this);
  },

  _cleanup : function(){
    this.model.unbind('change', this.render, this);
    if (this._currentlyDisplayedUser) {
      this._currentlyDisplayedUser.unbind('change', this.render, this);
    }
  },

  render : function(){
    if (this._currentlyDisplayedUser) {
      this._currentlyDisplayedUser.unbind('change', this.render, this);
    }
    this._currentlyDisplayedUser = libs.shelbyGT.UserModel.findOrCreate({id: this.model.get('creator_id')});
    if (!this._currentlyDisplayedUser.has('nickname') && this._currentlyDisplayedUser.has('id')) {
      this._currentlyDisplayedUser.bind('change', this.render, this);
      this._currentlyDisplayedUser.fetch();
    }

    if (this.model.has('roll_type')) {
      var userPersonalRollId = shelby.models.user.get('personal_roll_id');
      var isInAppUserProfile = this.options.guideModel.get('displayState') == libs.shelbyGT.DisplayState.rollList ||
                               (userPersonalRollId && this.model.id == userPersonalRollId);
      this.$el.html(this.template({
        isInAppUserProfile : isInAppUserProfile,
        roll : this.model,
        user : this._currentlyDisplayedUser
      }));
      if (isInAppUserProfile) {
        this._setSelected();
      }
    }

    shelby.models.guide.trigger('reposition');
  },

  _setSelected : function(){
    this._clearSelected();

    var $setSelectedClassOn = null;
    var userPersonalRollId = shelby.models.user.get('personal_roll_id');
    if (this.options.guideModel.get('displayState') == libs.shelbyGT.DisplayState.rollList) {
      $setSelectedClassOn = this.$('.js-user-following');
    } else if (userPersonalRollId && this.model.id == userPersonalRollId) {
      $setSelectedClassOn = this.$('.js-user-shares');
    }

    if ($setSelectedClassOn) {
      $setSelectedClassOn.addClass('tab--active');
    }
  },

  _clearSelected : function(){
    this.$('.js-user-tab').removeClass('tab--active');
  },

  _goToUserShares : function(e){
    e.preventDefault();
    shelby.router.navigate(this.model.get('creator_nickname'), {trigger: true});
  },

  _goToRollFollowings : function(e){
    e.preventDefault();
    shelby.router.navigate('following', {trigger: true});
  }

});
