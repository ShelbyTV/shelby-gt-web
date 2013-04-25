libs.shelbyGT.RollHeaderView = Support.CompositeView.extend({

  _currentlyDisplayedUser : null,

  className : 'roll-header clearfix',

  events : {
    "click .js-user-roll"      : "_goToUserPersonalRoll",
    "click .js-user-likes"     : "_goToLikes",
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
    if (!this._currentlyDisplayedUser.has('name')) {
      this._currentlyDisplayedUser.bind('change', this.render, this);
      this._currentlyDisplayedUser.fetch();
    }

    if (this.model.has('roll_type')) {
      this.$el.html(this.template({
        isInAppUserProfile : this.options.guideModel.displayState == libs.shelbyGT.DisplayState.watchLaterRoll ||
                             this.options.guideModel.displayState == libs.shelbyGT.DisplayState.rollList ||
                             this.model.get('creator_id') == shelby.models.user.id,
        roll : this.model,
        tabActive : 'likes',
        user : this._currentlyDisplayedUser
      }));
    }
    shelby.models.guide.trigger('reposition');
  },

  _goToUserPersonalRoll : function(e){
    e.preventDefault();
    shelby.router.navigate(this.model.get('creator_nickname'), {trigger: true});
  },

  _goToLikes : function(e){
    e.preventDefault();
    shelby.router.navigate('likes', {trigger: true});
  },

  _goToRollFollowings : function(e){
    e.preventDefault();
    shelby.router.navigate('following', {trigger: true});
  }

});
