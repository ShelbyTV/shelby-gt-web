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
    /*this.model.bind('change', this.render, this);
    this.model.bind('destroy', this.remove, this);*/
    this.render();
  },

  render : function(){
    this.$el.html(this.template({user:this.model}));
  },

  _showSubnav : function(subnavId){
    this.$(subnavId).hover(null, function(){
      $(this).hide();
    });
    this.$(subnavId).show();
  },

  showAboutSubnav : function(){
    this._showSubnav('#about-subnav');
  },

  showProfileSubnav : function(){
    this._showSubnav('#profile-subnav');
  }

  /*_cleanup : function(){
    this.model.unbind('change', this.render, this);
    this.model.unbind('destroy', this.remove, this);
    shelby.models.guide.unbind('change:activeFrameId', this._onNewActiveFrame, this);
  }*/

});
