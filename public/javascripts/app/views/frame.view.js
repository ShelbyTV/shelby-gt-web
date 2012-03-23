libs.shelbyGT.FrameView = ListItemView.extend({

  events : {
    "click .js-frame-activate"  : "_activate",
    "click .roll"               : "_goToRoll"
  },

  tagName : 'li',

  className : 'frame',

  template : function(obj){
    return JST['frame'](obj);
  },

  initialize : function(){
    shelby.models.guide.bind('change:activeFrameModel', this._onNewActiveFrame, this);
  },

  render : function(){
    this.$el.html(this.template({frame : this.model.toJSON()}));
  },

  _activate : function(){
    shelby.models.guide.set('activeFrameModel', this.model);
  },

  _goToRoll : function(){
    shelby.router.navigateToRoll(this.model.get('roll'), {trigger:true});
  },

  _onNewActiveFrame : function(guideModel, frame){
    if (frame == this.model) {
      this.parent.parent.$el.scrollTo(this.$el, {duration:200, axis:'y', offset:-9});
    }
  },

  _cleanup : function(){
    shelby.models.guide.unbind('change:activeFrameModel', this._onNewActiveFrame, this);
  }

});
