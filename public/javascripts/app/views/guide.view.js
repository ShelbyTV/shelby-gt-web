GuideView = Backbone.View.extend({

  // template : function(obj){
  //   return JST['frame'](obj);
  // },

  _currentSubView: null,

  initialize : function(){
    this.model.bind('change', this.render, this);
  },

  render : function(){
    console.log('Rendering',this);
    if (this._currentSubView) {
      this._currentSubView.remove();
    }    
    this._currentSubView = new RollView({model : this.model.get('current_roll')});
    $(this.el).html(this._currentSubView.el);
    this.model.get('current_roll').fetch();
  },

  selectRoll : function(model){
	this.model.set('current_roll', model);
  }

});
