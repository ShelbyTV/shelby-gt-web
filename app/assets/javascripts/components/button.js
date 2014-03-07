$(function(){
  Shelby.BaseButtonModel = Backbone.Model.extend({

  });


  Shelby.BaseButtonView = Backbone.View.extend({

  });

  Shelby.ButtonView = Shelby.BaseButtonView.extend({

    el: $('.js-button-view'),

    events: {
      'click' : 'clickButton'
    },

    initialize: function(){
      console.log('new button',this);
      return $('<button/>');
    },

    clickButton: function(){

    },

    log: function() {
      console.log(this);
    }
  });
});
