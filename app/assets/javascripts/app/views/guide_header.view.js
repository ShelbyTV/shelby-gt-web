//TODO: change my name to "app_header.view.js"

libs.shelbyGT.GuideHeaderView = Support.CompositeView.extend({

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
      "click .js-preferences" : "_showUserPreferences",
			"click .js-signout"			: "_signout",
      "click .js-help"        : "_showHelp",
      "click .js-team"        : "_showTeam",
      "click .js-legal"       : "_showLegal",
      "click .js-home"        : "_showHome"
    });

    return events;
  },

  el : '#js-header',

  _menus : [
    {anchor: '.about', subnavId: '#about-subnav'},
    {anchor: '.profile', subnavId: '#profile-subnav'}
  ],

  template : function(obj){
    return JST['guide-header'](obj);
  },

  initialize : function(){
    shelby.models.guide.bind('change:displayIsolatedRoll', this._updateVisibility, this);
    this.render();
  },

  _cleanup : function(){
    shelby.models.guide.unbind('change:displayIsolatedRoll', this._updateVisibility, this);
  },

  render : function(){
    this._updateVisibility();
    this.$el.html(this.template({user:this.model}));
    if (!this.selectorView){
      this.selectorView = new libs.shelbyGT.GuidePresentationSelectorView({model:shelby.models.guide});
      this.appendChild(this.selectorView);
    }
  },

  _selectMenu : function(menu){
    this._closeMenus();
    $(menu.subnavId).show();
  },

  _updateVisibility : function(){
    if(shelby.models.guide.get('displayIsolatedRoll')) {
        this.$el.hide();
      } else {
        this.$el.show();
    }
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
