libs.shelbyGT.InlineCommunityPromoView = Support.CompositeView.extend({

  tagName : 'li',

  events : {
    "click .js-goto-community" : "_gotoCommunity"
  },

  template : function(obj){
    return SHELBYJST['inline-community-promo'](obj);
  },

  render : function(){
    this.$el.html(this.template({}));
    shelby.track('Show community promo');
  },

  _gotoCommunity : function(){
    if (shelby.models.guide.get('displayIsolatedRoll')) {
      window.top.location.href = shelby.config.appUrl + '/community';
    } else {
      shelby.router.navigate('community', {trigger:true});
    }
    shelby.track('Click community promo');
  }

});
