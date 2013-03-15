/*
 * Presents a full-width div above (not over) the web app.
 *
 * Subclasses must implement banerElement() and return the appropriate JST for render()ing.
 * Will use property this._height to set banner's height (defaults to 50px).
 *
 */

libs.shelbyGT.GenericBannerNotification = Support.CompositeView.extend({

  el : '#js-notification-banner-wrapper',

  render : function(){
    if( !this._originalWrapperTop ){ this._originalWrapperTop = $("#js-shelby-wrapper").css('top'); }
    $("#js-shelby-wrapper").css({top: this._height || "50px"});

    this.$el.html(this.bannerElement());

    this.$el.css({height: this._height || "50px"});

    this.$el.show();
  },

  unRender : function(){
    $("#js-shelby-wrapper").css({top: this._originalWrapperTop});
    this._originalWrapperTop = null;
    this.$el.hide();
  }

});