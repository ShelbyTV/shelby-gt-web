libs.shelbyGT.InlineExplorePromoView = Support.CompositeView.extend({

  tagName : 'li',

  events : {
    "click .js-goto-explore" : "_gotoExplore"
  },

  template : function(obj){
    return SHELBYJST['inline-explore-promo'](obj);
  },

  render : function(){
    this.$el.html(this.template({}));
    shelby.track('Show explore promo');
  },

  _gotoExplore : function(){
    if (shelby.models.guide.get('displayIsolatedRoll')) {
      window.top.location.href = shelby.config.appUrl + '/explore';
    } else {
      shelby.router.navigate('explore', {trigger:true});
    }
    shelby.track('Click explore promo');
  }

});