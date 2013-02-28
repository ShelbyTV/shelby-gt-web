libs.shelbyGT.MainLayoutView = Support.CompositeView.extend({

  el: '.js-main-layout',

  initialize : function(){
    this.model.bind("change:displayState", this._onChangeDisplayState, this);
  },

  _cleanup : function(){
    this.model.unbind("change:displayState", this._onChangeDisplayState, this);
  },

  render : function(){
    this.renderChild(new libs.shelbyGT.GuideView({model:this.model}));
    this.renderChild(new libs.shelbyGT.UserProfileInfoView({
      el: '.js-user-info',
      guideModel: shelby.models.guide,
      model: shelby.models.userProfile
    }));
    this.renderChild(new libs.shelbyGT.UserChannelGuideView({
      el: '.js-user-channel-guide',
      guideModel: shelby.models.guide,
      model: shelby.models.userProfile,
      userChannelsCollectionModel: shelby.models.userChannels
    }));
    this.renderChild(new libs.shelbyGT.MainContentWrapperView({
      model : this.model
    }));
  },

  _onChangeDisplayState : function(guideModel, displayState) {
    this.$el.toggleClass('show-user-profile hide-player-pvi', displayState == libs.shelbyGT.DisplayState.dotTv);
  }

});