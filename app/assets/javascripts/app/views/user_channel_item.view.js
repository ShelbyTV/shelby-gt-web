libs.shelbyGT.UserChannelItemView = libs.shelbyGT.ActiveHighlightListItemView.extend({

  _channelListView : null,

  options : _.extend({}, libs.shelbyGT.ActiveHighlightListItemView.prototype.options, {
      activationStateProperty : 'activeFrameModel',
      activeClassName : 'user-channel-item--active'
  }),

  className : 'list_item user-channel-item',

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
    var currentScrolledLeftFrames = Math.floor($wrapper.scrollLeft() / frameWidth);
    // figure out how many frames need to be scrolled past to move by one width of the wrapper
    var newLeft = ($wrapper.scrollLeft() + (direction * $wrapper.width()));
    if (newLeft < 0) {
      newLeft = 0;
    }
    var framesToBeScrolled = (newLeft - $wrapper.scrollLeft()) / frameWidth;
    // figure out which will be the leftmost viewable item after the desired amount of scrolling
    var leftMostFrame = Math.round(currentScrolledLeftFrames + framesToBeScrolled);
    if (leftMostFrame < 0) {
      leftMostFrame = 0;
    }

    // scroll to a particular child item so that the resulting state has one of the children
    // flush against either the left or right edge of the wrapper, as appropriate
    $wrapper.scrollTo(this.$('.js-user-channel-item:eq(' + leftMostFrame + ')'), 500);
  },

  _onFetchComplete : function(rollModel, resp){
    this._sizeToContents();
  },

  // _sizeToContents - since this is a horizontal scrolling container, we need to explicitly set its width
  // to match the combined width of its contents when that quantity changes
  _sizeToContents : function(){
    var $userChannels = this.$('.js-user-channel-item');
    var newWidth = ($userChannels.length * $userChannels.outerWidth(true)) +
                this.$('.js-user-channel-title').outerWidth(true) + this.$('.js-load-more').outerWidth(true);
    this.$('.js-user-channel').width(newWidth);
  }

});