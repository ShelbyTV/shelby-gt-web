$(function(){
  Shelby.Rollheader = Backbone.View.extend({
    options: {
      sources : { bookmarklet: 'bookmarklet', shares: 'shares', mobile: 'mobile'}
    },

    el: $('.js-content-selector'),

    events: {
    },

    initialize: function(){
      console.log('rollheaderinit');
    }
  });
});
