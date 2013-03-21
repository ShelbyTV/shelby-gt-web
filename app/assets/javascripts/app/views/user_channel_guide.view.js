libs.shelbyGT.UserChannelGuideView = Support.CompositeView.extend({

  options : {
    userChannelsCollectionModel : null
  },

  template : function(obj){
    return SHELBYJST['user-channel-guide'](obj);
  },

  initialize : function(){
    this.model.bind('change:currentUser', this._onCurrentUserChange, this);
    if (this.model.has('currentUser')) {
      this.model.get('currentUser').bind('change:id nickname', this.render, this);
    }
    this.options.userDesiresModel.bind('change:changeChannel', this._changeRoll, this);
  },

  _cleanup : function(){
    this.model.unbind('change:currentUser', this._onCurrentUserChange, this);
    if (this.model.has('currentUser')) {
      this.model.get('currentUser').unbind('change:id nickname', this.render, this);
    }
    this.options.userDesiresModel.unbind('change:changeChannel', this._changeRoll, this);
  },

  render : function(){
    this._leaveChildren();
    this.$el.html(this.template({user:this.model.get('currentUser')}));

    var currentUser = this.model.get('currentUser');
    if (currentUser && !currentUser.isNew()) {
      this.renderChild(new libs.shelbyGT.ListView({
        collectionAttribute : 'rolls',
        doStaticRender : true,
        el : '.js-user-channel-list',
        listItemViewAdditionalParams : {
          activationStateModel : shelby.models.guide,
          userProfileModel : this.model
        },
        listItemView : 'UserChannelItemView',
        model : this.options.userChannelsCollectionModel
      }));
    }
  },

  _onCurrentUserChange : function(userProfileModel, currentUser) {
    this.render();
    if (currentUser) {
      currentUser.bind('change:id nickname', this.render, this);
    }
    var previousUser = userProfileModel.previous('currentUser');
    if (previousUser) {
      previousUser.unbind('change:id nickname', this.render, this);
    }
  },

  _changeRoll : function(userDesiresModel, changeChannel) {
    if (changeChannel && this.options.guideModel.get('displayState') == libs.shelbyGT.DisplayState.dotTv) {
      var changeToRoll;
      if (shelby.models.playlistManager.get('playlistType') == libs.shelbyGT.PlaylistType.roll) {
        // return shelby.models.playlistManager.get('playlistRollId');
        if (changeChannel > 0) {
          changeToRoll = this.options.userChannelsCollectionModel.get('rolls').getNextRoll(shelby.models.playlistManager.get('playlistRollId'));
        } else {
          changeToRoll = this.options.userChannelsCollectionModel.get('rolls').getPreviousRoll(shelby.models.playlistManager.get('playlistRollId'));
        }
      } else {
        changeToRoll = this.options.userChannelsCollectionModel.get('rolls').first();
      }

      var changeToFrame = null;
      if (changeToRoll) {
        changeToFrame = changeToRoll.get('frames').first();
      }

      if (changeToFrame) {
        // dismiss the dot tv welcome banner if its still there
        shelby.models.dotTvWelcome.trigger('dismiss');
        // activate the current frame
        shelby.models.guide.set('activeFrameModel', changeToFrame);
        // if the video player has been obscured at all,
        // scroll to the top so you can see the new video that's been selected
        var videoPlayerTop = $('.js-videoplayer').offset().top;
        if ($('body').scrollTop() > videoPlayerTop || $('html').scrollTop() > videoPlayerTop) {
          $('html, body').scrollTo(0, 500);
        }
        // signal the roll view for the new playing roll to register itself as the current playlist
        this.model.trigger('playRoll:' + changeToRoll.id);
      }
    }
  }

});