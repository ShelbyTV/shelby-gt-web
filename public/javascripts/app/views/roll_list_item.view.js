libs.shelbyGT.RollItemView = libs.shelbyGT.ActiveHighlightListItemView.extend({

  options : _.extend({}, libs.shelbyGT.ActiveHighlightListItemView.prototype.options, {
      activationStateProperty : 'activeFrameModel'
  }),

  events : function() {
    return this._setupEvents();
  },

  tagName : 'li',

  className : 'roll-item clearfix',

  template : function(obj){
    return this._renderTemplate(obj);
  },

  render : function(){
    this.$el.html(this.template({roll : this.model}));
    libs.shelbyGT.ActiveHighlightListItemView.prototype.render.call(this);
  },

  goToRoll : function(){
    shelby.router.navigateToRoll(this.model, {trigger:true});
  },

  // override ActiveHighlightListItemView abstract method
  doActivateThisItem : function(guideModel){
    var activeFrameModel = guideModel.get('activeFrameModel');
    if (activeFrameModel) {
      var roll = activeFrameModel.get('roll');
      if (roll && this.model.id == roll.id) {
        return true;
      }
    }
    return false;
  },

  _setupEvents : function() {
    //subclasses must override this function to return an events object for this view
    alert('Your RollItemView subclass must override _setupEvents()');
  },

  _renderTemplate : function(obj) {
    //subclasses must override this function to render a specific JST template for this view
    alert('Your RollItemView subclass must override _renderTemplate()');
  }
});
