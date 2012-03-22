libs.shelbyGT.FrameView = ListItemView.extend({

  events : {
    "click .roll" : "goToRoll"
  },

  tagName : 'li',

  className : 'frame',

  template : function(obj){
    return JST['frame'](obj);
  },

  initialize : function(){
    //this.conversationView = new libs.shelbyGT.ConversationView({model : this.model.get('conversation')});
    this.model.bind('change', this.render, this);
    this.model.bind('destroy', this.remove, this);
    shelby.models.guide.bind('change:activeFrameModel', this._onNewActiveFrame, this);
  },

  render : function(active){
    this.$el.html(this.template({frame : this.model, active : active}));
  },

  goToRoll : function(){
    shelby.router.navigateToRoll(this.model.get('roll'), {trigger:true});
  },

  _onNewActiveFrame : function(guideModel, frame){
    if (guideModel.previous('activeFrameModel') == this.model) {
      // un-highlight the previously active frame
      this.render(false);
    } else if (frame == this.model) {
      // highlight the new active frame
      this.render(true);
    }
  },

  _cleanup : function(){
    this.model.unbind('change', this.render, this);
    this.model.unbind('destroy', this.remove, this);
    shelby.models.guide.unbind('change:activeFrameId', this._onNewActiveFrame, this);
  }

});
