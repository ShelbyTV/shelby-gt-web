/*
 * Presents a full-width div above (not over) the web app pushing the extension or bookmarklet
 * based on what browser we're in.  Uses app_progress to determine if it should render or not.
 *
 * DEBT/NOTE: You could abstract a BannerNotificationView out of here and make this a subclass.
 *            It should be able to handle/prioritize multiple notifications.
 *            But it's not necessary right now and would be over-engineering.
 */
 
libs.shelbyGT.ExtensionBannerNotification = Support.CompositeView.extend({
  
  _appProgressKey: "hasExtension",
  
  events : {
    "click #js-dismiss-extension-banner" : "_dismissExtensionBanner"
  },
  
  el : '#js-notification-banner-wrapper',
  
  _height: "50px",
  
  _chromeExtensionTemplate : function(obj){
    return JST['notification-banners/chrome-extension'](obj);
  },
  
  _bookmarketTemplate : function(obj){
    return JST['notification-banners/bookmarklet'](obj);
  },
  
  initialize : function(){
    if( !shelby.models.user.get('app_progress').get(this._appProgressKey) ){
      this.render();
    }
  },
  
  render : function(){
    this._originalWrapperTop = $("#js-shelby-wrapper").css('top');
    $("#js-shelby-wrapper").css({top: this._height});
    
    if( Browser.isChrome() && false ){
      // disabled until we have the extension in the chrome store
      this.$el.html(this._chromeExtensionTemplate());
    }
    else {
      this.$el.html(this._bookmarketTemplate());
    }
    
    this.$el.show();
  },
  
  unRender : function(){
    $("#js-shelby-wrapper").css({top: this._originalWrapperTop});
    this._leaveChildren();
    this.$el.hide();
  },
  
  _dismissExtensionBanner : function(){
    this._unRender();
    this._updateAppProgress(true);
  },
  
  _updateAppProgress : function(hasExtension){
    shelby.models.user.get('app_progress').set(this._appProgressKey, hasExtension);
    shelby.models.user.get('app_progress').saveMe();
  }
  
});