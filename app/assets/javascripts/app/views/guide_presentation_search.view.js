( function(){

  /*
  // shorten names of included library prototypes
  var RollFilterControlsView = libs.shelbyGT.RollFilterControlsView;
  */

  libs.shelbyGT.GuidePresentationSearchView = Support.CompositeView.extend({
    
    events : {
      "submit #js-nav-search-form" : "_onSearchSubmit"
    },

    template : function(obj){
      return SHELBYJST['guide-presentation-search'](obj);
    },

    render : function(){
      this.$el.html(this.template());
    },

    _onSearchSubmit : function() {
      shelby.router.navigate('search?query=' + encodeURIComponent(this.$('.js-nav-search-form-text').val()), {trigger: true});
      return false;
    }

  });

} ) ();
