libs.shelbyGT.AppHeaderView = Support.CompositeView.extend({

  events : function(){
    var self = this;
    var events = {};

    _(this._menus).each(function(menu){
      events["click " + menu.anchor] = function(){self._selectMenu(menu);};
      events["click " + menu.subnavId + " li"] = function(){self._closeMenus();};
      events["mouseenter " + menu.subnavId] = function(e){$(e.currentTarget).show();};
      events["mouseleave " + menu.subnavId] = function(e){$(e.currentTarget).hide();};
    });

    _(events).extend({
      "click .js-preferences"                    : "_showUserPreferences",
      "click .js-signout"                        : "_signout",
      "click .js-help"                           : "_showHelp",
      "click .js-team"                           : "_showTeam",
      "click .js-legal"                          : "_showLegal",
      "click .js-home:not(.shelby-logo-no-link)" : "_showHome"
    });

    return events;
  },

  el : '#js-header',

  _menus : [
    // {anchor: '.js-settings', subnavId: '#js-settings-subnav'}
  ],

  template : function(obj){
    return JST['app-header'](obj);
  },

  initialize : function(){
    this.options.guide.bind('change:displayIsolatedRoll', this._updateVisibility, this);
    this.options.guide.bind('change:displayState', this._onChangeDisplayState, this);
  },

  _cleanup : function(){
    this.options.guide.unbind('change:displayIsolatedRoll', this._updateVisibility, this);
    this.options.guide.unbind('change:displayState', this._onChangeDisplayState, this);
  },

  render : function(){
    this._updateVisibility();
    this.$el.html(this.template({user:this.model}));
    this._updateHomeLinkState();
    if (!this.selectorView){
      this.selectorView = new libs.shelbyGT.GuidePresentationSelectorView({model:this.options.guide});
      this.appendChildInto(this.selectorView, '.guide-presentation-selector');
    }
  },

  _selectMenu : function(menu){
    this._closeMenus();
    $(menu.subnavId).show();
  },

  _updateVisibility : function(){
    if(this.options.guide.get('displayFBGeniusRoll')) {
      this.$el.show();
    }
    else if ( this.options.guide.get('displayIsolatedRoll') ){
      this.$el.hide();
    } else {
      this.$el.show();
    }
  },

  _onChangeDisplayState : function(){
    this._updateHomeLinkState();
  },

  _updateHomeLinkState : function(){
    var isOnboarding = this.options.guide.get('displayState') == libs.shelbyGT.DisplayState.onboarding;
    this.$('.js-home').toggleClass('shelby-logo-no-link', isOnboarding);
  },

  _closeMenus : function(){
    _(this._menus).each(function(menu){
      $(menu.subnavId).hide();
    });
  },

  _showHome : function(){
    shelby.router.navigate('stream', {trigger:true});
  },

  _showUserPreferences : function(){
    shelby.router.navigate('preferences', {trigger:true});
  },

  _showHelp : function(){
    shelby.router.navigate('help', {trigger:true});
  },

  _showTeam : function(){
    shelby.router.navigate('team', {trigger:true});
  },

  _showLegal : function(){
    shelby.router.navigate('legal', {trigger:true});
  },

  _signout : function(){
    document.location.href = "/signout";
  }

});
