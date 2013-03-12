libs.shelbyGT.UserProfileView = Support.CompositeView.extend({

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
  }

});