( function(){

  libs.shelbyGT.AnonBannerView = Support.CompositeView.extend({

    events : {
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
    }

  });

} ) ();
