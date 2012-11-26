( function(){

  /*
  // shorten names of included library prototypes
  var RollFilterControlsView = libs.shelbyGT.RollFilterControlsView;
  */

  libs.shelbyGT.GuidePresentationSelectorView = Support.CompositeView.extend({
    
    events : {
      "click .js-stream:not(.active-item)"   : "_goToStream",
      "click .js-queue:not(.active-item)"    : "_goToQueue",
      "click .js-me:not(.active-item)"       : "_goToMe",
      "click .js-explore:not(.active-item)"  : "_explore",
      "click .js-search:not(.active-item)"   : "_goToSearch",
      "click .js-admin"                      : "_goToAdmin",
      "click .js-now-playing"                : "_nowPlaying"
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
      if(shelby.models.user.isAnonymous()){ this._adjustForAnonymousUser(); }
      this._setSelected();
    },
    
    _goToStream : function(e){
      if( shelby.views.anonBanner.userIsAbleTo(libs.shelbyGT.AnonymousActions.STREAM) ){
        shelby.router.navigate('stream', {trigger: true});
      }
    },

    _goToQueue : function(e){
      if( shelby.views.anonBanner.userIsAbleTo(libs.shelbyGT.AnonymousActions.QUEUE) ){
        shelby.router.navigate('queue', {trigger: true});
      }
    },

    _goToSearch : function(){
      if( shelby.views.anonBanner.userIsAbleTo(libs.shelbyGT.AnonymousActions.SEARCH) ){
        shelby.router.navigate('search', {trigger: true});
      }
    },
    
    _goToMe : function(){
      if( shelby.views.anonBanner.userIsAbleTo(libs.shelbyGT.AnonymousActions.ME) ){
        shelby.router.navigate('me', {trigger:true});
      }
    },
    
    _goToAdmin : function(){
      document.location = "http://api.shelby.tv/admin/new_users";
    },
    
    _explore : function(){
      shelby.router.navigate('explore', {trigger:true});
    },
    
    _nowPlaying : function(){
      var origin = this.model.get('activeFrameModel'),
          originHasRoll = origin.has('roll'),
          userDesires = shelby.models.userDesires,
          guideVisibility = userDesires.get('guideShown'),
          playingState = shelby.models.guide.get('playingState');

      if (!guideVisibility) {
        userDesires.set('guideShown', true);
      }

      if (playingState == libs.shelbyGT.PlayingState.dashboard || !originHasRoll) {
        //if video has no roll, or it's playingstate is 'dashboard', go to stream
        shelby.router.navigate('stream', {trigger:true});
      }
      else if( originHasRoll ) {
        //otherwise go to roll
        var frameId = origin.id,
            rollId = origin.get('roll').id;
        shelby.router.navigate('roll/' + rollId + '/frame/' + frameId, {trigger:true});
      }
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
      }
    },

    _setSelected : function(){
      this._clearSelected();

      var $setSelectedClassOn = null;
      if (this.model.get('displayState') == libs.shelbyGT.DisplayState.rollList) {
        $setSelectedClassOn = this.$('.js-me');
      } else if (this.model.get('displayState') == libs.shelbyGT.DisplayState.dashboard) {
        $setSelectedClassOn = this.$('.js-stream');
      } else if (this.model.get('displayState') == libs.shelbyGT.DisplayState.explore) {
        $setSelectedClassOn = this.$('.js-explore');
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
