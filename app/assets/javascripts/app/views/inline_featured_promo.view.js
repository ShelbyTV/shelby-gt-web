libs.shelbyGT.InlineFeaturedPromoView = Support.CompositeView.extend({

  tagName : 'li',

  events : {
    "click .js-goto-featured" : "_goToExplore"
  },

  template : function(obj){
    return SHELBYJST['inline-featured-promo'](obj);
  },

  render : function(){
    this.$el.html(this.template({}));
    shelby.track('Show community promo');
  },

  _goToExplore : function(){
    if (shelby.models.guide.get('displayIsolatedRoll')) {
      window.top.location.href = shelby.config.appUrl + '/explore';
    } else {
      shelby.router.navigate('explore', {trigger:true});
    }
    shelby.track('Click community promo');
  }

});
