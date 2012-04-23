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
      "click .js-help"        : "_showHelp",
      "click .js-team"        : "_showTeam",
      "click .js-legal"       : "_showLegal"
    });

    return events;
  },

  el : '#header',

  _menus : [
    {anchor: '.about', subnavId: '#about-subnav'},
    {anchor: '.profile', subnavId: '#profile-subnav'}
  ],

  template : function(obj){
    return JST['guide-header'](obj);
  },

  initialize : function(){
    this.render();
  },

  render : function(){
    this.$el.html(this.template({user:this.model}));
  },

  _selectMenu : function(menu){
    this._closeMenus();
    $(menu.subnavId).show();
  },

  _closeMenus : function(){
    _(this._menus).each(function(menu){
      $(menu.subnavId).hide();
    });
  },

  _showUserPreferences : function(){
    shelby.router.navigate('/preferences', {trigger:true});
  },

  _showHelp : function(){
    shelby.router.navigate('/help', {trigger:true});
  },

  _showTeam : function(){
    shelby.router.navigate('/team', {trigger:true});
  },

  _showLegal : function(){
    shelby.router.navigate('/legal', {trigger:true});
  }

});
