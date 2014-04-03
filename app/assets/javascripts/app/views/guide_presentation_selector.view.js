( function(){

  /*
  // shorten names of included library prototypes
  var RollFilterControlsView = libs.shelbyGT.RollFilterControlsView;
  */

  libs.shelbyGT.GuidePresentationSelectorView = Support.CompositeView.extend({

    events : {
      "click .js-stream:not(.active-item)" : "_goToStream",
      "click .js-explore"                  : "_goToExplore",
      "click .js-channels"                 : "_goToChannels",
      "click .js-me"                       : "_goToMe",
      "click .js-mail"                     : "_goToMail",
      "click .js-admin"                    : "_goToAdmin",
      "click .js-navigate"                 : "_goToHref",
      "focus .js-search"                   : "_onFocusSearch",
      "blur .js-search"                    : "_onBlurSearch",
      "submit .js-search-form"             : "_onSubmitSearchForm"
    },

    /*el : '#js-guide-presentation-selector',*/

    template : function(obj){
      return SHELBYJST['guide-presentation-selector'](obj);
    },

    initialize : function(){
      this.model.bind('change:displayState change:currentRollModel', this._onGuideModelChanged, this);
      shelby.models.videoSearch.bind("change:query", this.render, this);
    },

    _cleanup : function(){
      this.model.unbind('change:displayState change:currentRollModel', this._onGuideModelChanged, this);
      shelby.models.videoSearch.unbind("change:query", this.render, this);
    },

    render : function(){
      this.$el.html(this.template({
        user: shelby.models.user,
        userNickname: libs.shelbyGT.viewHelpers.user.displayUsername(shelby.models.user)
      }));
      // not rendering this right now. coming back to it when we can focus on optimizing. -his
      // this.renderChild(new libs.shelbyGT.InviteFormView({
      //   el : this.$('.js-guide-invite'),
      //   model : shelby.models.invite,
      //   user : shelby.models.user
      // }));
      if(shelby.models.user.isNotLoggedIn()){ this._adjustForAnonymousUser(); }
      this._setSelected();
      this._searchInput = this.$el.find('.js-search').children(); //.js-search is the List item, get the innards.
    },

    _onFocusSearch : function(e){
      this._searchInput.addClass('focus');
    },

    _onBlurSearch : function(e){
      this._searchInput.removeClass('focus');
    },

    _onSubmitSearchForm : function(e){
      var query = _(this.$el.find('.js-search').find('input').val()).clean();
      if (query) {
        shelby.models.videoSearch.set('query', query);
        shelby.models.videoSearch.trigger('search');
        // event tracking
        shelby.trackEx({
          gaCategory : 'search',
          gaAction : query.toLowerCase(),
          gaLabel : shelby.models.user.get('nickname')
        });
      }
      return false;
    },

    _goToStream : function(e){
      // if( shelby.views.anonBanner.userIsAbleTo(libs.shelbyGT.AnonymousActions.STREAM) ){
        shelby.router.navigate('stream', {trigger: true});
        shelby.models.userDesires.set({guideShown: true});
      // }
    },

    _goToExplore : function(e) {
      shelby.router.navigate("/explore", {trigger:true});
    },

    _goToChannels : function(e) {
      shelby.router.navigate("/preferences/channels", {trigger:true});
    },

    _goToMe : function(){
      // if( shelby.views.anonBanner.userIsAbleTo(libs.shelbyGT.AnonymousActions.ME) ){
        shelby.router.navigate(shelby.models.user.get('nickname'), {trigger:true});
        shelby.models.userDesires.set({guideShown: true});
      // }
    },

    _goToMail : function(){
      // if( shelby.views.anonBanner.userIsAbleTo(libs.shelbyGT.AnonymousActions.MAIL) ){
        window.open("/mail", "_shelbyMail");
      // }
    },

    _goToAdmin : function(){
      document.location = "http://api.shelby.tv/admin/new_users";
    },

    _goToHref : function(e){
      e.preventDefault();

      var href = e.currentTarget.pathname;

      shelby.router.navigate(href,{trigger:true});
    },

    _onGuideModelChanged : function(model){
      this._setSelected();

      // cetain updates only necessary if displayState has changed
      var _changedAttrs = _(model.changedAttributes());
      if (_changedAttrs.has('displayState')) {
        // disable menus during service connection animation, prevent hovers on dropdowns.
        var doDisableMenus = (model.get('displayState') == libs.shelbyGT.DisplayState.serviceConnecting);

        this.$('.js-content-selector')
              .children().toggleClass('dropdown_module', !doDisableMenus)
              .children('.app_nav__button').attr('disabled', doDisableMenus);
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
        $setSelectedClassOn = this.$('.js-explore');
      // n.b. when Channels is selected, the DisplayState is userPreferences
      // however, that's not specific enough to known to display the Channels tab as "selected" in this app nav bar,
      // hence this slightly more complicated else block:
      } else if (this.model.get('displayState') == libs.shelbyGT.DisplayState.userPreferences && shelby.models.userPreferencesView.get('section') == libs.shelbyGT.DisplayState.channels) {
        $setSelectedClassOn = this.$('.js-channels');
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
