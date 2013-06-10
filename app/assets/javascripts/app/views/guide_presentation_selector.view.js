( function(){

  /*
  // shorten names of included library prototypes
  var RollFilterControlsView = libs.shelbyGT.RollFilterControlsView;
  */

  libs.shelbyGT.GuidePresentationSelectorView = Support.CompositeView.extend({

    events : {
      "click .js-stream:not(.active-item)"   : "_goToStream",
      "click .js-community"                  : "_goToCommunity",
      "click .js-me"                         : "_goToMe",
      "click .js-mail"                       : "_goToMail",
      "click .js-admin"                      : "_goToAdmin"
    },

    /*el : '#js-guide-presentation-selector',*/

    template : function(obj){
      return SHELBYJST['guide-presentation-selector'](obj);
    },

    initialize : function(){
      this.model.bind('change:displayState change:currentRollModel', this._onGuideModelChanged, this);
    },

    _cleanup : function(){
      this.model.unbind('change:displayState change:currentRollModel', this._onGuideModelChanged, this);
    },

    render : function(){
      this.$el.html(this.template({user:shelby.models.user}));
      // not rendering this right now. coming back to it when we can focus on optimizing. -his
      // this.renderChild(new libs.shelbyGT.InviteFormView({
      //   el : this.$('.js-guide-invite'),
      //   model : shelby.models.invite,
      //   user : shelby.models.user
      // }));
      if(shelby.models.user.isAnonymous()){ this._adjustForAnonymousUser(); }
      this._setSelected();
    },

    _goToStream : function(e){
      if( shelby.views.anonBanner.userIsAbleTo(libs.shelbyGT.AnonymousActions.STREAM) ){
        shelby.router.navigate('stream', {trigger: true});
        shelby.models.userDesires.set({guideShown: true});
      }
    },

    _goToCommunity : function(e) {
      shelby.router.navigate(
        "community",
        {trigger:true}
      );
    },

    _goToMe : function(){
      if( shelby.views.anonBanner.userIsAbleTo(libs.shelbyGT.AnonymousActions.ME) ){
        shelby.router.navigate(shelby.models.user.get('nickname'), {trigger:true});
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

      this._setSelected();

      // cetain updates only necessary if displayState has changed
      var _changedAttrs = _(model.changedAttributes());
      if (_changedAttrs.has('displayState')) {
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
      } else if (this.model.get('displayState') == libs.shelbyGT.DisplayState.channel) {
        $setSelectedClassOn = this.$('.js-community');
      } else if (this.model.get('displayState') == libs.shelbyGT.DisplayState.watchLaterRoll) {
        $setSelectedClassOn = this.$('.js-me');
      } else if (this.model.get('displayState') == libs.shelbyGT.DisplayState.standardRoll &&
                 this.model.has('currentRollModel') && this.model.get('currentRollModel').id == shelby.models.user.get('personal_roll_id')) {
        $setSelectedClassOn = this.$('.js-me');
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
      // this.$('.js-guide-invite').hide();
    }

  });

} ) ();
