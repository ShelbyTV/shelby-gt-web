$(function(){
  Shelby.ButtonView = Backbone.View.extend({

    el: $('.js-button-view'),

    events: {
      'click .js-button' : 'clickButton',
      'dblclick .js-button' : 'log'
    },

    initialize: function(){
      console.log('rollheaderinit',this);
    },

    clickButton: function(){

    },

    log: function() {
      console.log(this);
    }
  });
});
