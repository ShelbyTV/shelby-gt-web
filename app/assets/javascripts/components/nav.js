$(function(){
  Shelby.Navbar = Backbone.View.extend({
    options: {
      sources : { bookmarklet: 'bookmarklet', shares: 'shares', mobile: 'mobile'}
    },

    el: $('.js-content-selector'),

    events: {
      'click .js-do-nothing'            : 'doNothing',
      'click .js-stream'                : 'goToStream',
      'click .js-explore'               : 'goToExplore',
      'click .js-me'                    : 'goToMe',
      'click .js-login-dropdown-button' : 'toggleDropdown',
      'click .js-signout'               : 'goToSignout'
    },

    _navigate: function(path){
      window.location = path;
    },

    doNothing: function(e){
      e.preventDefault();
    },

    goToStream: function(e){
      e.preventDefault();
      this._navigate('/stream');
    },

    goToExplore: function(e){
      e.preventDefault();
      this._navigate('/explore');
    },

    goToMe: function(e){
      e.preventDefault();
      this._navigate('/'+Shelby.User.get('nickname'));
    },

    goToSignout: function(e){
      e.preventDefault();
      this._navigate('/signout');
    },

    toggleDropdown: function(e){
      e.preventDefault();
      var $dropdown = this.$el.find('.js-login-dropdown');

      $dropdown.toggleClass('hidden',!$dropdown.hasClass('hidden'));
    }

  });
});
