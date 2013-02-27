libs.shelbyGT.FrameGroupView = libs.shelbyGT.ActiveHighlightListItemView.extend({

  options : _.extend({}, libs.shelbyGT.ActiveHighlightListItemView.prototype.options, {
      activationStateProperty : 'activeFrameModel',
      guideOverlayModel : null,
      // playlistXxx options MUST be supplied by the parent list view
      playlistFrameGroupCollection : null, // the playlist collection that this view's frame model belongs to
      playlistManagerModel : null, // the app-wide model used to interact with the PlaylistManager
      playlistType : null // the type of playlist that this view's frame model is on: dashboard, roll, etc
  }),

  events : {
    "click .js-frame-activate"              : "_activate",
    "click .js-creation-date"               : "_expand",
    "click .js-creator-personal-roll"       : "_goToCreatorsPersonalRoll",
    "click .js-frame-source"                : "_goToSourceRoll",
    "click .js-roll-frame"                  : "requestFrameRollView",
    "click .js-frame-post"                  : "requestFBPostUI",
    "click .js-frame-send"                  : "requestFBSendUI",
    "click .js-share-frame"                 : "requestFrameShareView",
    "click .js-copy-link"                   : "_copyFrameLink",
    "click .js-remove-frame"                : "_onClickRemoveFrame",
    "click .js-video-activity-toggle"       : "_requestConversationView",
    "click .js-queue-frame:not(.queued)"    : "_onClickQueue",
    "click .js-go-to-roll-by-id"            : "_goToRollById",
    "click .js-go-to-frame-and-roll-by-id"  : "_goToFrameAndRollById",
    "click .js-toggle-comment"              : "_toggleComment",
    "click .js-share-to-facebook"           : "_shareToFacebook"
  },

  template : function(obj){
    try {
      // show different frame if coming from fb-genius app
      if (obj.options.activationStateModel.get('displayFBGeniusRoll')){
        return SHELBYJST['fb-genius-frame'](obj);
      }
      else if (obj.frameGroup.get('collapsed')) {
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
        (frame.get('isSearchResultFrame') && frameVideo.get('provider_id') == video.get('provider_id') && frameVideo.get('provider_name') == video.get('provider_name'))){
      // this video is the one being added/removed
      // in case it got updated from somewhere else, update my button
      this.$('.js-queue-frame').toggleClass('queued', !removeVideo);
      this.$('.js-queue-frame .label').text(!removeVideo ? 'Liked' : 'Like');
      this.$('.js-queue-frame i').toggleClass('icon-heart--red', !removeVideo);
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
      var likeInfo = this.model.getCombinedLikeInfo();
      var likersCollection = new libs.shelbyGT.UserCollection();
      var likersToDisplay = likeInfo.likers.models.slice(0, 9);
      if (likersToDisplay.length) {
        likersCollection.add(likersToDisplay);
      }

      var remainingLikes = likeInfo.totalLikes - likersToDisplay.length,
          frame = this.model.get('frames').at(0),
          messages = ((frame.get('conversation') && frame.get('conversation').get('messages')) || new Backbone.Collection());

          //N.B. template({}) receives Models.
          //i.e. frame, video, user, creator, messages, etc.
          //so, JST should only .get() object vals from models

      this.$el.html(this.template({
        creator           : frame.get('creator'),
        dupeFrames        : this.model.getDuplicateFramesToDisplay(),
        frameGroup        : this.model,
        frame             : frame,
        likers            : likersToDisplay,
        messages          : messages,
        queuedVideosModel : shelby.models.queuedVideos,
        options           : this.options,
        remainingLikes    : remainingLikes,
        totalLikes        : likeInfo.totalLikes,
        user              : shelby.models.user,
        video             : frame.get('video')
      }));

      if (likersToDisplay.length) {
        // render the likers' avatars, now if they've already arrived, or via event handling
        // later if the ajax hasn't returned yet
        this.renderChild(new libs.shelbyGT.ListView({
          collection : likersCollection,
          doStaticRender : true,
          el : this.$('.js-liker-avatars-list'),
          listItemView : 'LikerAvatarItemView'
        }));
      }

      libs.shelbyGT.ActiveHighlightListItemView.prototype.render.call(this);
    }

    // have FB parse any like tags on page so they render correctly
    if (typeof FB !== "undefined"){ FB.XFBML.parse(this.$el[0]); }

    // when frame is loaded, get number of disqus comments
    if (typeof DISQUSWIDGETS !== "undefined"){ DISQUSWIDGETS.getCount(); }
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
    this.options.playlistManagerModel.set({
      playlistFrameGroupCollection : this.options.playlistFrameGroupCollection,
      playlistType : this.options.playlistType,
      playlistRollId : this.options.playlistType == libs.shelbyGT.PlaylistType.roll ? frame.get('roll').id : null
    });
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

  requestFrameShareView: function(){
    if( shelby.views.anonBanner.userIsAbleTo(libs.shelbyGT.AnonymousActions.ROLL) ){
      this.options.guideOverlayModel.switchOrHideOverlay(libs.shelbyGT.GuideOverlayType.share,
        this.model.getFirstFrame());
    }
  },

  requestFrameRollView : function(){
    if( shelby.views.anonBanner.userIsAbleTo(libs.shelbyGT.AnonymousActions.ROLL) ){
      this.options.guideOverlayModel.switchOrHideOverlay(libs.shelbyGT.GuideOverlayType.rolling,
        this.model.getFirstFrame());
    }
  },

  _onClickQueue : function(){
    if( !shelby.views.anonBanner.userIsAbleTo(libs.shelbyGT.AnonymousActions.QUEUE) ){ return; }

    self = this;
    this.model.getFirstFrame().like();
    // immediately change the button state
    this.$('.js-queue-frame').addClass('queued');
    this.$('.js-queue-frame .label').text('Liked');
    this.$('.js-queue-frame i').addClass('icon-heart--red');
  },

  _copyFrameLink : function(e){
    var buttonEl = $(e.currentTarget);
    buttonEl.text("[fetching...]");

    var frameId = this.model.getFirstFrame().id;
    $.ajax({
      url: 'http://api.shelby.tv/v1/frame/'+frameId+'/short_link',
      dataType: 'jsonp',
      success: function(r){
        var inputEl = $('<input type="text" value="'+r.result.short_link+'" class="frame-option frame-shortlink" />');
        buttonEl.replaceWith(inputEl);
        inputEl.click(function(){ inputEl.select(); });
        inputEl.select();
      },
      error: function(){
        buttonEl.text("Link Unavailable");
        shelby.alert({message:"Shortlinks are currently unavailable."});
      }
    });
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

  _upvote : function(){
    var self = this;
    // check if they're already an upvoter
    if ( !_.contains(this.model.getFirstFrame().get('upvoters'), shelby.models.user.id) ) {
      this.model.getFirstFrame().upvote(function(f){
        var upvoteUsers = self.model.getFirstFrame().get('upvote_users');
        upvoteUsers.push(shelby.models.user.toJSON());
        self.model.getFirstFrame().set({upvoters: f.get('upvoters'), upvote_users: upvoteUsers });
      });
    }
  },

  _requestConversationView : function(){
    if( shelby.views.anonBanner.userIsAbleTo(libs.shelbyGT.AnonymousActions.COMMENT) ){
      this.options.guideOverlayModel.switchOrHideOverlay(libs.shelbyGT.GuideOverlayType.conversation,
        this.model.getFirstFrame());
    }
  },

  _goToCreatorsPersonalRoll : function(){
    if (this.model.get('collapsed')) {
      this._expand();
      return;
    }

    var creator = this.model.getFirstFrame().get('creator');

    if (creator) {
      shelby.router.navigate('user/' + creator.id + '/personal_roll', {trigger:true});
    }

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

  _goToRollById : function(e){
    shelby.router.navigate('roll/' + $(e.currentTarget).data('public_roll_id'), {trigger:true});
    return false;
  },

  _goToFrameAndRollById : function(e){
    shelby.router.navigate('roll/' + $(e.currentTarget).data('roll_id') + '/frame/' + $(e.currentTarget).data('frame_id'), {trigger:true});
    return false;
  },

  _toggleComment : function(e){
    // if the click was on an anchor within the frame comment just let the normal
    // link handling occur without showing/hiding the rest of the comment
    if (!$(e.target).is('a')) {
      $(e.currentTarget).toggleClass('line-clamp--open');
    }
  },

  requestFBPostUI : function(e){
    var _id = $(e.currentTarget).parents('article').attr('id');
    var _frame = this.model.get('frames').models[0];
    FB.ui(
      {
        method: 'feed',
        name: _frame.get('video').get('title'),
        link: 'http://apps.facebook.com/shelbygenius/?frame='+_frame.id+'&roll='+_frame.get('roll').id,
        picture: _frame.get('video').get('thumbnail_url'),
        description: _frame.get('video').get('description'),
        caption: ':: a shelby genius video ::'
      },
      function(response) {
        if (response && response.post_id) {
          // TODO:we should record that this happened.
        }
      }
    );

  },

  requestFBSendUI : function(e) {
    var _frame = this.model.get('frames').models[0];
    FB.ui({
      method: 'send',
      name: _frame.get('video').get('title'),
      link: 'http://apps.facebook.com/shelbygenius/?frame='+_frame.id+'&roll='+_frame.get('roll').id,
      picture: _frame.get('video').get('thumbnail_url'),
      description: _frame.get('video').get('description'),
      caption: ':: a shelby genius video ::'
    });
  },

  _shareToFacebook : function(e){
    var _id = $(e.currentTarget).parents('article').attr('id');
    var _frame = this.model.getFirstFrame();
    var _caption;
    if (_frame.has('roll')) {
      _caption = 'a video from '+_frame.get('roll').get('subdomain')+'.shelby.tv';
    }
    else {
      _caption = 'a video found with Shelby Video Search';
    }
    if (typeof FB != "undefined"){
      FB.ui(
        {
          method: 'feed',
          name: _frame.get('video').get('title'),
          link: _frame.getSubdomainPermalink(),
          picture: _frame.get('video').get('thumbnail_url'),
          description: _frame.get('video').get('description'),
          caption: _caption
        },
        function(response) {
          if (response && response.post_id) {
            // TODO:we should record that this happened.
          }
        }
      );
    }
  },

  //ListItemView overrides
  isMyModel : function(model) {
    return this.model == model;
  }

});
