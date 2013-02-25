libs.shelbyGT.UserProfileInfoView = Support.CompositeView.extend({

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
        className : 'animate_module media_module js-inactivity-preemption user_profile_persistent_video_info__wrapper',
        guide : shelby.models.guide,
        guideOverlayModel : shelby.models.guideOverlay,
        playlistManager : shelby.models.playlistManager,
        queuedVideos : shelby.models.queuedVideos,
        showNextFrame : false,
        userDesires : shelby.models.userDesires
      }));
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
  }

});