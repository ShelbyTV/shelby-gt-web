libs.shelbyGT.GuideHeaderView = Support.CompositeView.extend({

  events : function(){
    var self = this;
    var events = {};

    _(this._menus).each(function(menu){
      events["click " + menu.anchor] = function(){self._selectMenu(menu);};
      events["mouseenter " + menu.subnavId] = function(e){$(e.currentTarget).show();};
      events["mouseleave " + menu.subnavId] = function(e){$(e.currentTarget).hide();};
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
    _(this._menus).each(function(menu){
      $(menu.subnavId).hide();
    });
    $(menu.subnavId).show();
  }

});
