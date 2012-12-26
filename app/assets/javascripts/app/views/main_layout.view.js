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
      el: '.js-user-info-lining',
      guideModel: shelby.models.guide,
      model: shelby.models.userForProfile
    }));
    this.renderChild(new libs.shelbyGT.UserChannelGuideView({
      el: '.js-user-channel-guide-lining',
      guideModel: shelby.models.guide,
      model: shelby.models.userForProfile,
      userChannelsCollectionModel: shelby.models.userChannels
    }));
    this.renderChild(new libs.shelbyGT.MainContentWrapperView({
      model : this.model
    }));
  },

  _onChangeDisplayState : function(guideModel, displayState) {
    this.$el.toggleClass('show-user-profile', displayState == libs.shelbyGT.DisplayState.userProfile);
  }

});