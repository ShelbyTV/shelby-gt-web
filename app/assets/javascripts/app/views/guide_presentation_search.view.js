( function(){

  /*
  // shorten names of included library prototypes
  var RollFilterControlsView = libs.shelbyGT.RollFilterControlsView;
  */

  libs.shelbyGT.GuidePresentationSearchView = Support.CompositeView.extend({
    
    events : {
      "submit #js-nav-search-form"     : "_onSearchSubmit",
      "focus .js-nav-search-form-text" : "_onFocusTextInput",
      "blur .js-nav-search-form-text"  : "_onBlurTextInput"
    },

    template : function(obj){
      return SHELBYJST['guide-presentation-search'](obj);
    },

    render : function(){
      this.$el.html(this.template());
    },

    _onSearchSubmit : function() {
      var query = _(this.$('.js-nav-search-form-text').val()).clean();
      if (query) {
        shelby.router.navigate('search?query=' + encodeURIComponent(query), {trigger: true});
        shelby.models.userDesires.set({guideShown: true});
        this.$('.js-nav-search-form-text').val('');
      }
      return false;
    },

    _onFocusTextInput : function() {
      this._toggleFocusClass(true);
    },

    _onBlurTextInput : function() {
      this._toggleFocusClass(false);
    },

    _toggleFocusClass : function(focus) {
      this.$('.js-nav-search-form-text-wrapper').toggleClass('focused', focus);
    }

  });

} ) ();
