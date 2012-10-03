libs.shelbyGT.InlineExplorePromoView = Support.CompositeView.extend({

  tagName : 'li',

  events : {
    "click .js-goto-explore" : "_gotoExplore"
  },

  template : function(obj){
    return JST['inline-explore-promo'](obj);
  },

  render : function(){
    this.$el.html(this.template({}));
    shelby.track('Show explore promo');
  },

  _gotoExplore : function(){
    shelby.router.navigate('explore', {trigger:true});
  }

});