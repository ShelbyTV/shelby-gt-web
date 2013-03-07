( function(){

  /*
  // shorten names of included library prototypes
  var RollFilterControlsView = libs.shelbyGT.RollFilterControlsView;
  */

  libs.shelbyGT.GuidePresentationSelectorView = Support.CompositeView.extend({

    events : {
      "click .js-stream:not(.active-item)"   : "_goToStream",
      "click .js-queue:not(.active-item)"    : "_goToQueue",
      "click .js-channels"                   : "_goToChannels",
      "click .js-me:not(.active-item)"       : "_goToMe",
      "click .js-mail"                       : "_goToMail",
      "click .js-admin"                      : "_goToAdmin"
    },

    /*el : '#js-guide-presentation-selector',*/

    template : function(obj){
      return SHELBYJST['guide-presentation-selector'](obj);
    },

    initialize : function(){
      this.model.bind('change', this._onGuideModelChanged, this);
    },

    _cleanup : function(){
      this.model.unbind('change', this._onGuideModelChanged, this);
    },

    render : function(){
      this.$el.html(this.template({user:shelby.models.user}));
      this.renderChild(new libs.shelbyGT.InviteFormView({
        el : this.$('.js-guide-invite'),
        model : shelby.models.invite,
        user : shelby.models.user
      }));
      this.renderChild(new libs.shelbyGT.GuidePresentationSearchView({
        el : this.$('.js-guide-search')
      }));
      this.renderChild(new libs.shelbyGT.ChannelInfoOverlayView({
        el: this.$('.js-channels-menu'),
        model : shelby.models.guide,
        playlistManagerModel : shelby.models.playlistManager
      }));
      if(shelby.models.user.isAnonymous()){ this._adjustForAnonymousUser(); }
      this._setSelected();
    },

    _goToStream : function(e){
      if( shelby.views.anonBanner.userIsAbleTo(libs.shelbyGT.AnonymousActions.STREAM) ){
        shelby.router.navigate('stream', {trigger: true});
        shelby.models.userDesires.set({guideShown: true});
      }
    },

    _goToChannels : function(e) {
      shelby.router.navigate(
        "channels",
        {trigger:true}
      );
    },

    _goToQueue : function(e){
      if( shelby.views.anonBanner.userIsAbleTo(libs.shelbyGT.AnonymousActions.QUEUE) ){
        shelby.router.navigate('likes', {trigger: true});
        shelby.models.userDesires.set({guideShown: true});
      }
    },

    _goToMe : function(){
      if( shelby.views.anonBanner.userIsAbleTo(libs.shelbyGT.AnonymousActions.ME) ){
        shelby.router.navigate('me', {trigger:true});
        shelby.models.userDesires.set({guideShown: true});
      }
    },

    _goToMail : function(){
      if( shelby.views.anonBanner.userIsAbleTo(libs.shelbyGT.AnonymousActions.MAIL) ){
        window.open("/mail", "_shelbyMail");
      }
    },

    _goToAdmin : function(){
      document.location = "http://api.shelby.tv/admin/new_users";
    },

    _onGuideModelChanged : function(model){
      var _changedAttrs = _(model.changedAttributes());
      // only update selection rendering if relevant attribtues have been updated
      if (_changedAttrs.has('displayState')) {
        this._setSelected();
        if (model.get('displayState') == libs.shelbyGT.DisplayState.onboarding) {
          //don't show any of the menus during onboarding
          this.$('.js-content-selector').hide();
        } else {
          this.$('.js-content-selector').show();
        }

        // show the channel  info header nav
        if (model.get('displayState') == libs.shelbyGT.DisplayState.channel) {
          $('.channel-info-section').slideDown('fast');
        }
        else {
          $('.channel-info-section').slideUp('fast');
        }
      }
    },

    _setSelected : function(){
      this._clearSelected();

      var $setSelectedClassOn = null;
      if (this.model.get('displayState') == libs.shelbyGT.DisplayState.rollList) {
        $setSelectedClassOn = this.$('.js-me');
      } else if (this.model.get('displayState') == libs.shelbyGT.DisplayState.dashboard) {
        $setSelectedClassOn = this.$('.js-stream');
      } else if (this.model.get('displayState') == libs.shelbyGT.DisplayState.channel) {
        $setSelectedClassOn = this.$('.js-channels');
      } else if (this.model.get('displayState') == libs.shelbyGT.DisplayState.watchLaterRoll) {
        $setSelectedClassOn = this.$('.js-queue');
      } else if (this.model.get('displayState') == libs.shelbyGT.DisplayState.search) {
        $setSelectedClassOn = this.$('.js-search');
      }

      if ($setSelectedClassOn) {
        $setSelectedClassOn.addClass('active-item');
      }
    },

    _clearSelected : function(){
      this.$('.js-content-selector button').removeClass('active-item');
    },

    _adjustForAnonymousUser : function(){
      this.$('.js-guide-settings').hide();
      this.$('.js-guide-invite').hide();
    }

  });

} ) ();
