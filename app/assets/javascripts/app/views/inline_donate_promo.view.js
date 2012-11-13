libs.shelbyGT.InlineDonatePromoView = Support.CompositeView.extend({

  options : {
    headerText : 'Support a Great Cause',
    linkSrc : null,
    promoText : 'Click to donate',
    thumbnailSrc : null
  },

  tagName : 'li',

  events : {
    "click .js-donate-link" : "_trackDonateClick"
  },

  template : function(obj){
    return SHELBYJST['inline-donate-promo'](obj);
  },

  //NOTE: expecting this.model to be a roll
  render : function(){
    // headerText = 'Support Sandy Victims';
    // promoText : 'Click to donate to the Red Cross.',
    this.$el.html(this.template({
      headerText : this.options.headerText,
      linkSrc : this.options.linkSrc,
      promoText : this.options.promoText,
      roll : this.model,
      thumbnailSrc : this.options.thumbnailSrc
    }));
    shelby.track('Show donate promo', {id:this.model.id});
  },

  _trackDonateClick : function(e){
    var rollId = $(e.currentTarget).data('roll_id');
    shelby.track('Click donate promo', {id:rollId});
  }

});