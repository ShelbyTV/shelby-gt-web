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
  
  events : {
    "click .js-dismiss" : "_dismissExtensionBanner",
    "click .js-tools"   : "_navigateTools"
  },
  
  _height: "40px",
  
  _chromeExtensionTemplate : function(obj){
    return JST['notification-banners/chrome-extension'](obj);
  },
  
  _bookmarketTemplate : function(obj){
    return JST['notification-banners/bookmarklet'](obj);
  },
  
  initialize : function(){
    if( shelby.models.user.get('app_progress').hasCompletedOnboarding() &&
        !shelby.models.user.get('app_progress').get(this._appProgressKey) ){
      var self = this;
      setTimeout(function(){ self.render(); }, 5000);
    }
  },
  
  bannerElement : function(){
    if( Browser.isChrome() && false ){
      // disabled until we have the extension in the chrome store
      this.$el.html(this._chromeExtensionTemplate());
    }
    else {
      this.$el.html(this._bookmarketTemplate());
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