( function(){

  libs.shelbyGT.AnonBannerView = Support.CompositeView.extend({

    events : {
    },

    className: 'logged-out-banner-wrapper',

    template : function(obj){
      return JST['anon_banner'](obj);
    },
    
    render : function(active){
      this.$el.html(this.template());
      if (shelby.models.user.get('anon') && !shelby.models.guide.get('displayIsolatedRoll')) {
        $('#js-shelby-wrapper').append(this.$el);
      } else {
        this.remove();
      }
    },

    displayOverlay : function(){
      this.$('.js-logged-out-overlay').show().fadeOut(2000);
    }
  });

} ) ();
