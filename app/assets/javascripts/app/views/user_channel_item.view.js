libs.shelbyGT.UserChannelItemView = libs.shelbyGT.ActiveHighlightListItemView.extend({

  _channelListView : null,

  options : _.extend({}, libs.shelbyGT.ActiveHighlightListItemView.prototype.options, {
      activationStateProperty : 'activeFrameModel'
  }),

  className : 'list_item user-channel-item',

  initialize : function() {
    this.model.bind(libs.shelbyGT.ShelbyBaseModel.prototype.messages.fetchComplete, this._onFetchComplete, this);
  },

  _cleanup : function() {
    this.model.unbind(libs.shelbyGT.ShelbyBaseModel.prototype.messages.fetchComplete, this._onFetchComplete, this);
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