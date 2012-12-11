libs.shelbyGT.InlineDonatePromoView = Support.CompositeView.extend({

  options : {
    promoAvatarSrc : null,
    promoLinkSrc : '#',
    promoMessage : 'Click to Donate',
    promoThumbnailSrc : null,
    promoTitle : 'Support a Great Cause'
  },

  tagName : 'li',

  events : {
    "click .js-promo-link" : "_trackDonateClick"
  },

  template : function(obj){
    return SHELBYJST['inline-promo-full'](obj);
  },

  //NOTE: expecting this.model to be a roll
  render : function(){
    // headerText = 'Support Sandy Victims';
    // promoText : 'Click to donate to the Red Cross.',
    this.$el.html(this.template({
      promoAvatarSrc: this.options.promoAvatarSrc,
      promoLinkSrc : this.options.promoLinkSrc,
      promoMessage: this.options.promoMessage,
      promoThumbnailSrc: this.options.promoThumbnailSrc,
      promoTitle: this.options.promoTitle,
      roll: this.model
    }));
    shelby.track('Show donate promo', {id:this.model.id});
  },

  _trackDonateClick : function(e){
    var rollId = $(e.currentTarget).data('roll-id');
    shelby.track('Click donate promo', {id:rollId});
  }

});