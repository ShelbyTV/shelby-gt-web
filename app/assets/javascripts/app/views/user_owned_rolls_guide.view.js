libs.shelbyGT.UserOwnedRollsGuideView = Support.CompositeView.extend({

  options : {
    userOwnedRollsCollectionModel : null
  },

  template : function(obj){
    return SHELBYJST['user-owned-roll-guide'](obj);
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
        el : '.js-user-owned-roll-list',
        listItemViewAdditionalParams : {
          activationStateModel : shelby.models.guide,
          userProfileModel : this.model
        },
        listItemView : 'UserOwnedRollItemView',
        model : this.options.userOwnedRollsCollectionModel
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
      var changeToRoll = null;
      var doDismissBanner = false;

      if (!shelby.models.playbackState.get('autoplayOnVideoDisplay')) {
        // if we're on a dot tv and the welcome banner hasn't been dismissed yet, just start playing the primary roll
        // and dismiss the banner
        shelby.models.dotTvWelcome.trigger('dismiss');
        doDismissBanner = true;
      } else if (shelby.models.playlistManager.get('playlistType') == libs.shelbyGT.PlaylistType.roll) {
        // figure out which roll to change to (one forward or back in the list)
        if (changeChannel > 0) {
          changeToRoll = this.options.userOwnedRollsCollectionModel.get('rolls').getNextRoll(shelby.models.playlistManager.get('playlistRollId'));
        } else {
          changeToRoll = this.options.userOwnedRollsCollectionModel.get('rolls').getPreviousRoll(shelby.models.playlistManager.get('playlistRollId'));
        }
      } else {
        // if we're not already playing something from this .tv, just play the first roll on the .tv
        changeToRoll = this.options.userOwnedRollsCollectionModel.get('rolls').first();
      }

      // if the roll we're supposd to change to is the same roll we're already playing, do nothing
      if (changeToRoll && (shelby.models.playlistManager.get('playlistRollId') == changeToRoll.id)) {
        return;
      }

      if (changeToRoll) {
        // dismiss the dot tv welcome banner if its still there
        shelby.models.dotTvWelcome.trigger('dismiss');
        // signal the roll view for the new playing roll to register itself as the current playlist
        // and start playing
        this.model.trigger('playRoll:' + changeToRoll.id);
      }

      if (changeToRoll || doDismissBanner) {
        // if the video player has been obscured at all,
        // scroll to the top so you can see the new video that's been selected
        var videoPlayerTop = $('.js-videoplayer').offset().top;
        if ($('body').scrollTop() > videoPlayerTop || $('html').scrollTop() > videoPlayerTop) {
          $('html, body').scrollTo(0, 500);
        }
      }
    }
  }

});