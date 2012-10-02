libs.shelbyGT.InStreamExplorePromoView = Support.CompositeView.extend({

  tagName : 'li',

  events : {
    "click .js-goto-explore" : "_gotoExplore"
  },

  template : function(obj){
    return JST['in-stream-explore-promo'](obj);
  },

  render : function(){
    this.$el.html(this.template({}));
  },

  _gotoExplore : function(){
    shelby.router.navigate('explore', {trigger:true});
  }

});