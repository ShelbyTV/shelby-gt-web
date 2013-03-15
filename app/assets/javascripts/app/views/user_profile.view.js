libs.shelbyGT.UserProfileView = Support.CompositeView.extend({

  initialize : function(){
    this.model.bind('change:currentUser', this._onCurrentUserModelChange, this);
    if (this.model.has('currentUser')) {
      var currentUser = this.model.get('currentUser');
      currentUser.bind('change:id', this._onCurrentUserIdChange, this);
      if (currentUser.has('id')) {
        this._applyUserSpecialStyles(currentUser.id);
      }
    }
  },

  _cleanup : function(){
    this.model.unbind('change:currentUser', this._onCurrentUserModelChange, this);
    if (this.model.has('currentUser')) {
      this.model.get('currentUser').unbind('change:id', this._onCurrentUserIdChange, this);
    }
  },

  render : function(){
    this.renderChild(new libs.shelbyGT.AppBannerView({
      el :'.js-app-banner',
      model : this.model
    }));
    this.renderChild(new libs.shelbyGT.UserProfileInfoView({
      el: '.js-user-info',
      guideModel: shelby.models.guide,
      model: this.model
    }));
    this.renderChild(new libs.shelbyGT.UserChannelGuideView({
      el: '.js-user-channel-guide',
      guideModel: shelby.models.guide,
      model: this.model,
      userChannelsCollectionModel: shelby.models.userChannels
    }));
  },

  _onCurrentUserIdChange : function(currentUserModel, id) {
    this._applyUserSpecialStyles(id);
  },

  _onCurrentUserModelChange : function(userProfileModel, currentUser) {
    if (currentUser) {
      currentUser.bind('change:id', this._onCurrentUserIdChange, this);
    }
    var previousUser = userProfileModel.previous('currentUser');
    if (previousUser) {
      previousUser.unbind('change:id', this._onCurrentUserIdChange, this);
    }
  },

  _applyUserSpecialStyles : function(userId) {
    // remove any previously applied special user styles
    var specialUserBodyClasses = _(shelby.config.dotTvNetworks.dotTvCuratorSpecialConfig).pluck('bodyClass').join(' ');
    $('body').removeClass(specialUserBodyClasses);

    if (userId) {
      var specialConfig = _(shelby.config.dotTvNetworks.dotTvCuratorSpecialConfig).findWhere({id: userId});
      if (specialConfig && specialConfig.bodyClass) {
        $('body').addClass(specialConfig.bodyClass);
      }
    }
  }

});