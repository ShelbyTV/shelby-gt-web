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
    libs.shelbyGT.ActiveHighlightListItemView.prototype.initialize.call(this);
  },

  _cleanup : function() {
    this.model.unbind(libs.shelbyGT.ShelbyBaseModel.prototype.messages.fetchComplete, this._onFetchComplete, this);
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
    this.model.fetch({
      data : {
        limit : shelby.config.pageLoadSizes.rollOnUserProfile.initialLoad
      },
      success : function(rollModel, resp){
        // if this is the current user's personal roll and nothing is playing,
        // register this roll as the current playlist and start playing the first frame in the roll
        var currentUserPublicRollId = self.options.userProfileModel.get('currentUser') &&
                                      self.options.userProfileModel.get('currentUser').get('personal_roll_id');
        if (currentUserPublicRollId && (currentUserPublicRollId == rollModel.id) && !shelby.models.guide.get('activeFrameModel')) {
          self._channelListView.registerPlaylist();
          shelby.models.playlistManager.trigger('playlist:start');
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