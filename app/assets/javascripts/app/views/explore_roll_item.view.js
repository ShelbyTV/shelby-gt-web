libs.shelbyGT.ExploreRollItemView = libs.shelbyGT.ListItemView.extend({

  events : {
    "click .js-explore-link"    : "_displayFullRoll",
    "click .js-follow-unfollow" : "_followOrUnfollow"
  },

  className : 'explore-item',

  template : function(obj){
    return JST['explore-roll-item'](obj);
  },

  initialize : function() {
    shelby.models.rollFollowings.bind('add:rolls', this._onAddRollFollowings, this);
    shelby.models.rollFollowings.bind('remove:rolls', this._onRemoveRollFollowings, this);
  },

  _cleanup : function() {
    shelby.models.rollFollowings.unbind('add:rolls', this._onAddRollFollowings, this);
    shelby.models.rollFollowings.unbind('remove:rolls', this._onRemoveRollFollowings, this);
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
    return this;
  },

  _displayFullRoll : function(){
    shelby.router.navigateToRoll(this.model, {trigger:true});
  },

  _followOrUnfollow : function(){
    this.model.joinOrLeaveRoll();
  },

  _onAddRollFollowings : function(rollModel, rollFollowingsCollection, options){
    this._checkReRenderFollowButton(rollModel, true);
  },

  _onRemoveRollFollowings : function(rollModel, rollFollowingsCollection, options){
    this._checkReRenderFollowButton(rollModel, false);
  },

  _checkReRenderFollowButton : function(rollModel, wasFollowed) {
    if (rollModel.id == this.model.id) {
      //if my model was added or removed from roll followings, I need to re-render my follow button
      this.$('.js-follow-unfollow').toggleClass('command-active', !wasFollowed);
      this.$('.js-follow-unfollow').text(wasFollowed ? 'Unfollow' : 'Follow');
    }
  }

});