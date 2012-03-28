ViewStateModel = Model({
  
});

View1 = View({
  
  initialize : function(){
    ViewStateModel.bind('change:x', this.render, this);
  },

  events : {
    "click .button" : "changeX" //here .button does not belong to any child Views
  },

  changeX : function(){
    ViewStateModel.set('x', this.someModel);
  }

});

View2 = View({

  initialize : function(){
    ViewStateModel.bind('change:x', this.render, this);
  },

  events : {
    "click .button" : "changeX" //here .button does not belong to any child Views
  },

  changeX : function(){
    ViewStateModel.set('x', this.someModel);
  }

});

View3 = View({
  /*
   * Although I can affect ViewStateModels' state
   * I don't render any of it
   */

  initialize : function(){
  },

  events : {
    "click .button" : "changeX" //here .button does not belong to any child Views
  },

  changeX : function(){
    ViewStateModel.set('x', this.someModel);
  }

});
