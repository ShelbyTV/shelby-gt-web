libs.shelbyGT.RollOverlayContextView = Support.CompositeView.extend({

  events : {
    "click .js-follow-button.guide-overlay-context-button-highlighted" : "_followRoll",
    "click .js-follow-button:not(.guide-overlay-context-button-highlighted)" : "_unFollowRoll",
    "click .js-full-shelby-button" : "_goFullShelby",
  },

  template : function(obj){
    return JST['overlay-context'](obj);
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
      if( this.model.get('frames') && this.model.get('frames').length > 0 && this.model.get('frames').first().get('video') ){
       first_frame_thumbnail = this.model.get('frames').first().get('video').get('thumbnail_url');
      }
    } else {
      //if the roll model data has never been loaded from the server don't even show a thumbnail, wait
      //until a subsequent load triggers a refresh
      showThumbnail = false;
    }

    var showFollowButton = this.model.has('creator_id') && (this.model.get('creator_id') != shelby.models.user.id);

    this.$el.html(this.template({
      creatorName : this.model.get('creator_nickname'),
      showThumbnail : showThumbnail,
      showFollowButton : showFollowButton,
      thumbnail : first_frame_thumbnail,
      title : this.model.get('title')
    }));

    this._updateFullShelbyButton();
    this._updateFollowButton();
  },

  _followRoll : function() {
    if (!shelby.models.user.get('anon')) {
      this.model.joinRoll();
    } else {
      window.top.location.href = 'http://gt.shelby.tv';
    }
  },

  _unFollowRoll : function() {
    if (!shelby.models.user.get('anon')) {
      this.model.leaveRoll();
    } else {
      window.top.location.href = 'http://gt.shelby.tv';
    }
  },

  _goFullShelby : function() {
    if (!shelby.models.user.get('anon')) {
      window.top.location.href = 'http://gt.shelby.tv/roll/' + this.model.id;
    } else {
      window.top.location.href = 'http://gt.shelby.tv';
    }
  },

  _updateFullShelbyButton : function() {
    this.$('.js-full-shelby-button').text(shelby.models.user.get('anon') ? 'Join Shelby' : 'Guide');
  },

  _updateFollowButton : function() {
    var text;
    var doButtonHighlight;
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
