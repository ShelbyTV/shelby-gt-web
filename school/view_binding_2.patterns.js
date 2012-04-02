var ShelbyBaseView = Support.CompositeView.extend({
  _cleanup : function(){
    this.initialize(false);
  }
  initialize : function(bind){
    var actions = bind ? 'bind' : 'unbind';
    _.keys(this.bindings).forEach(function(event){
      this.bindings[event].on.forEach(function(bindee, ){
        bindee[action](event, this.bindings[event].do[i], this.bindings[event].context[i]);
      });
    });
  }
});

var SomeView = ShelbyBaseView.extend({
  bindings : {
    "change:x" : {
      on : [this.model, someothermodel],
      do : [this.foo, this.bar],
      context : [this, that]
    },
    "change:y" : {
      on : [this.model],
      do : [this.goo],
      context : [this]
    }
  },

  initialize : function(){
    //1.some custom stuff
    //2.call prototype initialize passing bind: true
    SheblyBaseView.prototype.initialize.call(this, true) 
  }
});
