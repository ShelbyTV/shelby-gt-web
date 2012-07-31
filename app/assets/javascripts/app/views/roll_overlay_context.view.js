libs.shelbyGT.RollOverlayContextView = Support.CompositeView.extend({

  events : {
    "click .js-follow-button.guide-overlay-context-button-highlighted" : "_followRoll",
    "click .js-follow-button:not(.guide-overlay-context-button-highlighted)" : "_unFollowRoll",
    "click .js-full-shelby-button" : "_goFullShelby",
  },

  template : function(obj){
    return JST['wide-thumbnail-overlay'](obj);
  },

  initialize : function(){
    this.model.bind('change', this._onRollChange, this);
    shelby.models.rollFollowings.bind('add:rolls remove:rolls', this._updateFollowButton, this);
  },

  _cleanup : function(){
    this.model.unbind('change', this._onRollChange, this);
    shelby.models.rollFollowings.unbind('add:rolls remove:rolls', this._updateFollowButton, this);
  },

  render : function(){
    var first_frame_thumbnail = null;
    var showThumbnail;
    if (this.model.has('frame_count')) {
      //we use the presence of the frame_count as a handy way to know that the model has had all of its data loaded
      //from the server at least once
      showThumbnail = true;
			if( this.model.get('first_frame_thumbnail_url') ){
		    var first_frame_thumbnail = this.model.get('first_frame_thumbnail_url');
			}
    } else {
      //if the roll model data has never been loaded from the server don't even show a thumbnail, wait
      //until a subsequent load triggers a refresh
      showThumbnail = false;
    }

    this.$el.html(this.template({
      creatorName : this.model.get('creator_nickname'),
      showThumbnail : showThumbnail,
      thumbnail : first_frame_thumbnail,
      title : this.model.get('title')
    }));

    var showFollowButton = this.model.has('creator_id') && (this.model.get('creator_id') != shelby.models.user.id);
    this.$('.guide-overlay-context-overview').before(JST['iso-roll-buttons']({showFollowButton:showFollowButton}));

    this._updateFullShelbyButton();
    this._updateFollowButton();
  },

  _followRoll : function() {
    if (!shelby.models.user.get('anon')) {
      this.model.joinRoll();
    } else {
      window.top.location.href = shelby.config.appUrl;
    }
  },

  _unFollowRoll : function() {
    if (!shelby.models.user.get('anon')) {
      this.model.leaveRoll();
    } else {
      window.top.location.href = shelby.config.appUrl;
    }
  },

  _goFullShelby : function() {
    if (!shelby.models.user.get('anon')) {
      window.top.location.href = shelby.config.appUrl + '/roll/' + this.model.id;
    } else {
      window.top.location.href = shelby.config.appUrl;
    }
  },

  _updateFullShelbyButton : function() {
    this.$('.js-full-shelby-button').text(shelby.models.user.get('anon') ? 'Join Shelby' : 'Guide');
  },

  _updateFollowButton : function() {
    var text;
    var doButtonHighlight;
    if (!this.model || !shelby.models.rollFollowings.has('initialized')) {
      this.$('.js-follow-button').hide();
      return;
    }
    if (shelby.models.user.get('anon')) {
      text = "Follow";
      doButtonHighlight = true;
    } else {
      var followingRoll = shelby.models.rollFollowings.containsRoll(this.model);
      if (followingRoll) {
        text = "Unfollow";
        doButtonHighlight = false;
      } else {
        text = "Follow";
        doButtonHighlight = true;
      }
    }
    var addOrRemoveClass = doButtonHighlight ? 'addClass' : 'removeClass';
    this.$('.js-follow-button').text(text)[addOrRemoveClass]('guide-overlay-context-button-highlighted');
    this.$('.js-follow-button').show();
  },

  _onRollChange : function(rollModel) {
    var _changedAttrs = _(rollModel.changedAttributes());
    if (_changedAttrs.has('title') ||
        _changedAttrs.has('creator_nickname') ||
        _changedAttrs.has('frames') ||
        _changedAttrs.has('creator_id')) {
      this.render();
    }
  }

});
