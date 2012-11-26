/*
 * The singleton of this view (shelby.views.anonBanner) should be used when a user
 * tries to perform an action they must be logged in for.  If they are able to perform
 * the action, userIsAbleTo return true.  If they are not, we display a banner notification
 * and return false (and the caller should not continue processing the action).
 *
 * For example, calling shelby.views.anonBanner.userIsAbleTo(libs.shelbyGT.AnonymousActions.QUEUE)
 * when the user isAnonymous() will render an appropriate banner and return false.  If the user
 * is logged in (ie !isAnonymous()) it will not render and simply return true, indicating the user
 * should be allowed to perform the given action.
 *
 */
libs.shelbyGT.AnonBannerNotificationView = libs.shelbyGT.GenericBannerNotification.extend({

  _height : "55px",
  
  _bannerType : 0,
  
  bannerElement : function(obj){
    return SHELBYJST['anon_banner']({bannerType: this._bannerType});
  },
  
  /*
   * If user is anonymous, display the appropriate banner and return false.
   * Otherwise, render nothing and return false.
   */
  userIsAbleTo : function(action){
    if( shelby.models.user.isAnonymous() && action != libs.shelbyGT.AnonymousActions.COMMENT && action != libs.shelbyGT.AnonymousActions.SEARCH){
      this._bannerType = action;
      this.render();
      return false;
    } else {
      return true;
    }
  }
  
});

libs.shelbyGT.AnonymousActions = {
  QUEUE : 1,
  STREAM : 2,
  ROLL : 3,
  FOLLOW : 4,
  COMMENT : 5,
  ME : 6,
  SEARCH : 7
};
