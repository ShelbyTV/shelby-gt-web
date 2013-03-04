libs.shelbyGT.UserChannelItemView = libs.shelbyGT.ActiveHighlightListItemView.extend({

  _channelListView : null,

  options : _.extend({}, libs.shelbyGT.ActiveHighlightListItemView.prototype.options, {
      activationStateProperty : 'activeFrameModel',
      activeClassName : 'user_roll__item--active'
  }),

  className : 'list_item user_roll__item clearfix',

  events : {
    'click .js-button-previous' : '_scrollPrevious',
    'click .js-button-next'     : '_scrollNext'
  },

  initialize : function() {
    this.model.bind(libs.shelbyGT.ShelbyBaseModel.prototype.messages.fetchComplete, this._onFetchComplete, this);
    this.options.userProfileModel.bind('change:autoLoadFrameId', this._onChangeAutoLoadFrameId, this);
    libs.shelbyGT.ActiveHighlightListItemView.prototype.initialize.call(this);
  },

  _cleanup : function() {
    this.model.unbind(libs.shelbyGT.ShelbyBaseModel.prototype.messages.fetchComplete, this._onFetchComplete, this);
    this.options.userProfileModel.unbind('change:autoLoadFrameId', this._onChangeAutoLoadFrameId, this);
    libs.shelbyGT.ActiveHighlightListItemView.prototype._cleanup.call(this);
  },

  template : function(obj){
    return SHELBYJST['user-channel-item'](obj);
  },

  render : function(){
    var self = this;

    this.$el.html(this.template({roll : this.model}));
    this._channelListView = new libs.shelbyGT.RollView({
      collapseViewedFrameGroups : false,
      fetchParams : {
        include_children : true
      },
      noMoreResultsViewProto : null,
      firstFetchLimit : shelby.config.pageLoadSizes.rollOnUserProfile.initialLoad,
      isIntervalComplete : function() {
        return false;
      },
      limit : shelby.config.pageLoadSizes.rollOnUserProfile.pagingLoad,
      listItemView : 'UserChannelFrameItemView',
      model : this.model
    });
    this.appendChildInto(this._channelListView, '.js-user-channel');
    this._sizeToContents();

    var autoLoadRollId = this.options.userProfileModel.get('autoLoadRollId');
    var autoLoadFrameId = this.options.userProfileModel.get('autoLoadFrameId');
    var doPlaySpecificFrame = autoLoadRollId && autoLoadFrameId;
    var fetchData = {
      limit : shelby.config.pageLoadSizes.rollOnUserProfile.initialLoad
    };
    if (doPlaySpecificFrame && this.model.id == autoLoadRollId) {
      fetchData.since_id = autoLoadFrameId;
    }
    this.model.fetch({
      data : fetchData,
      success : function(rollModel, resp){
        // if nothing is playing start playing something
        // if no special roll and frame was specifed, we want to start playing the user's personal roll from the beginning, otherwise
        // we want to play the specified roll and frame

        // if this is the desired roll and nothing is playing,
        // register this roll as the current playlist and start playing the desired frame
        var rollToPlayId = (doPlaySpecificFrame && autoLoadRollId) || (self.options.userProfileModel.get('currentUser') && self.options.userProfileModel.get('currentUser').get('personal_roll_id'));
        if (rollToPlayId && (rollToPlayId == rollModel.id) && !shelby.models.guide.get('activeFrameModel')) {
          // if this is the roll to play and nothing else is playing, register it as the current playlist
          self._channelListView.registerPlaylist();
          if (doPlaySpecificFrame) {
            // if a particular frame was specified, start playing it
            var frame = rollModel.get('frames').get(autoLoadFrameId);
            // for compatibility reasons, we only show videos from certain providers on mobile
            if (frame && (!Browser.isMobile() || frame.get('video').canPlayMobile())) {
              shelby.models.guide.set('activeFrameModel', frame);
            } else {
              // url frame id doesn't exist in this roll - notify user, then redirect to the default view of the user profile
              shelby.alert({message: "Sorry, the video you were looking for doesn't exist in this roll."});
              shelby.router.navigate('isolated-roll/' + rollToPlayId, {trigger: true, replace: true});
            }
          } else {
            // otherwise start playing from the beginning of the playlist
            shelby.models.playlistManager.trigger('playlist:start');
          }
        }
      }
    });
    return libs.shelbyGT.ActiveHighlightListItemView.prototype.render.call(this);
  },

  // override ActiveHighlightListItemView abstract method
  doActivateThisItem : function(guideModel){
    var activeFrameModel = guideModel.get('activeFrameModel');
    return activeFrameModel && activeFrameModel.has('roll') && this.model.id == activeFrameModel.get('roll').id;
  },

  _scrollPrevious : function(){
    this._scrollPage(-1);
  },

  _scrollNext : function(){
    this._scrollPage(1);
  },

  // scroll by the width of the wrapper, in other words pages forward or backwards
  // parameter direction is an integer - positive integer means scroll forward, negative integer
  // means scroll backward; magnitude of direction is the number of pages that will be scrolled
  _scrollPage : function(direction){
    // figure out how many frames are already scrolled off to the left of the wrapper's viewable area
    var $wrapper = this.$('.js-user-channel-wrapper');
    var frameWidth = this.$('.js-user-channel-item').outerWidth(true);
    var currentScrolledLeftFrames = $wrapper.scrollLeft() / frameWidth;
    // figure out what would be the leftmost viewable item after the desired amount of scrolling
    var framesPerPage = $wrapper.width() / frameWidth;
    var newScrolledLeftFrames = Math.round(currentScrolledLeftFrames + (framesPerPage * direction));
    if (newScrolledLeftFrames < 0) {
     newScrolledLeftFrames = 0;
    }
    // if we would have scrolled past the very last frame, just make the very last frame be the
    // one we are scrolling to
    var numFrames = this.$('.js-user-channel-item').length;
    if (newScrolledLeftFrames > numFrames - 1) {
      newScrolledLeftFrames = numFrames - 1;
    }

    // scroll to a particular child item so that the resulting state has the item we targeted
    // flush with the left edge of the wrapper, or alternatively the wrapper scrolled
    // all the way to the right if having the particular element we want on the left isn't
    // possible because it's too close to the end of the list
    var $itemToScrollTo = this.$('.js-user-channel-item:eq(' + newScrolledLeftFrames + ')');
    if ($itemToScrollTo.length) {
      $wrapper.scrollTo($itemToScrollTo, 500);
    }
  },

  _onFetchComplete : function(rollModel, resp){
    this._sizeToContents();
  },

  _onChangeAutoLoadFrameId : function(userProfileModel, autoLoadFrameId){
    // if we dropped from a situation where we loaded a specific frame in this roll
    // to loading the default view of this roll, we need to reload this roll
    if(!autoLoadFrameId && userProfileModel.previous('autoLoadRollId') == this.model.id) {
      this.render();
    }
  },

  // _sizeToContents - since this is a horizontal scrolling container, we need to explicitly set its width
  // to match the combined width of its contents when that quantity changes
  _sizeToContents : function(){
    var $userChannels = this.$('.js-user-channel-item');
    var newWidth = ($userChannels.length * $userChannels.outerWidth(true));
    var $loadMoreIndicator = this.$('.js-load-more:visible');
    if ($loadMoreIndicator.length) {
      newWidth += this.$('.js-load-more').outerWidth(true);
    }
    this.$('.js-user-channel').width(newWidth);
  }

});