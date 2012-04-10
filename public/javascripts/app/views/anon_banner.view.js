( function(){

  libs.shelbyGT.AnonBannerView = Support.CompositeView.extend({

    events : {
      "click .js-logged-out-twitter" : "_loginWithTwitter",
      "click .js-logged-out-facebook" : "_loginWithFacebook"
    },

    //el : '',
    className: 'logged-out-banner-wrapper',

    template : function(obj){
      return JST['anon_banner'](obj);
    },

    initialize : function(){
      this.render();
    },

    render : function(active){
      this.$el.html(this.template());
      $('#wrapper').append(this.$el);
    },

    _loginWithTwitter : function(){
      console.log('logging in with twitter');
      window.location = 'http://api.gt.shelby.tv/auth/twitter';
    },

    _loginWithFacebook : function(){
      console.log('logging in with facebook');
      window.location = 'http://api.gt.shelby.tv/auth/facebook';
    }

  });

} ) ();
