libs.shelbyGT.FrameGroupView = libs.shelbyGT.ActiveHighlightListItemView.extend({

  _currentFrameShortlink : null,

  // _frame : this.model.get('frame'),

  options : _.extend({}, libs.shelbyGT.ActiveHighlightListItemView.prototype.options, {
      activationStateProperty : 'activeFrameModel',
      guideOverlayModel : null,
      // playlistXxx options MUST be supplied by the parent list view
      playlistFrameGroupCollection : null, // the playlist collection that this view's frame model belongs to
      playlistManagerModel : null, // the app-wide model used to interact with the PlaylistManager
      playlistType : null // the type of playlist that this view's frame model is on: dashboard, roll, etc
  }),

  className : 'list__item',

  events : {
    "click .js-creation-date"               : "_expand",
    "click .js-goto-user-page"              : "_goToUserPage",
    "click .js-frame-activate"              : "_activate",
    "click .js-frame-source"                : "_goToSourceRoll",
    "click .js-queue-frame:not(.queued)"    : "_onClickQueue",
    "click .js-remove-frame"                : "_onClickRemoveFrame",
    "click .js-share-frame"                 : "requestShareFrame",
    "click .js-toggle-comment"              : "_toggleComment",
    "click .js-navigate-originator"         : "_navigateOriginator"
  },

  template : function(obj){
    try {
    if (obj.frameGroup.get('collapsed')) {
        return SHELBYJST['frame-collapsed'](obj);
      }
      else {
        return SHELBYJST['frame'](obj);
      }
    } catch(e){
      console.log(e.message, e.stack, obj);
    }
  },

  initialize : function() {
    this._setupTeardownModelBindings(this.model, true);
    libs.shelbyGT.ActiveHighlightListItemView.prototype.initialize.call(this);
  },

  _cleanup : function(){
    this._setupTeardownModelBindings(this.model, false);
    libs.shelbyGT.ActiveHighlightListItemView.prototype._cleanup.call(this);
  },

  _onQueuedVideosAdd : function(video){
    this._onAddRemoveQueuedVideo(video);
  },

  _onQueuedVideosRemove : function(video){
    this._onAddRemoveQueuedVideo(video, true);
  },

  _onAddRemoveQueuedVideo : function(video, removeVideo) {
    if (!this.model) return false;
    var frame = this.model.getFirstFrame();
    var frameVideo = frame.get('video');
    if (frameVideo.id == video.id ||
        (frame.get('mockFrame') && frameVideo.get('provider_id') == video.get('provider_id') && frameVideo.get('provider_name') == video.get('provider_name'))){
      // this video is the one being added/removed
      // in case it got updated from somewhere else, update my button
      this.$('.js-queue-frame').toggleClass('queued', !removeVideo);
      this.$('.js-queue-frame .label').text(!removeVideo ? 'Liked' : 'Like');
      this.$('.js-queue-frame .icon').toggleClass('icon-like--red', !removeVideo);
    }
  },

  _setupTeardownModelBindings : function(model, bind) {
    var action;
    if (bind) {
      action = 'bind';
    } else {
      action = 'unbind';
    }

    var groupFirstFrame = model.getFirstFrame();
    groupFirstFrame[action]('change', this.render, this);
    groupFirstFrame.get('conversation') && groupFirstFrame.get('conversation')[action]('change', this.render, this);
    groupFirstFrame.get('video')[action]('change:thumbnail_url', this.render, this);
    model.get('frames')[action]('change', this.render, this);
    model.get('frames')[action]('add', this.render, this);
    model.get('frames')[action]('destroy', this.render, this);
    model[action]('change', this.render, this);
    shelby.models.queuedVideos[action]('add:queued_videos', this._onQueuedVideosAdd, this);
    shelby.models.queuedVideos[action]('remove:queued_videos', this._onQueuedVideosRemove, this);
  },

  render : function(){
    var self = this;
    this._leaveChildren();

    if (this.model.get('frames').length){

      var frame = this.model.get('frames').at(0),
          messages = ((frame.get('conversation') && frame.get('conversation').get('messages')) || new Backbone.Collection());
          //N.B. template({}) receives Models.
          //i.e. frame, video, user, creator, messages, etc.
          //so, JST should only .get() object vals from models

      var emailBody;
      var tweetIntentParams = {};
      if (shelby.models.user.isAnonymous()) {
        var permalink = libs.shelbyGT.viewHelpers.frameGroup.contextAppropriatePermalink(this.model);
        emailBody = permalink + "?utm_campaign=email-share";
        tweetIntentParams = {
          text : 'Check out this video',
          url : permalink
        };
      }

      this.$el.html(this.template({
        anonUserShareEmailBody : emailBody,
        creator                : frame.get('creator'),
        currentFrame           : frame,
        currentFrameShortlink  : this._currentFrameShortlink,
        dupeFrames             : this.model.getDuplicateFramesToDisplay(),
        eventTrackingCategory  : '',
        frame                  : frame,
        frameGroup             : this.model,
        frameOriginator        : frame.get('originator'),
        messages               : messages,
        queuedVideosModel      : shelby.models.queuedVideos,
        options                : this.options,
        tweetIntentQueryString : $.param(tweetIntentParams),
        user                   : shelby.models.user,
        video                  : frame.get('video')
      }));

      this.renderChild(new libs.shelbyGT.FrameLikesView({
        el : this.$('.js-frame-likes'),
        model : this.model
      }));

      this.renderChild(new libs.shelbyGT.FrameRollersView({
        el : this.$('.js-frame-rollers'),
        model : this.model
      }));

      libs.shelbyGT.ActiveHighlightListItemView.prototype.render.call(this);
    }

  },

  _expand: function(){
    if (this.model.get('collapsed')) {
      this.model.unset('collapsed');
      this.render();
    }
  },

  _activate : function(){
    if (this.model.get('collapsed')) {
      this._expand();
      return false;
    }

    var frame = this.model.getFirstFrame();
    // activate the current frame
    shelby.models.guide.set('activeFrameModel', frame);
    // register the playlist this frame is on as the current playlist with the playlist manager
    var _playlistRollId = null;
    if (this.options.playlistType == libs.shelbyGT.PlaylistType.roll) {
      _playlistRollId = frame.get('roll').id;
    } else if (this.options.playlistType == libs.shelbyGT.PlaylistType.channel) {
      _playlistRollId = shelby.models.dashboard.get('channel');
    }
    this.options.playlistManagerModel.set({
      playlistFrameGroupCollection : this.options.playlistFrameGroupCollection,
      playlistType : this.options.playlistType,
      playlistRollId : _playlistRollId
    });

    // if we're on a .tv, track clicks on frames
    if ($('body').hasClass('js-isolated-roll')) {
      // determine whether this frame is on the user's personal roll or some other roll they created
      // for GA tracking purposes we'll use a binary integer value - 0 means on personal roll, 1 means on some other roll
      var onSecondaryRollBinary;
      if (frame.has('roll')) {
        var rollType = frame.get('roll').get('roll_type');
        if (rollType == libs.shelbyGT.RollModel.TYPES.special_public_real_user ||
            rollType == libs.shelbyGT.RollModel.TYPES.special_public_upgraded) {
          onSecondaryRollBinary = 0;
        } else {
          onSecondaryRollBinary = 1;
        }
      } else {
        onSecondaryRollBinary = 1;
      }
      // now call the event tracking code, using the binary we calculated as the event value
      shelby.trackEx({
        gaCategory : '.TV',
        gaAction : 'Click on frame',
        gaLabel : shelby.models.user.get('nickname'),
        gaValue : onSecondaryRollBinary
      });
    }
  },

  // override ActiveHighlightListItemView abstract method
  doActivateThisItem : function(guideModel){
    var activeFrameModel = guideModel.get('activeFrameModel');
    if (activeFrameModel && this.model.get('frames').any(function(frame){return frame.id == activeFrameModel.id;})) {
      this._expand();
      return true;
    } else {
      return false;
    }
  },

  requestShareFrame : function(){
    this.options.guideOverlayModel.switchOrHideOverlay(
      libs.shelbyGT.GuideOverlayType.rolling,
      this.model.getFirstFrame(),
      this.model.get('primaryDashboardEntry')
    );
  },

  _onClickQueue : function(){
    if( !shelby.views.anonBanner.userIsAbleTo(libs.shelbyGT.AnonymousActions.QUEUE) ){ return; }

    self = this;
    this.model.getFirstFrame().like();
    // immediately change the button state
    this.$('.js-queue-frame').addClass('queued');
    this.$('.js-queue-frame .label').text('Liked');
    this.$('.js-queue-frame .icon').addClass('icon-like--red');
  },

  _onClickRemoveFrame : function(){
    var self = this;

    shelby.dialog(
      {
        message: '<p>Are you sure you want to <strong>remove</strong> this video?</p>',
        button_primary : {
          title: 'Remove Video'
        },
        button_secondary : {
          title: 'Cancel!'
        }
      },
      function(returnValue){
        if(returnValue == libs.shelbyGT.notificationStateModel.ReturnValueButtonPrimary) {
          self._removeFrame();
        }
      }
    );
  },

  _removeFrame : function(){
    var activeFrameModel = shelby.models.guide.get('activeFrameModel');
    var destroyingActiveFrame = activeFrameModel && this.model.get('frames').any(function(frame){
      return frame.id == activeFrameModel.id;
    });
    this.model.destroy();
    // if user destroys the currently playing frame, kick on to the next one
    if (destroyingActiveFrame){
      Backbone.Events.trigger('playback:next');
    }
  },

  _goToUserPage : function(e){
    if (this.model.get('collapsed')) {
      this._expand();
      return;
    }

    shelby.router.navigate($(e.currentTarget).data('user_nickname'), {trigger:true});

  },

  _goToSourceRoll : function(){
    if (this.model.get('collapsed')) {
      this._expand();
      return;
    }

    if (this.model.getFirstFrame().isOnRoll(shelby.models.user.get('heart_roll_id')) ||
        this.model.getFirstFrame().isOnRoll(shelby.models.user.get('watch_later_roll_id'))) {
      // if the frame is on the heart or queue roll we actually want to go to the roll
      // that this frame was hearted or queued FROM
      var ancestorId = _(this.model.getFirstFrame().get('frame_ancestors')).last();
      shelby.router.navigate('rollFromFrame/' + ancestorId, {trigger:true});
    } else {
      shelby.router.navigateToRoll(this.model.getFirstFrame().get('roll'), {trigger:true});
    }
  },

  _toggleComment : function(e){
    // if the click was on an anchor within the frame comment just let the normal
    // link handling occur without showing/hiding the rest of the comment
    if (!$(e.target).is('a')) {
      $(e.currentTarget).toggleClass('line-clamp--open');
    }
  },

  _getFrameShortlink : function() {
    var frame = this.model.get('frames').at(0);

    if (!frame.get('mockFrame')) {
      var self = this;
      var $shortlinkTextInput = this.$('.js-frame-shortlink');
      var fetchShortlinkUrl;
      var dbEntry = this.model.get('primaryDashboardEntry');
      if (dbEntry) {
        fetchShortlinkUrl = shelby.config.apiRoot + '/dashboard/' + dbEntry.id + '/short_link';
      } else {
        fetchShortlinkUrl = shelby.config.apiRoot + '/frame/' + frame.id + '/short_link';
      }
      // fetch the short link
      $.ajax({
        url: fetchShortlinkUrl,
        dataType: 'jsonp',
        success: function(r){
          $shortlinkTextInput.val(r.result.short_link).select();
          // save the link for future reference in case we are going to
          // re-render without changing frames
          self._currentFrameShortlink = r.result.short_link;
        },
        error: function(){
          $shortlinkTextInput.val("Link Unavailable").select();
        }
      });
    }
  },

  //ListItemView overrides
  isMyModel : function(model) {
    return this.model == model;
  },

  _navigateOriginator : function(e) {
    e.preventDefault();

    shelby.router.navigate(this.model.get('frames').at(0).get('originator').get('nickname'),{trigger:true});
  }
});
