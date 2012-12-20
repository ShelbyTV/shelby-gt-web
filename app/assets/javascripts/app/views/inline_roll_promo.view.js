libs.shelbyGT.InlineRollPromoView = Support.CompositeView.extend({

  options : {
    promoAvatarSrc : null,
    promoLinkSrc : '#',
    promoMessage : null,
    promoThumbnailSrc : null,
    promoTitle : null
  },

  tagName : 'li',

  events : {
    "click .js-promo-link" : "_goToRoll"
  },

  template : function(obj){
    return SHELBYJST['inline-promo-full'](obj);
  },

  //NOTE: expecting this.model to be a Backbone.Collection of rolls passed in to constructor
  render : function(){
    var headerText;
    var roll;
    this.$el.html(this.template({
      promoAvatarSrc: this.options.promoAvatarSrc,
      promoLinkSrc : this.options.promoLinkSrc,
      promoMessage: this.options.promoMessage,
      promoTitle: this.options.promoTitle,
      promoThumbnailSrc: this.options.promoThumbnailSrc,
      roll: this.model
    }));

    shelby.track('Show roll promo', {id:this.model.id});
  },

  _goToRoll : function(e){
    var rollId = $(e.currentTarget).data('roll-id');
    if (shelby.models.guide.get('displayIsolatedRoll')) {
      window.top.location.href = shelby.config.appUrl + '/roll/' + rollId;
    } else {
      shelby.router.navigate('roll/' + rollId, {trigger:true});
    }
    shelby.track('Click roll promo', {id:rollId});
    return false;
  }

});