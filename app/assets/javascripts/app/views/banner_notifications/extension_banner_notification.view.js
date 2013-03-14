/*
 * Presents a full-width div above (not over) the web app pushing the extension or bookmarklet
 * based on what browser we're in.  Uses app_progress to determine if it should render or not.
 *
 * DEBT/NOTE: You could abstract a BannerNotificationView out of here and make this a subclass.
 *            It should be able to handle/prioritize multiple notifications.
 *            But it's not necessary right now and would be over-engineering.
 */

libs.shelbyGT.ExtensionBannerNotification = libs.shelbyGT.GenericBannerNotification.extend({

  _appProgressKey: "extension",
  _height: "40px",

  events : {
    "click .js-dismiss" : "_dismissExtensionBanner",
    "click .js-tools"   : "_navigateTools"
  },

  initialize : function(){
    if( shelby.models.user.get('app_progress').hasCompletedOnboarding() &&
        !shelby.models.user.get('app_progress').get(this._appProgressKey) ){
        this.options.guideModel.bind('change:displayState', this._onDisplayStateChange, this);
    }
  },

  bannerElement : function(){
    if( Browser.isChrome() ){
      this.$el.html(this._chromeExtensionTemplate());
    }
    else {
      this.$el.html(this._bookmarketTemplate());
    }
  },

  _cleanup : function(){
    this.options.guideModel.unbind('change:displayState', this._onDisplayStateChange, this);
  },

  _chromeExtensionTemplate : function(obj){
    return SHELBYJST['notification-banners/chrome-extension'](obj);
  },

  _bookmarketTemplate : function(obj){
    return SHELBYJST['notification-banners/bookmarklet'](obj);
  },

  _onDisplayStateChange : function(guideModel, displayState){
    if(displayState && displayState != libs.shelbyGT.DisplayState.dotTv) {
      var self = this;
      setTimeout(function(){
        self.render();
      }, 5000);

      this.options.guideModel.unbind('change:displayState', this._onDisplayStateChange, this);
    }
  },

  _dismissExtensionBanner : function(){
    this.unRender();
    this._updateAppProgress(true);
  },

  _updateAppProgress : function(hasExtension){
    shelby.models.user.get('app_progress').set(this._appProgressKey, hasExtension);
    shelby.models.user.get('app_progress').saveMe();
  },

  _navigateTools : function(){
    shelby.router.navigate('tools', {trigger:true});
    shelby.models.userDesires.set('playbackStatus',libs.shelbyGT.PlaybackStatus.paused);
  }
});