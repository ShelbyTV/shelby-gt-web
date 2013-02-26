libs.shelbyGT.UserProfileInfoView = Support.CompositeView.extend({

  events : {
    "click .js-follow-button:not(.js-busy)" : "_followOrUnfollowRoll",
    "click .js-subscribe-button"            : "_onSubscribe",
  },

  template : function(obj){
    return SHELBYJST['user-profile-info'](obj);
  },

  initialize : function(){
    this.model.bind('change:currentUser', this._onCurrentUserChange, this);
    if (this.model.has('currentUser')) {
      this.model.get('currentUser').bind('change', this.render, this);
    }
    this.options.guideModel.bind('change:activeFrameModel', this._onActiveFrameModelChange, this);
  },

  _cleanup : function(){
    this.model.unbind('change:currentUser', this._onCurrentUserChange, this);
    if (this.model.has('currentUser')) {
      this.model.get('currentUser').unbind('change', this.render, this);
    }
    this.options.guideModel.unbind('change:activeFrameModel', this._onActiveFrameModelChange, this);
  },

  render : function(){
    var currentUser = this.model.get('currentUser');
    this._leaveChildren();
    this.$el.html(this.template({
      user : currentUser,
      frame : this.options.guideModel.get('activeFrameModel')
    }));
    if (currentUser && !currentUser.isNew()) {
      this.appendChild(new libs.shelbyGT.PersistentVideoInfoView({
        className : 'animate_module media_module js-inactivity-preemption persistent_video_info__wrapper--dot-tv',
        guide : shelby.models.guide,
        guideOverlayModel : shelby.models.guideOverlay,
        playlistManager : shelby.models.playlistManager,
        queuedVideos : shelby.models.queuedVideos,
        showNextFrame : false,
        userDesires : shelby.models.userDesires
      }));
      this._updateFollowButton();
    }
  },

  _onCurrentUserChange : function(userProfileModel, currentUser) {
    this.render();
    if (currentUser) {
      currentUser.bind('change', this.render, this);
    }
    var previousUser = userProfileModel.previous('currentUser');
    if (previousUser) {
      previousUser.unbind('change', this.render, this);
    }
  },

  _onActiveFrameModelChange : function(guideModel, activeFrameModel) {
    var rollTitle = activeFrameModel && activeFrameModel.has('roll') && activeFrameModel.get('roll').get('title');
    this.$('.js-youre-watching').text("You're watching: " + (rollTitle ? rollTitle : 'shelby.tv'));
    this._updateFollowButton();
  },

  _followOrUnfollowRoll : function(e) {
    var self = this;
    var currentRollModel = this.options.guideModel.get('activeFrameModel').get('roll');

    var $thisButton = $(e.currentTarget);
    // immediately toggle the button - if the ajax fails, we'll update the next time we render
    var isUnfollow = $thisButton.toggleClass('js-roll-unfollow button_green button_gray-medium').hasClass('js-roll-unfollow');
    var wasUnfollow = !isUnfollow;
    // even though the inverse action is now described by the button, we prevent click handling
    // with class js-busy until the ajax completes
    $thisButton.text(isUnfollow ? 'Unfollow' : 'Follow').addClass('js-busy');
    // now that we've told the user that their action has succeeded, let's fire off the ajax to
    // actually do what they want, which will very likely succeed
    var clearBusyFunction = function() {
      $thisButton.removeClass('js-busy');
    };
    if (wasUnfollow) {
      currentRollModel.leaveRoll(clearBusyFunction, clearBusyFunction);
    } else {
      currentRollModel.joinRoll(clearBusyFunction, clearBusyFunction);
    }
  },

  _updateFollowButton : function() {
     var activeFrameModel = this.options.guideModel.get('activeFrameModel');
     var currentRoll = activeFrameModel && activeFrameModel.get('roll');
     if (currentRoll) {
       if (libs.shelbyGT.viewHelpers.roll.isFaux(currentRoll)){
         this.$('.js-follow-button').hide();
       } else if (currentRoll.get('creator_id') === shelby.models.user.id ||
                  !shelby.models.rollFollowings.has('initialized')){
         this.$('.js-follow-button').hide();
       } else {
         var userFollowingRoll = shelby.models.rollFollowings.containsRoll(currentRoll);
         this.$('.js-follow-button').toggleClass('js-roll-unfollow button_gray-medium', userFollowingRoll)
           .toggleClass('button_green', !userFollowingRoll)
           .text(userFollowingRoll ? 'Unfollow' : 'Follow').show();
       }
    } else {
      this.$('.js-follow-button').hide();
    }
   },

  _onSubscribe: function(){
    var currentRoll = this.options.guideModel.get('activeFrameModel').get('roll');

    var href = "/subscribe-via-email/roll/"+currentRoll.id+"?roll_title="+currentRoll.get('title')+"&curator="+currentRoll.get('creator_nickname'),
    width = 700,
    height = 500,
    left = (screen.width/2)-(width/2),
    top = (screen.height/2)-(height/2);
    window.open(href,
      "subscribePopup",
      "menubar=no,toolbar=no,status=no,width="+width+",height="+height+",toolbar=no,left="+left+",top="+top);

    shelby.trackEx({
     providers : ['ga'],
     gaCategory : 'User Profile',
     gaAction : 'subscribe-via-email-click',
     gaLabel : shelby.models.user.get('nickname')});
    return false;
  }

});