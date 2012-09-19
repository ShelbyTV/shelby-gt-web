libs.shelbyGT.RollOverlayContextView = Support.CompositeView.extend({

  events : {
    "click .js-follow-button:not(.js-busy)" : "_followOrUnfollow",
    "click .js-full-shelby-button" : "_goFullShelby"
  },

  className : 'guide-header-lining clearfix',

  template : function(obj){
    return JST['guide-header-lining'](obj);
  },

  initialize : function(){
    this.model.bind('change', this._onRollChange, this);
    shelby.models.rollFollowings.bind('change:initialized', this._onRollFollowingsInitialized, this);
  },

  _cleanup : function(){
    this.model.unbind('change', this._onRollChange, this);
    shelby.models.rollFollowings.unbind('change:initialized', this._onRollFollowingsInitialized, this);
  },

  render : function(){

    this.$el.html(this.template({
      title : this.model.get('title')
    }));
    this.$('#js-guide-title').before(JST['iso-roll-buttons']());

    this._updateFullShelbyButton();
    this._updateFollowButton();
    shelby.models.guide.trigger('reposition');
  },

 _followOrUnfollow : function() {
    var $thisButton = this.$('.js-follow-button');
    // immediately toggle the button - if the ajax fails, we'll update the next time we render
    var isFollow = $thisButton.toggleClass('guide-header-button-highlighted').hasClass('guide-header-button-highlighted');
    var wasFollow = !isFollow;
    // even though the inverse action is now described by the button, we prevent click handling
    // with class js-busy until the ajax completes
    $thisButton.text(isFollow ? 'Follow' : 'Unfollow').addClass('js-busy');

    // now that we've told the user that their action has succeeded, let's fire off the ajax to
    // actually do what they want, which will very likely succeed
    var clearBusyFunction = function() {
      $thisButton.removeClass('js-busy');
    };
    if (wasFollow) {
      this.model.joinRoll(clearBusyFunction, clearBusyFunction);
    } else {
      this.model.leaveRoll(clearBusyFunction, clearBusyFunction);
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
    this.$('.js-full-shelby-button').text(shelby.models.user.get('anon') ? 'Try Shelby.tv' : 'Home');
  },

  _updateFollowButton : function() {
    if (libs.shelbyGT.viewHelpers.roll.isFaux(this.model)){
      this.$('.js-follow-button').hide();
    } else if (this.model.get('creator_id') === shelby.models.user.id ||
               !shelby.models.rollFollowings.has('initialized')){
      this.$('.js-follow-button').hide();
    } else {
      var userFollowingRoll = shelby.models.rollFollowings.containsRoll(this.model);
      this.$('.js-follow-button').toggleClass('guide-header-button-highlighted', !userFollowingRoll)
        .text(userFollowingRoll ? 'Unfollow' : 'Follow').show();
    }
  },

  _onRollChange : function(rollModel) {
    var _changedAttrs = _(rollModel.changedAttributes());
    if (_changedAttrs.has('title') ||
        _changedAttrs.has('creator_nickname') ||
        _changedAttrs.has('frames') ||
        _changedAttrs.has('creator_id')) {
      this.render();
    }
  },

  _onRollFollowingsInitialized : function(rollFollowingsModel, initialized) {
    if (initialized) {
      this._updateFollowButton();
    }
  }

});
