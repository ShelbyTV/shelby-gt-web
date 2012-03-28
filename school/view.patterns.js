// any view that will be used as a parent or child view (basically everything)
// should extend from Support.CompositeView
SampleView = Support.CompositeView.extend({

  // DOM event binding comes first, if defined
  events : {
    "click .some-class" : "_someHandler" // DOM event handlers defined as private methods
  },

  // overidden attributes come next, if defined
  tagName : 'div',

  className : 'top-level-class',

  // member functions come next, if defined
  
  // initialize and _cleanup are always the first and second functions, if defined
  // this helps us see at a glance that we are cleaning up all of our bindings correctly
  initialize : function(){
    // Backbone event handlers defined as private methods
    this.model.bind('change', this._onModelChange, this);
  },

  _cleanup : function(){
    this.model.unbind('change', this._onModelChange, this);
  },

  // private methods and event handlers come last
  _someHandler : function(){
    
  },

  _onModelChange : function(){
    
  }

});