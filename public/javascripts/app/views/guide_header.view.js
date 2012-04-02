libs.shelbyGT.GuideHeaderView = Support.CompositeView.extend({

  events : {
    "click .about" : "showAboutSubnav",
    "click .profile" : "showProfileSubnav"
  },

  el : '#header',

  template : function(obj){
    return JST['guide-header'](obj);
  },

  initialize : function(){
    this.render();
    this._setupSubnavBindings('#about-subnav', '.about');
    this._setupSubnavBindings('#profile-subnav', '.profile');
  },

  render : function(){
    this.$el.html(this.template({user:this.model}));
  },

  _showSubnav : function(subnavId){
    this.$(subnavId).show();
  },

  _setupSubnavBindings : function(subnavId, handleId){
    var self = this;
    this.$(handleId).mouseleave(function(){
      //self.$(subnavId).hide();
    });
    this.$(subnavId).mouseenter(function(){
      $(this).show();
    });
    this.$(subnavId).mouseleave(function(){
      $(this).hide();
    });
  },

  showAboutSubnav : function(){
    this._showSubnav('#about-subnav');
  },

  showProfileSubnav : function(){
    this._showSubnav('#profile-subnav');
  }

});
