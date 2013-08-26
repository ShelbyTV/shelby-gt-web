libs.shelbyGT.InlineFeaturedPromoView = Support.CompositeView.extend({

  tagName : 'li',

  events : {
    "click .js-goto-featured" : "_gotoFeatured"
  },

  template : function(obj){
    return SHELBYJST['inline-featured-promo'](obj);
  },

  render : function(){
    this.$el.html(this.template({}));
    shelby.track('Show community promo');
  },

  _gotoFeatured : function(){
    if (shelby.models.guide.get('displayIsolatedRoll')) {
      window.top.location.href = shelby.config.appUrl + '/featured';
    } else {
      shelby.router.navigate('featured', {trigger:true});
    }
    shelby.track('Click community promo');
  }

});
